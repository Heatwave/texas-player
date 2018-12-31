export class Table {
    tableNumber: string;
    roundName: string;
    board: Array<string>;
    roundCount: number;
    raiseCount: number;
    betCount: number;
    totalBet: number;
    smallBlind: {
        playerName: string,
        amount: number
    };
    bigBlind: {
        playerName: string,
        amount: number
    }

    constructor(data) {
        this.tableNumber = data.tableNumber || '';
        this.roundName = data.roundName || 'Deal';
        this.board = data.board || [];
        this.roundCount = data.roundCount || 0;
        this.raiseCount = data.raiseCount || 0;
        this.betCount = data.betCount || 0;
        this.totalBet = data.totalBet || 0;
        this.smallBlind = data.smallBlind || {};
        this.bigBlind = data.bigBlind || {};
    }

    update(data) {
        if (typeof data.tableNumber === 'string') {
            this.tableNumber = data.tableNumber;
        }

        if (typeof data.roundName === 'string') {
            this.roundName = data.roundName;
        }

        if (Array.isArray(data.board)) {
            this.board = data.board;
        }

        if (typeof data.roundCount === 'number') {
            this.roundCount = data.roundCount;
        }

        if (typeof data.raiseCount === 'number') {
            this.raiseCount = data.raiseCount;
        }

        if (typeof data.betCount === 'number') {
            this.betCount = data.betCount;
        }

        if (typeof data.totalBet === 'number') {
            this.totalBet = data.totalBet;
        }

        if (typeof data.smallBlind === 'object') {
            this.smallBlind = data.smallBlind;
        }

        if (typeof data.bigBlind === 'object') {
            this.bigBlind = data.bigBlind;
        }
    }

    isSB(playerName) {
        if (this.smallBlind && this.smallBlind.playerName && playerName === this.smallBlind.playerName)
            return true;
        else
            return false;
    }

    isBB(playerName) {
        if (this.bigBlind && this.bigBlind.playerName && playerName === this.bigBlind.playerName)
            return true;
        else
            return false;
    }
}