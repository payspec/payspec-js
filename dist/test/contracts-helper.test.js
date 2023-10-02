"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const contracts_helper_1 = require("../lib/contracts-helper");
describe('Contracts Helper', () => {
    it('should getPayspecContractAddress', () => {
        let address = (0, contracts_helper_1.getPayspecContractAddress)('sepolia');
        (0, chai_1.expect)(address).to.be.a('string');
    });
});
//# sourceMappingURL=contracts-helper.test.js.map