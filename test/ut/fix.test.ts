import { getFearFix } from "../../src/fix";
import 'mocha';
import { expect } from "chai";

describe('fix', () => {
    describe('getWinFix', () => {
        it('should get 0.7368', () => {
            const winFix = getFearFix({
                a: {
                    bet: 260
                },
                b: {
                    bet: 120
                }
            }, 20);
            expect(winFix).to.equal(0.7368);
        });

        it('should get 0.7368', () => {
            const winFix = getFearFix({
                a: {
                    bet: 360
                },
                b: {
                    bet: 480
                }
            }, 20);
            expect(winFix).to.equal(0.7368);
        });

        it('should get 1', () => {
            const winFix = getFearFix({
                a: {
                    bet: 120
                },
                b: {
                    bet: 120
                }
            }, 20);
            expect(winFix).to.equal(1);
        });

        it('should get 1', () => {
            const winFix = getFearFix({
                a: {
                    bet: 60
                },
                b: {
                    bet: 40
                }
            }, 20);
            expect(winFix).to.equal(1);
        });
    });
});