"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const index_1 = require("../index");
describe('Payspec Js', () => {
    it('should get deployment config', () => {
        let deployment = (0, index_1.getPayspecContractDeployment)('rinkeby');
        (0, chai_1.expect)(deployment.address).to.be.a('string');
    });
    it('should validate an invoice ', () => {
        let wallet = ethers_1.Wallet.createRandom();
        let mockinvoice = (0, index_1.generatePayspecInvoiceSimple)({
            chainId: 4,
            description: 'test',
            tokenAddress: '0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
            paymentsArray: [
                {
                    payTo: wallet.address,
                    amountDue: '1000000000000000000'
                }
            ]
        });
        let valid = (0, index_1.validateInvoice)(mockinvoice);
        (0, chai_1.expect)(valid).to.eql(true);
        (0, chai_1.expect)(mockinvoice.invoiceUUID).to.exist;
    });
    it('should gen random nonce', () => {
        let nonce = (0, index_1.getPayspecRandomNonce)();
        console.log({ nonce });
        (0, chai_1.expect)(nonce).to.be.a('string');
    });
});
//# sourceMappingURL=payspec.test.js.map