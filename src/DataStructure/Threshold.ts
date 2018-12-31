export class Threshold {
    allin: number;
    raise: number;
    bet: number;
    call: number;
    check: number;

    constructor(data) {
        this.allin = data.allin;
        this.raise = data.raise;
        this.bet = data.bet;
        this.call = data.call;
        this.check = data.check;
    }

    update(data) {
        this.allin = typeof data.allin === 'number' ? data.allin : 0.99;
        this.raise = typeof data.raise === 'number' ? data.raise : 0.9;
        this.bet = typeof data.bet === 'number' ? data.bet : 0.8;
        this.call = typeof data.call === 'number' ? data.call : 0.7;
        this.check = typeof data.check === 'number' ? data.check : 0.5;
    }
}