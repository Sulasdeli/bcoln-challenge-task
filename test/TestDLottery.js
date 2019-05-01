const DLottery = artifacts.require('./contracts/DLottery');

contract("DLottery", accounts => {
    it("should be initialized the phase correctly", async () => {
        let instance = await DLottery.deployed();
        let phase = await instance.current_phase.call();
        assert.equal(phase, 0);
    });
});