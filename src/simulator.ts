import { rankHandInt } from "./compare";

const ALL_POKER = require('../data/all-pokers.json');

const SIMU_COUNT = 30000;

export function simulate(hand: Array<String>, board: Array<String>): number {
    const all: Array<string> = JSON.parse(JSON.stringify(ALL_POKER));
    const my = hand.concat(board);
    const left = all.filter(item => {
        return my.indexOf(item) < 0;
    });

    const rank = rankHandInt({
        cards: my
    }).rank;

    let win = 0;

    for (let index = 0; index < SIMU_COUNT; index++) {
        const pos0 = Math.floor((Math.random() * left.length));
        let pos1 = Math.floor((Math.random() * left.length));
        while (pos0 === pos1) {
            pos1 = Math.floor((Math.random() * left.length));
        }

        const simuRank = rankHandInt({
            cards: board.concat([left[pos0], left[pos1]])
        }).rank;

        if (rank > simuRank) {
            win += 1;
        }
    }

    return win / SIMU_COUNT;
}