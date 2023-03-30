"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const contracts_helper_1 = require("../lib/contracts-helper");
describe('Contracts Helper', () => {
    it('should get deployment config', () => {
        let deployment = (0, contracts_helper_1.getDeploymentConfig)('rinkeby');
        (0, chai_1.expect)(deployment.address).to.be.a('string');
    });
});
//# sourceMappingURL=contracts-helper.test.js.map