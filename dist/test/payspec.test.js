"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const index_1 = require("../index");
describe('Payspec Js', () => {
    it('should validate an invoice ', () => {
        let wallet = ethers_1.Wallet.createRandom();
        let mockinvoice = (0, index_1.generatePayspecInvoiceSimple)({
            chainId: 11155111,
            metadataHash: '0x626c756500000000000000000000000000000000000000000000000000000000',
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
    it('should apply protocol fee', () => {
        let wallet = ethers_1.Wallet.createRandom();
        let mockinvoice = (0, index_1.generatePayspecInvoiceSimple)({
            chainId: 11155111,
            metadataHash: '0x626c756500000000000000000000000000000000000000000000000000000000',
            tokenAddress: '0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
            paymentsArray: [
                {
                    payTo: wallet.address,
                    amountDue: '1000000000000000000'
                }
            ]
        });
        let includesFeeBefore = (0, index_1.includesProtocolFee)(mockinvoice);
        (0, chai_1.expect)(includesFeeBefore).to.eql(false);
        let updatedInvoice = (0, index_1.applyProtocolFee)(mockinvoice);
        let includesFeeAfter = (0, index_1.includesProtocolFee)(updatedInvoice);
        (0, chai_1.expect)(includesFeeAfter).to.eql(true);
    });
    it('should apply protocol fee with odd rounding', () => {
        let wallet = ethers_1.Wallet.createRandom();
        let mockinvoice = (0, index_1.generatePayspecInvoiceSimple)({
            chainId: 11155111,
            metadataHash: '0x626c756500000000000000000000000000000000000000000000000000000000',
            tokenAddress: '0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
            paymentsArray: [
                {
                    payTo: wallet.address,
                    amountDue: '1000001231512411'
                }
            ]
        });
        let includesFeeBefore = (0, index_1.includesProtocolFee)(mockinvoice);
        (0, chai_1.expect)(includesFeeBefore).to.eql(false);
        let updatedInvoice = (0, index_1.applyProtocolFee)(mockinvoice);
        let includesFeeAfter = (0, index_1.includesProtocolFee)(updatedInvoice);
        (0, chai_1.expect)(includesFeeAfter).to.eql(true);
    });
    it('should calc subtotal less protocol fee', () => {
        let wallet = ethers_1.Wallet.createRandom();
        let paymentElements = [
            {
                payTo: wallet.address,
                amountDue: '17'
            }
        ];
        let subtotal = (0, index_1.calculateSubtotalLessProtocolFee)(paymentElements);
        (0, chai_1.expect)(subtotal).to.eql('16');
    });
    //why does this fail ? 
    it('should apply protocol fee with fuzzy test inputs', () => {
        test_protocol_fee_application(ethers_1.BigNumber.from(0));
        test_protocol_fee_application(ethers_1.BigNumber.from(1));
        test_protocol_fee_application(ethers_1.BigNumber.from(17));
        test_protocol_fee_application(ethers_1.BigNumber.from(170));
        test_protocol_fee_application(ethers_1.BigNumber.from(1700));
    });
});
function test_protocol_fee_application(amountDue) {
    console.log(`test protocol fee application of amountDue ${amountDue}`);
    let wallet = ethers_1.Wallet.createRandom();
    let mockinvoice = (0, index_1.generatePayspecInvoiceSimple)({
        chainId: 11155111,
        metadataHash: '0x626c756500000000000000000000000000000000000000000000000000000000',
        tokenAddress: '0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
        paymentsArray: [
            {
                payTo: wallet.address,
                amountDue: amountDue.toString()
            }
        ]
    });
    let includesFeeBefore = (0, index_1.includesProtocolFee)(mockinvoice);
    (0, chai_1.expect)(includesFeeBefore).to.eql(false);
    let updatedInvoice = (0, index_1.applyProtocolFee)(mockinvoice);
    console.log({ updatedInvoice });
    let includesFeeAfter = (0, index_1.includesProtocolFee)(updatedInvoice);
    (0, chai_1.expect)(includesFeeAfter).to.eql(true);
    let isValid = (0, index_1.validateInvoice)(updatedInvoice);
    (0, chai_1.expect)(isValid).to.eql(true);
}
//# sourceMappingURL=payspec.test.js.map