import { Player } from "./DataStructure/Player";

export function getFearFix(players: Object, bb: number) {
    let winFix = 1;

    for (const key in players) {
        if (players.hasOwnProperty(key)) {
            const player: Player = players[key];
            let fix = 1;

            if (!player.bet) {
                player.bet = 0;
            }

            if (!player.roundBet) {
                player.roundBet = 0;
            }

            const playerBet = player.bet + player.roundBet;
            if (playerBet >= (bb * 4)) {
                fix = -(0.2632 / 6) * (playerBet / bb) + 1.2632;
            }

            winFix = fix < winFix ? fix : winFix;

            winFix = winFix >= 1 ? 1 : winFix;
            winFix = winFix <= 0.7368 ? 0.7368 : winFix;
        }
    }

    return winFix;
}