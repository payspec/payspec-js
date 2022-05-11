"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceUUID = exports.getPayspecInvoiceUUID = exports.ETH_ADDRESS = void 0;
const ethers_1 = require("ethers");
const web3_utils_1 = __importDefault(require("web3-utils"));
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
function getPayspecInvoiceUUID(invoiceData) {
    var payspecContractAddress = invoiceData.payspecContractAddress;
    var description = invoiceData.description;
    var nonce = ethers_1.BigNumber.from(invoiceData.nonce);
    var token = invoiceData.token;
    var totalAmountDue = ethers_1.BigNumber.from(invoiceData.totalAmountDue);
    let payToArray = JSON.parse(invoiceData.payToArrayStringified);
    let amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified);
    var payTo = { t: 'address[]', v: payToArray };
    var amountsDue = { t: 'uint[]', v: amountsDueArray };
    var expiresAt = invoiceData.expiresAt;
    return web3_utils_1.default.soliditySha3(payspecContractAddress, description, 
    // @ts-ignore
    nonce, token, totalAmountDue, payTo, amountsDue, expiresAt);
}
exports.getPayspecInvoiceUUID = getPayspecInvoiceUUID;
function generateInvoiceUUID(invoiceData) {
    return Object.assign(invoiceData, { invoiceUUID: getPayspecInvoiceUUID(invoiceData) });
}
exports.generateInvoiceUUID = generateInvoiceUUID;
//# sourceMappingURL=index.js.map