"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceUUID = exports.getPayspecInvoiceUUID = exports.ETH_ADDRESS = void 0;
const web3_utils_1 = __importDefault(require("web3-utils"));
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
function getPayspecInvoiceUUID(invoiceData) {
    var payspecContractAddress = invoiceData.payspecContractAddress;
    var description = invoiceData.description;
    var nonce = invoiceData.nonce;
    var token = invoiceData.token;
    var amountDue = invoiceData.amountDue;
    var payTo = invoiceData.payTo;
    let feeAddressesArray = JSON.parse(invoiceData.feeAddressesArrayStringified);
    let feePercentsArray = JSON.parse(invoiceData.feePercentsArrayStringified);
    var feeAddresses = { t: 'address[]', v: feeAddressesArray };
    var feePercents = { t: 'uint[]', v: feePercentsArray };
    var expiresAt = invoiceData.expiresAt;
    return web3_utils_1.default.soliditySha3(payspecContractAddress, description, 
    // @ts-ignore
    nonce, token, amountDue, payTo, feeAddresses, feePercents, expiresAt);
}
exports.getPayspecInvoiceUUID = getPayspecInvoiceUUID;
function generateInvoiceUUID(invoiceData) {
    return Object.assign(invoiceData, { invoiceUUID: getPayspecInvoiceUUID(invoiceData) });
}
exports.generateInvoiceUUID = generateInvoiceUUID;
//# sourceMappingURL=index.js.map