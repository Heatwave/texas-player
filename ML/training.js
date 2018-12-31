const tf = require('@tensorflow/tfjs');
const fs = require('fs');

require('@tensorflow/tfjs-node');

async function train(player) {
    const model = tf.sequential();


    model.add(tf.layers.dense({ units: player.length, activation: 'relu', inputShape: [17] }));
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

    model.compile({
        loss: 'meanSquaredError',
        optimizer: 'sgd'
    });

    const xs = tf.tensor(player.map(value => {
        let x = [];
        x.push(value.round);
        x.push(value.DealCALL);
        x.push(value.DealFOLD);
        x.push(value.DealRAISE);
        x.push(value.DealALLIN);
        x.push(value.FlopCALL);
        x.push(value.FlopFOLD);
        x.push(value.FlopRAISE);
        x.push(value.FlopALLIN);
        x.push(value.TurnCALL);
        x.push(value.TurnFOLD);
        x.push(value.TurnRAISE);
        x.push(value.TurnALLIN);
        x.push(value.RiverCALL);
        x.push(value.RiverFOLD);
        x.push(value.RiverRAISE);
        x.push(value.RiverALLIN);
        return x;
    }), [player.length, 17]);

    const y = [];
    player.forEach(value => {
        y.push(value.rank);
    });

    const xy = tf.tensor(y, [player.length, 1]);

    try {
        await model.fit(xs, xy, {
            epochs: 250,
            callbacks: {
                onEpochEnd: async (epoch, log) => {
                    console.log(`Epoch ${epoch}: loss = ${log.loss}`);
                }
            }
        });

        const result = model.predict(tf.tensor([2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 17]));
        result.print();

        // const saveResult = await model.save('file://data/models');
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }

    return model;
}

async function main() {
    const players = fs.readdirSync('./data/players/training/');

    for (const player of players) {
        let data = fs.readFileSync('./data/players/training/' + player);
        data = JSON.parse(data);
        const model = await train(data);
        model.save('file://data/models/' + player);
    }
}


main();