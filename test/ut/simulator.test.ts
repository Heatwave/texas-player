import { simulate } from "../../src/simulator";
import 'mocha';
import { expect } from "chai";

describe('simulator', () => {
    describe('simulate', () => {
        it('Royal Flush should get win 1', () => {
            let win = simulate(['AH', 'KH'], ['QH', 'JH', 'TH']);
            expect(win).to.equal(1);
        });

        it('High Card 8D should get win 0', () => {
            let win = simulate(['2H', '3D'], ['6S', '7C', '8D']);
            expect(win).to.equal(0);
        });
    });
});