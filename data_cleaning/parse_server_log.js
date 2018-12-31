const fs = require('fs');
const crypto = require('crypto');

function MD5(str) {
    const hash = crypto.createHash('md5');
    hash.update(str)
    return hash.digest('hex');
}

const filenames = ['20180725', '20180726', '20180727'];

for (const filename of filenames) {
    parseLogToFile(filename);
}

function parseLogToFile(logTime) {
    if (!logTime) {
        console.error('no file to read');
        process.exit(-1);
    }
    const lineReader = require('readline').createInterface({
        input: fs.createReadStream(`../logs/server/${logTime}/common.log`)
    });
    const tablePlayer = {};
    const tableRound = {};
    const tableNowRound = {};
    let gameStart = false;
    lineReader.on('line', line => {
        if (!gameStart && line.indexOf('start game') >= 0) {
            gameStart = true;
        }
        if (!gameStart) {
            const match = (/assign player ([0-9,a-z]*) .*to table (\d+)/g).exec(line);
            if (match) {
                const tableNumber = parseInt(match[2], 10);
                if (typeof tableNumber !== 'number' || isNaN(tableNumber)) {
                    console.error('invalid table number!');
                    process.exit(-1);
                }
                tablePlayer[tableNumber] = {};
                tableRound[tableNumber] = {};
                let players = match[1];
                players = players.split(',').filter(value => {
                    return value.length === 32 || value.indexOf('dummy') >= 0;
                }).map(value => {
                    return MD5(value);
                });
                tablePlayer[tableNumber] = players;
                tableNowRound[tableNumber] = 1;
            }
            return;
        }
        const newRoundMatch = (/table (\d+) .*new round : (\d+)/g).exec(line);
        if (newRoundMatch) {
            const tableNumber = parseInt(newRoundMatch[1], 10);
            const roundCount = parseInt(newRoundMatch[2], 10);
            if (typeof roundCount !== 'number' || isNaN(roundCount)) {
                console.error('invalid round count');
                process.exit(-2);
            }
            if (typeof tableNumber !== 'number' || isNaN(tableNumber)) {
                console.error('invalid round count');
                process.exit(-2);
            }
            tableRound[tableNumber][roundCount] = {};
            tableNowRound[tableNumber] = roundCount;
            for (const player of tablePlayer[tableNumber]) {
                tableRound[tableNumber][roundCount][player] = {};
            }
            return;
        }
        const actionMatch = (/table (\d+) .*player : ([0-9a-z]*), request to ([A-Z]*), .*, roundName: ([a-zA-Z]*)/g).exec(line);
        if (actionMatch) {
            const tableNumber = parseInt(actionMatch[1], 10);
            const player = actionMatch[2];
            const action = actionMatch[3];
            const roundName = actionMatch[4];
            tableRound[tableNumber][tableNowRound[tableNumber]][player][roundName + action] = 1;
            return;
        }
        const roundEndMatch = (/table (\d+) .*__round_end: (.*)/g).exec(line);
        if (roundEndMatch) {
            const tableNumber = parseInt(roundEndMatch[1], 10);
            let content = roundEndMatch[2];
            content = JSON.parse(content);
            for (const player of content.players) {
                if (!player.hand) {
                    continue;
                }
                tableRound[tableNumber][content.table.roundCount][player.playerName].rank = player.hand.rank;
            }
            return;
        }
    });
    lineReader.on('close', () => {
        fs.writeFileSync('../logs/parsed_server_log/' + logTime + '.json', JSON.stringify(tableRound));
    });
}
