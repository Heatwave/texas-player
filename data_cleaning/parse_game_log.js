const fs = require('fs');

const files = fs.readdirSync('../logs/parsed_server_log/');

let data = {};

for (const file of files) {
    if (file.indexOf('20180727') >= 0 || file === 'players') {
        continue;
    }

    let content = fs.readFileSync('../logs/parsed_server_log/' + file);
    content = JSON.parse(content);
    for (const key in content) {
        if (content.hasOwnProperty(key)) {
            const table = content[key];
            for (const round in table) {
                if (table.hasOwnProperty(round)) {
                    const players = table[round];
                    for (const player in players) {
                        if (players.hasOwnProperty(player)) {
                            const actionAndRank = players[player];

                            if (!(player in data)) {
                                data[player] = [];
                            }

                            if (Object.keys(actionAndRank).length > 0) {
                                data[player].push(
                                    { ...actionAndRank, round: parseInt(round, 10) }
                                );
                            }
                        }
                    }
                }
            }
        }
    }
}

const roundNames = ['Deal', 'Flop', 'Turn', 'River'];
const actions = ['FOLD', 'CALL', 'RAISE', 'ALLIN'];

const roundActions = [];

for (const round of roundNames) {
    for (const action of actions) {
        roundActions.push(round + action);
    }
}

for (const key in data) {
    if (data.hasOwnProperty(key)) {
        const element = data[key];
        for (const itor of element) {
            for (const ra of roundActions) {
                if (!(ra in itor)) {
                    itor[ra] = 0;
                }
            }
        }
    }
}

for (const key in data) {
    if (data.hasOwnProperty(key)) {
        let element = data[key];
        element = JSON.stringify(element);
        fs.writeFileSync('../logs/parsed_server_log/players/training/' + key + '.json', element);
    }
}