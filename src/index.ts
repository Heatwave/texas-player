import { Client } from "./client";
import { MD5 } from "./utils";
import { MyStatus } from "./DataStructure/MyStatus";
import { Table } from "./DataStructure/Table";
import { Player } from "./DataStructure/Player";
import { logger } from "./logger";
import { getHandRank } from "./compare";
import { simulate } from "./simulator";
import { Threshold } from "./DataStructure/Threshold";
import { getFearFix } from "./fix";
import * as tf from "@tensorflow/tfjs";
import { existsSync } from "fs";

const thresholds = require('../data/threshold.json');
const CONFIG = require('../data/config.json');

let myPlayerName: string;

const BASE_HAND_RANK = CONFIG.baseHandRank;     // I don't play the hand below this rank

const HAND_RANK_FIX_RATE = CONFIG.handRankFixRate;


let models = {};
let modelLoaded = false;

function loadModels(players: Object) {
    if (Object.keys(players).length <= 0) {
        return;
    }

    for (const playerName in players) {
        if (players.hasOwnProperty(playerName)) {
            if (existsSync('../data/models/' + playerName)) {
                models[playerName] = tf.loadModel('file://data/models/' + playerName);
            }
        }
    }

    modelLoaded = true;
}


// TODO: isAbleToCheck(players)

function getChipsMinbetRate(chips: number, minBet: number) {
    return chips / minBet;
}

function getOdds(myMinBet: number, totalBet: number) {
    return totalBet / myMinBet;
}

function takeActionByHand(table: Table, me: MyStatus, players: Object, playedHandRank: number, client: Client) {
    let objForLog = {
        playedHandRankBefore: playedHandRank, playedHandRankAfterFix: 0,
        potOdds: 0, handRank: 0, chipsMinbetRate: 0
    };

    try {
        const potOdds = getOdds(me.minBet, table.totalBet);
        if (potOdds >= 6) {
            const handRankFix = (table.totalBet / me.minBet) * HAND_RANK_FIX_RATE;
            playedHandRank = playedHandRank * handRankFix;
        }

        objForLog.potOdds = potOdds;
        objForLog.playedHandRankAfterFix = playedHandRank;
    } catch (error) {
        logger.error('takeActionByHand', error);
    }

    const chipsMinbetRate = getChipsMinbetRate(me.chips, me.minBet);

    console.log(`hand: ${me.cards}, handRank: ${me.handRank}, playedHandRank: ${playedHandRank}, minBet: ${me.minBet}, chipsMinbetRate: ${chipsMinbetRate}`);

    objForLog.handRank = me.handRank;
    objForLog.chipsMinbetRate = chipsMinbetRate;

    logger.info('takeActionByHand', objForLog);

    if (me.minBet <= 0) {
        return client.Check();
    }

    // TODO: if the players before my position all fold or no one in front of me, call to try
    if (chipsMinbetRate >= 15) {
        return client.Call();
    }

    if (me.handRank > playedHandRank) {
        return client.Fold();
    }

    client.Check();
}

function takeAction(table: Table, me: MyStatus, players: Object, threshold: Threshold, client: Client) {
    let win = simulate(me.cards, table.board);

    let objForLog = {
        ...me, board: table.board, winBySimulate: win, fearFix: 1,
        winAfterFearFix: 0, potOdds: 0, winAfterOddsFix: 0, chipsMinbetRate: 0
    };

    let fearFix = 1;
    try {
        fearFix = getFearFix(players, table.bigBlind.amount);
    } catch (error) {
        logger.error('getWinFix', error);
        fearFix = 1;
    }

    objForLog.fearFix = fearFix;

    win = win * fearFix;

    objForLog.winAfterFearFix = win;

    let potOdds = 0;
    try {
        potOdds = getOdds(me.minBet, table.totalBet);
    } catch (error) {
        logger.error('getOdds', error);
        potOdds = 0;
    }

    objForLog.potOdds = potOdds;

    if (potOdds >= 12) {
        win = win * 1.09;
    }

    objForLog.winAfterOddsFix = win;

    const chipsMinbetRate = getChipsMinbetRate(me.chips, me.minBet);

    objForLog.chipsMinbetRate = chipsMinbetRate;

    logger.info('finalWinRate', objForLog);

    let predictedRank = -1;

    for (const playerName in players) {
        if (players.hasOwnProperty(playerName)) {
            const player: Player = players[playerName];
            if (playerName in models) {
                const result = models[playerName].predict(tf.tensor(player.roundDataForML), [1, 17]);
                const rank = result.dataSync()[0];
                predictedRank = rank > predictedRank ? rank : predictedRank;
            }
        }
    }

    if (predictedRank >= 0) {
        let predictFix = 1 - (predictedRank / 360);
        win = win * predictFix;
    }

    console.log('hand:', me.cards, 'board:', table.board, 'potOdds:', potOdds, 'chipsMinbetRate:', chipsMinbetRate, 'win:', win);

    if (win > threshold.allin) {
        // TODO: remove AllIn
        if (potOdds >= 8) {
            client.AllIn();
        } else {
            client.Raise();
        }
        return;
    }

    // TODO: consider postion to call, e.g. no one before me or players in front of me all fold

    // TODO: add chipsMinbetRateFix, according to chipsMinbetRate and table.board.length 3 or 4 or 5
    if (win > threshold.raise) {
        client.Raise();
    } else if ((win > threshold.call) || (chipsMinbetRate >= 15 && table.board.length <= 4)) {
        client.Call();
    } else if (win > threshold.check && me.minBet <= 20) {
        client.Check();
    } else {
        client.Fold();
    }
}


