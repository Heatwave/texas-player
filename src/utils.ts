import { createHash } from "crypto";

export function MD5(plainPlayerName: string) {
    const hash = createHash('md5');
    hash.update(plainPlayerName)
    return hash.digest('hex');
}