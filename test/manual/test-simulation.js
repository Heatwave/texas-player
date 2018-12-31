const ALL_POKER = require('../../data/all-pokers.json');
const compare = require('../../dist/src/compare.js');

let all = JSON.parse(JSON.stringify(ALL_POKER));
let hand = ['8H', '9H'];
let board = ['AH', 'KH', 'QH'];

let left = all.filter(item => {
    return (hand.concat(board)).indexOf(item) < 0;
});
// console.log(left, left.length);

let myValue = compare.rankHandInt({
    cards: hand.concat(board)
});
console.log(myValue);
myValue = myValue.rank;

let advValue = 0;
let count = 0;
let winCount = 0;
for (const iter0 of left) {
    for (const iter1 of left) {
        if (iter0 === iter1)
            continue;

        count += 1;

        let value = compare.rankHandInt({
            cards: board.concat([iter0, iter1])
        }).rank;

        advValue += value;
        // console.log(myValue, value);
        if (myValue > value) {
            winCount += 1;
        }
    }
}
// console.log(index);
console.log(advValue / count);
console.log(winCount, count);
console.log('winRate:', winCount / count);

advValue = 0;
count = 10000;
winCount = 0;
for (let index = 0; index < count; index++) {
    let pos0 = Math.floor((Math.random() * left.length));
    let pos1 = Math.floor((Math.random() * left.length));
    while (pos0 === pos1) {
        pos1 = Math.floor((Math.random() * left.length));
    }
    let value = compare.rankHandInt({
        cards: board.concat([left[pos0], left[pos1]])
    }).rank;

    advValue += value;

    if (myValue > value) {
        winCount += 1;
    }
}

console.log(advValue / count);
console.log('winRate:', winCount / count);


console.log(compare.rankHandInt({
    cards: ["KD", "AD"].concat(["KD", "AD", "2S", "7H", "3C", "JC", "KS"])
}));