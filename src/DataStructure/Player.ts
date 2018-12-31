export class Player {
    playerName: string;
    chips: number;
    folded: boolean;
    allIn: boolean;
    isSurvive: boolean;
    reloadCount: number;
    roundBet: number;
    bet: number;
    cards: Array<string>;   // 只有自己的手牌才可见 

    gameRank: number; // 0 is the rank 1
    chipsIncludeReload: number;

    static MAX_RELOAD_COUNT = 2;
    static RELOAD_CHIP = 1000;

    constructor(data) {
        this.playerName = data.playerName;
        this.chips = data.chips;
        this.folded = data.folded;
        this.allIn = data.allIn;
        this.isSurvive = data.isSurvive;
        this.reloadCount = data.reloadCount;
        this.roundBet = data.roundBet;
        this.bet = data.bet;
        this.cards = data.cards;
        this.gameRank = 0;
        this.chipsIncludeReload = this.chips + (Player.MAX_RELOAD_COUNT - this.reloadCount) * Player.RELOAD_CHIP;
    }


    static updateGameRank(players: Object) {
        if (!players || Object.keys(players).length < 1) {
            throw new Error('invalid players');
        }

        let allChips = [];

        for (const key in players) {
            if (players.hasOwnProperty(key)) {
                const player: Player = players[key];
                let chip = player.chips + (2 - player.reloadCount) * this.RELOAD_CHIP;
                allChips.push(chip);
            }
        }

        allChips.sort(function (a, b) {
            return b - a;
        });

        for (const key in players) {
            if (players.hasOwnProperty(key)) {
                const player: Player = players[key];
                let chip = player.chips + (2 - player.reloadCount) * this.RELOAD_CHIP;
                player.gameRank = allChips.indexOf(chip);
            }
        }
    }

    update(data) {
        if (typeof data.playerName === 'string') {
            this.playerName = data.playerName;
        }

        if (typeof data.chips === 'number') {
            this.chips = data.chips;
        }

        if (typeof data.folded === 'boolean') {
            this.folded = data.folded;
        }

        if (typeof data.allIn === 'boolean') {
            this.allIn = data.allIn;
        }

        if (typeof data.isSurvive === 'boolean') {
            this.isSurvive = data.isSurvive;
        }

        if (typeof data.reloadCount === 'number') {
            this.reloadCount = data.reloadCount;
        }

        if (typeof data.roundBet === 'number') {
            this.roundBet = data.roundBet;
        }

        if (typeof data.bet === 'number') {
            this.bet = data.bet;
        }

        if (Array.isArray(data.cards)) {
            this.cards = data.cards;
        }

        if (typeof data.gameRank === 'number') {
            this.gameRank = data.gameRank;
        }

        if (typeof data.chips === 'number' && typeof data.reloadCount === 'number') {
            this.chipsIncludeReload = data.chips + (Player.MAX_RELOAD_COUNT - data.reloadCount) * Player.RELOAD_CHIP;
        }
    }
}