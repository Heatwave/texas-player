import { Player } from "./Player";

export class MyStatus extends Player {
    minBet: number;
    handRank: number;

    constructor(data) {
        super(data);

        if (typeof data.minBet === 'number') {
            this.minBet = data.minBet;
        } else {
            this.minBet = 0;
        }

        this.handRank = 0;
    }

    update(data) {
        super.update(data);
        if (typeof data.minBet === 'number') {
            this.minBet = data.minBet;
        }
    }
}