import * as WebSocket from "ws";
import { EventEmitter } from "events";
import { logger } from "./logger";

export class Client extends EventEmitter {
    ws: WebSocket;

    constructor(URL: string, playerName: string) {
        super();

        this.ws = new WebSocket(URL);
        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                "eventName": "__join",
                "data": {
                    "playerName": playerName
                }
            }));
            this.emit("socket_opened", this.ws);
        }

        this.ws.onmessage = (message: any) => {
            var json = JSON.parse(message.data);
            if (json.eventName) {
                logger.info(json.eventName, json.data);
                this.emit(json.eventName, json.data);
            } else {
                logger.info('socket_receive_message', json);
                this.emit("socket_receive_message", this.ws, json);
            }
        }

        this.ws.onerror = (error) => {
            logger.error('socket_error', error);
            this.emit("socket_error", error);
        }

        this.ws.onclose = (data) => {
            logger.info('socket_closed', 'close');
            this.emit('socket_closed', data);
        }
    }

    Bet(amount: number) {
        const action = {
            "eventName": "__action",
            "data": {
                "action": "bet",
                "amount": amount
            }
        };
        logger.info('Bet', action);
        this.ws.send(JSON.stringify(action));
    }

    Call() {
        const action = {
            "eventName": "__action",
            "data": {
                "action": "call"
            }
        };
        logger.info('Call', action);
        this.ws.send(JSON.stringify(action));
    }

    Check() {
        const action = {
            "eventName": "__action",
            "data": {
                "action": "check"
            }
        };
        logger.info('Check', action);
        this.ws.send(JSON.stringify(action));
    }

    Raise() {
        const action = {
            "eventName": "__action",
            "data": {
                "action": "raise"
            }
        };
        logger.info('Raise', action);
        this.ws.send(JSON.stringify(action));
    }

    AllIn() {
        const action = {
            "eventName": "__action",
            "data": {
                "action": "allin"
            }
        };
        logger.info('AllIn', action);
        this.ws.send(JSON.stringify(action));
    }

    Fold() {
        const action = {
            "eventName": "__action",
            "data": {
                "action": "fold"
            }
        };
        logger.info('Fold', action);
        this.ws.send(JSON.stringify(action));
    }

    Reload() {
        const action = {
            "eventName": "__reload"
        };
        logger.info('Reload', action);
        this.ws.send(JSON.stringify(action));
    }
}