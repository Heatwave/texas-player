const simulator = require('../../dist/src/simulator.js');

console.time('start');
let win = simulator.simulate(["5C", "6C"], ['TH', '5H', '2S']);
// let win = simulator.simulate(["JS", "7S"], ["JC", "4C", "TH", "AS"]);
console.timeEnd('start');
console.log(win);