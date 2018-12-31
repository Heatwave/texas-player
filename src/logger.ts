import * as winston from "winston";

class Logger {
    logger: winston.Logger;

    constructor(logFileNameSuffix) {
        this.logger = winston.createLogger({
            level: 'debug',
            format: winston.format.json(),
            transports: [
                //
                // - Write to all logs with level `info` and below to `combined.log` 
                // - Write all logs error (and below) to `error.log`.
                //
                new winston.transports.File({ filename: `logs/client/error-${logFileNameSuffix}.log`, level: 'error' }),
                new winston.transports.File({ filename: `logs/client/debug-${logFileNameSuffix}.log`, level: 'debug' })
            ]
        });
    }

    static inspectBodys(content) {
        let result = '';
        for (const preContent of content) {
            if (typeof preContent === 'string') {
                result += preContent;
            } else if (preContent instanceof Error && preContent.stack) {
                result += preContent.stack;
            } else {
                result += JSON.stringify(preContent);
            }
            result += ' ';
        }
        return result;
    }

    static parseLogString(body) {
        try {
            return Logger.inspectBodys(body);
        } catch (error) {
            console.error('parse log error!', error);
        }
    }

    debug(message, body) {
        let content = {
            timestamp: (new Date).toString()
        };
        content = { ...content, ...body };
        this.logger.debug(message, content);
    }

    info(message, body) {
        let content = {
            timestamp: (new Date).toString()
        };

        if (typeof body !== 'object') {
            body = { body: body };
        }
        content = { ...content, ...body };
        this.logger.info(message, content);
    }

    error(message, body) {
        let content = {
            timestamp: (new Date).toString()
        };

        if (typeof body !== 'object') {
            body = { body: body };
        }
        content = { ...content, ...body };
        this.logger.error(message, content);
    }
}

const now = new Date();
const playerName = process.argv[2];
const filename = `${playerName}-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}`;

export const logger = new Logger(filename);