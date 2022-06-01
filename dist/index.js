"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPayInvoice = exports.parseStringifiedArray = exports.generateInvoiceUUID = exports.getPayspecInvoiceUUID = exports.getPayspecRandomNonce = exports.getPayspecContractDeployment = exports.ETH_ADDRESS = void 0;
const ethers_1 = require("ethers");
const web3_utils_1 = __importDefault(require("web3-utils"));
const contracts_helper_1 = __importDefault(require("./lib/contracts-helper"));
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
function getPayspecContractDeployment(networkName) {
    return contracts_helper_1.default.getDeploymentConfig(networkName);
}
exports.getPayspecContractDeployment = getPayspecContractDeployment;
function getPayspecRandomNonce(size) {
    if (!size)
        size = 16;
    return web3_utils_1.default.randomHex(size);
}
exports.getPayspecRandomNonce = getPayspecRandomNonce;
function getPayspecInvoiceUUID(invoiceData) {
    var payspecContractAddress = { t: 'address', v: invoiceData.payspecContractAddress };
    var description = { t: 'string', v: invoiceData.description };
    var nonce = { t: 'uint256', v: ethers_1.BigNumber.from(invoiceData.nonce).toString() };
    var token = { t: 'address', v: invoiceData.token };
    var totalAmountDue = { t: 'uint256', v: ethers_1.BigNumber.from(invoiceData.totalAmountDue).toString() };
    let payToArray = JSON.parse(invoiceData.payToArrayStringified);
    let amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified);
    var payTo = { t: 'address[]', v: payToArray };
    var amountsDue = { t: 'uint[]', v: amountsDueArray };
    var expiresAt = { t: 'uint', v: invoiceData.expiresAt };
    return web3_utils_1.default.soliditySha3(payspecContractAddress, description, nonce, token, totalAmountDue, payTo, amountsDue, expiresAt);
}
exports.getPayspecInvoiceUUID = getPayspecInvoiceUUID;
function generateInvoiceUUID(invoiceData) {
    return Object.assign(invoiceData, { invoiceUUID: getPayspecInvoiceUUID(invoiceData) });
}
exports.generateInvoiceUUID = generateInvoiceUUID;
function parseStringifiedArray(str) {
    return JSON.parse(str);
}
exports.parseStringifiedArray = parseStringifiedArray;
function userPayInvoice(from, invoiceData, provider, netName) {
    return __awaiter(this, void 0, void 0, function* () {
        let networkName = netName ? netName : 'mainnet';
        let payspecContractData = getPayspecContractDeployment(networkName);
        let payspecABI = payspecContractData.abi;
        let payspecAddress = payspecContractData.address;
        let payspecContractInstance = new ethers_1.Contract(invoiceData.payspecContractAddress, payspecABI);
        if (invoiceData.payspecContractAddress != payspecAddress) {
            console.error('Contract address mismatch', payspecAddress, invoiceData);
        }
        let description = invoiceData.description;
        let nonce = ethers_1.BigNumber.from(invoiceData.nonce).toString();
        let token = invoiceData.token;
        let totalAmountDue = ethers_1.BigNumber.from(invoiceData.totalAmountDue).toString();
        let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified);
        let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified);
        let ethBlockExpiresAt = invoiceData.expiresAt;
        let expectedUUID = invoiceData.invoiceUUID;
        let signer = provider.getSigner();
        let usesEther = (token == exports.ETH_ADDRESS);
        let totalAmountDueEth = usesEther ? totalAmountDue : '0';
        //calculate value eth -- depends on tokenAddre in invoice data 
        let valueEth = ethers_1.utils.parseUnits(totalAmountDueEth, 'wei').toHexString();
        let contractInvoiceUUID = yield payspecContractInstance.connect(signer).getInvoiceUUID(description, nonce, token, totalAmountDue, //wei
        payToArray, amountsDueArray, ethBlockExpiresAt);
        if (contractInvoiceUUID != invoiceData.invoiceUUID) {
            console.error('contract MISMATCH UUID ', contractInvoiceUUID, invoiceData);
        }
        else {
            console.log('uuid match2 ');
        }
        let tx = yield payspecContractInstance.connect(signer).createAndPayInvoice(description, nonce, token, totalAmountDue, //wei
        payToArray, amountsDueArray, ethBlockExpiresAt, expectedUUID, { from, value: valueEth });
        console.log('tx', tx);
        return tx;
    });
}
exports.userPayInvoice = userPayInvoice;
//# sourceMappingURL=index.js.map