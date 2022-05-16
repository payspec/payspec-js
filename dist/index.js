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
exports.userPayInvoice = exports.parseStringifiedArray = exports.generateInvoiceUUID = exports.getPayspecInvoiceUUID = exports.getPayspecContractDeployment = exports.ETH_ADDRESS = void 0;
const ethers_1 = require("ethers");
const web3_utils_1 = __importDefault(require("web3-utils"));
const contracts_helper_1 = __importDefault(require("./lib/contracts-helper"));
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
function getPayspecContractDeployment(networkName) {
    let contractName = 'Payspec';
    return contracts_helper_1.default.getDeploymentConfig(networkName, contractName);
}
exports.getPayspecContractDeployment = getPayspecContractDeployment;
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
    console.log('getPayspecInvoiceUUID , ', payspecContractAddress, description, 
    // @ts-ignore
    nonce, token, totalAmountDue, payTo, amountsDue, expiresAt);
    return web3_utils_1.default.soliditySha3(payspecContractAddress, description, 
    // @ts-ignore
    nonce, token, totalAmountDue, payTo, amountsDue, expiresAt);
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
        let payspecContractInstance = new ethers_1.Contract(invoiceData.payspecContractAddress, payspecABI);
        let description = invoiceData.description;
        let nonce = invoiceData.nonce;
        let token = invoiceData.token;
        let totalAmountDue = invoiceData.totalAmountDue;
        let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified);
        let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified);
        let ethBlockExpiresAt = invoiceData.expiresAt;
        let expectedUUID = invoiceData.invoiceUUID;
        console.log('populate tx ', description, nonce, token, totalAmountDue, //wei
        payToArray, amountsDueArray, ethBlockExpiresAt, expectedUUID);
        let signer = provider.getSigner();
        let tx = yield payspecContractInstance.connect(signer).createAndPayInvoice(description, nonce, token, totalAmountDue, //wei
        payToArray, amountsDueArray, ethBlockExpiresAt, expectedUUID, { from });
        console.log('tx', tx);
        return;
        let txData = payspecContractInstance.populateTransaction.createAndPayInvoice(description, nonce, token, totalAmountDue, //wei
        payToArray, amountsDueArray, ethBlockExpiresAt, expectedUUID);
        console.log('txData', txData);
        let usesEther = (token == exports.ETH_ADDRESS);
        let totalAmountDueEth = usesEther ? totalAmountDue : '0';
        //calculate value eth -- depends on tokenAddre in invoice data 
        let valueEth = ethers_1.utils.parseUnits(totalAmountDueEth, 'wei').toHexString();
        const params = [{
                from,
                to: invoiceData.payspecContractAddress,
                data: txData,
                value: valueEth
            }];
        const transactionHash = yield provider.send('eth_sendTransaction', params);
        console.log('transactionHash is ' + transactionHash);
    });
}
exports.userPayInvoice = userPayInvoice;
//# sourceMappingURL=index.js.map