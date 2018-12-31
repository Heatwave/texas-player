import { getHandRank } from "../../src/compare";
import 'mocha';
import { expect } from "chai";

describe('compare', () => {
    describe('getHandRank', () => {
        it('should get rank 739', () => {
            const rank = getHandRank(["6c", "7H"]);
            expect(rank).to.equal(739);
        });

        it('should get rank 739', () => {
            const rank = getHandRank(["7H", "6C"]);
            expect(rank).to.equal(739);
        });

        it('should get rank 266', () => {
            const rank = getHandRank(["5D", "5S"]);
            expect(rank).to.eq(266);
        });

        it('should get rank 266', () => {
            const rank = getHandRank(["5S", "5D"]);
            expect(rank).to.eq(266);
        });

        it('should get rank 733', () => {
            const rank = getHandRank(["9D", "7C"]);
            expect(rank).to.eq(733);
        });

        it('should get rank 733', () => {
            const rank = getHandRank(["7C", "9D"]);
            expect(rank).to.eq(733);
        });
    });
});