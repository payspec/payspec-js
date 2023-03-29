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
exports.userPayInvoice = exports.generatePayspecInvoiceSimple = exports.getPayspecExpiresInDelta = exports.getPayspecPaymentDataFromPaymentsArray = exports.getPayspecContractAddressFromChainId = exports.validateInvoice = exports.parseStringifiedArray = exports.generateInvoiceUUID = exports.getPayspecInvoiceUUID = exports.getPayspecRandomNonce = exports.getPayspecContractDeployment = exports.ETH_ADDRESS = void 0;
const ethers_1 = require("ethers");
const web3_utils_1 = __importDefault(require("web3-utils"));
const contracts_helper_1 = require("./lib/contracts-helper");
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
function getPayspecContractDeployment(networkName) {
    return (0, contracts_helper_1.getDeploymentConfig)(networkName);
}
exports.getPayspecContractDeployment = getPayspecContractDeployment;
function getPayspecRandomNonce(size) {
    if (!size)
        size = 16;
    return web3_utils_1.default.randomHex(size);
}
exports.getPayspecRandomNonce = getPayspecRandomNonce;
function getPayspecInvoiceUUID(invoiceData) {
    console.log('invoiceData', invoiceData);
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
    let result = web3_utils_1.default.soliditySha3(payspecContractAddress, description, nonce, token, totalAmountDue, payTo, amountsDue, expiresAt);
    return result ? result : undefined;
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
function validateInvoice(invoiceData) {
    const requiredFields = [
        'payspecContractAddress',
        'description',
        'nonce',
        'token',
        'totalAmountDue',
        'payToArrayStringified',
        'amountsDueArrayStringified',
        'expiresAt'
    ];
    //all keys must exist
    const invoiceFields = Object.keys(invoiceData);
    for (let i = 0; i < requiredFields.length; i++) {
        if (!invoiceFields.includes(requiredFields[i])) {
            throw new Error('Missing required field: ' + requiredFields[i]);
        }
    }
    //token must be an address 
    if (!web3_utils_1.default.isAddress(invoiceData.token))
        throw new Error('token must be an address');
    //pay to array stringified should be valid 
    let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified);
    let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified);
    if (payToArray.length != amountsDueArray.length)
        throw new Error('payToArrayStringified and amountsDueArrayStringified must be same length');
    if (!Array.isArray(payToArray))
        throw new Error('payToArrayStringified must be an array');
    if (!Array.isArray(amountsDueArray))
        throw new Error('amountsDueArrayStringified must be an array');
    //each pay to address must be valid
    payToArray.forEach((payToAddress) => {
        if (!web3_utils_1.default.isAddress(payToAddress))
            throw new Error('payToAddress must be an address');
    });
    //total amount due must be equal to sum of amounts due array
    let totalAmountDue = ethers_1.BigNumber.from(invoiceData.totalAmountDue);
    let sumAmountsDue = ethers_1.BigNumber.from(0);
    amountsDueArray.forEach((amountDue) => {
        sumAmountsDue = sumAmountsDue.add(ethers_1.BigNumber.from(amountDue));
    });
    if (!totalAmountDue.eq(sumAmountsDue))
        throw new Error('totalAmountDue must be equal to sum of amountsDueArray');
    return true;
}
exports.validateInvoice = validateInvoice;
function getPayspecContractAddressFromChainId(chainId) {
    const networkName = (0, contracts_helper_1.getNetworkNameFromChainId)(chainId);
    const contractDeployment = getPayspecContractDeployment(networkName);
    return contractDeployment.address;
}
exports.getPayspecContractAddressFromChainId = getPayspecContractAddressFromChainId;
//use gpt to write test for this 
function getPayspecPaymentDataFromPaymentsArray(elements) {
    let totalAmountDue = ethers_1.BigNumber.from(0);
    let payToArray = [];
    let amountsDueArray = [];
    elements.forEach((element) => {
        totalAmountDue = totalAmountDue.add(ethers_1.BigNumber.from(element.amountDue));
        payToArray.push(element.payTo);
        amountsDueArray.push(ethers_1.BigNumber.from(element.amountDue).toString());
    });
    return {
        totalAmountDue: totalAmountDue.toString(),
        payToArrayStringified: JSON.stringify(payToArray),
        amountsDueArrayStringified: JSON.stringify(amountsDueArray)
    };
}
exports.getPayspecPaymentDataFromPaymentsArray = getPayspecPaymentDataFromPaymentsArray;
//use gpt to write test for this 
function getPayspecExpiresInDelta(delta, timeUnits) {
    let currentTimeSeconds = Math.floor(Date.now() / 1000);
    if (!timeUnits)
        timeUnits = 'seconds';
    let deltaSeconds = 0;
    switch (timeUnits) {
        case 'seconds':
            deltaSeconds = delta;
            break;
        case 'minutes':
            deltaSeconds = delta * 60;
            break;
        case 'hours':
            deltaSeconds = delta * 60 * 60;
            break;
        case 'days':
            deltaSeconds = delta * 60 * 60 * 24;
            break;
        case 'weeks':
            deltaSeconds = delta * 60 * 60 * 24 * 7;
            break;
        case 'months':
            deltaSeconds = delta * 60 * 60 * 24 * 7 * 30;
            break;
    }
    return currentTimeSeconds + deltaSeconds;
}
exports.getPayspecExpiresInDelta = getPayspecExpiresInDelta;
function generatePayspecInvoiceSimple({ chainId, description, tokenAddress, paymentsArray }) {
    const payspecContractAddress = getPayspecContractAddressFromChainId(chainId);
    const nonce = getPayspecRandomNonce();
    const expiresAt = getPayspecExpiresInDelta(50000, 'seconds');
    const { totalAmountDue, payToArrayStringified, amountsDueArrayStringified } = getPayspecPaymentDataFromPaymentsArray(paymentsArray);
    const invoice = {
        payspecContractAddress: payspecContractAddress,
        description,
        nonce,
        token: tokenAddress,
        totalAmountDue,
        payToArrayStringified,
        amountsDueArrayStringified,
        expiresAt
    };
    return invoice;
}
exports.generatePayspecInvoiceSimple = generatePayspecInvoiceSimple;
//---------
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
        try {
            let tx = yield payspecContractInstance.connect(signer).createAndPayInvoice(description, nonce, token, totalAmountDue, //wei
            payToArray, amountsDueArray, ethBlockExpiresAt, expectedUUID, { from, value: valueEth });
            return { success: true, data: tx };
        }
        catch (err) {
            return { success: false, error: err };
        }
    });
}
exports.userPayInvoice = userPayInvoice;
//# sourceMappingURL=index.js.map