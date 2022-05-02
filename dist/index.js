"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayspecJS = void 0;
const web3_utils_1 = __importDefault(require("web3-utils"));
exports.PayspecJS = {
    getPayspecInvoiceUUID(invoiceData) {
        var payspecContractAddress = invoiceData.payspecContractAddress;
        var description = invoiceData.description;
        var nonce = invoiceData.nonce;
        var token = invoiceData.token;
        var amountDue = invoiceData.amountDue;
        var payTo = invoiceData.payTo;
        var feeAddresses = { t: 'address[]', v: invoiceData.feeAddresses };
        var feePercents = { t: 'uint[]', v: invoiceData.feePercents };
        var expiresAt = invoiceData.expiresAt;
        return web3_utils_1.default.soliditySha3(payspecContractAddress, description, 
        // @ts-ignore
        nonce, token, amountDue, payTo, feeAddresses, feePercents, expiresAt);
    }
};
//# sourceMappingURL=index.js.map