function start() {
    const plainPlayerName = process.argv[2];
    if (!plainPlayerName) {
        console.log('No player name');
        process.exit(-1);
        return;
    }

    myPlayerName = MD5(plainPlayerName);

    let URL = process.argv[3];
    if (!URL) {
        console.log('No URL');
        process.exit(-1);
        return;
    }

    URL = `ws://${URL}`;

    logger.info('start', { myPlayerName: myPlayerName, URL: URL });

    const client = new Client(URL, plainPlayerName);

    client.on('socket_opened', () => {
        logger.info('socket_opened', { message: 'socket opened' });
    });

    let me = new MyStatus({
        playerName: myPlayerName,
        folded: false,
        allIn: false,
        isSurvive: true,
        reloadCount: 0,
        cards: []
    });

    let table = new Table({});

    let players = {};

    let threshold = new Threshold(thresholds.normal);

    let playedHandRank = BASE_HAND_RANK;


    client.on('__new_round', data => {
        table.update(data.table);

        console.log('round:', table.roundCount);

        data.players.forEach((player: Player) => {
            if (player.playerName === myPlayerName) {
                me.update(player);
            } else if (player.playerName in players) {
                players[player.playerName].update(player);
            } else {
                players[player.playerName] = new Player(player);
            }
        });

        if (modelLoaded === false) {
            loadModels(players);
        }

        const allPlayers = players;
        allPlayers[myPlayerName] = me;
        Player.updateGameRank(allPlayers);

        let isMeTopAndHigh = true; // is I rank 0 and chips greater then 50% to others?
        for (const key in players) {
            if (players.hasOwnProperty(key)) {
                const player: Player = players[key];
                if ((me.chipsIncludeReload * 0.5) < player.chipsIncludeReload) {
                    isMeTopAndHigh = false;
                }
            }
        }

        if (table.roundCount < 10) {
            threshold.update(thresholds.normal);
            playedHandRank = BASE_HAND_RANK * 1.5;
        } else if (isMeTopAndHigh) {
            threshold.update(thresholds.topAndHigh);
            playedHandRank = BASE_HAND_RANK * 0.5;
        } else if (me.gameRank in [0, 1, 2]) {
            threshold.update(thresholds.gameRank[me.gameRank]);
            switch (me.gameRank) {
                case 0:
                    playedHandRank = BASE_HAND_RANK * 0.6;
                    break;

                case 1:
                    playedHandRank = BASE_HAND_RANK * 0.7;
                    break;

                case 2:
                    playedHandRank = BASE_HAND_RANK * 0.8;
                    break;

                default:
                    playedHandRank = BASE_HAND_RANK;
                    break;
            }
        } else if (me.gameRank >= 4 && table.roundCount >= 25) {
            threshold.update(thresholds.normal);
            playedHandRank = BASE_HAND_RANK * 0.6;
        } else {
            threshold.update(thresholds.normal);
            playedHandRank = BASE_HAND_RANK;
        }

        me.handRank = getHandRank(me.cards);
        logger.info('__new_round_all_player', allPlayers);
    });

    client.on('__start_reload', data => {
        data.players.forEach((player: Player) => {
            if (player.playerName === myPlayerName) {
                me.update(player);
            } else if (player.playerName in players) {
                players[player.playerName].update(player);
            } else {
                players[player.playerName] = new Player(player);
            }
        });

        if (me.chips <= 200 && me.reloadCount < 2) {
            client.Reload();
        }
    });

    client.on('__bet', data => {
        // bet — 下注, 在该玩家之前没有人下注的情况下, 会询问玩家是否下注, 玩家可以拿出任意多的筹码作为赌注.
        me.update(data.self);
        const _table = {
            board: data.game.board,
            roundName: data.game.roundName,
            roundCount: data.game.roundCount,
            raiseCount: data.game.raiseCount,
            betCount: data.game.betCount
        };
        table.update(_table);

        if (table.roundName === 'Deal') {
            return takeActionByHand(table, me, players, playedHandRank, client);
        }

        if (table.board.length >= 3) {
            return takeAction(table, me, players, threshold, client);
        }

        client.Fold();
    });

    client.on('__deal', data => {
    });

    client.on('__action', data => {
        me.update(data.self);
        const _table = {
            board: data.game.board,
            roundName: data.game.roundName,
            roundCount: data.game.roundCount,
            raiseCount: data.game.raiseCount,
            betCount: data.game.betCount
        };
        table.update(_table);

        if (table.roundName === 'Deal') {
            return takeActionByHand(table, me, players, playedHandRank, client);
        }

        if (table.board.length >= 3) {
            return takeAction(table, me, players, threshold, client);
        }

        client.Fold();
    });

    client.on('__show_action', data => {
        table.update(data.table);
    });

    client.on('__round_end', data => {
    });

    client.on('__game_over', data => {
    });

    client.on('__new_peer', data => {
    });
}

start();