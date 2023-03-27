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
// Define a constant for the Ethereum address
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
// Get the Payspec contract deployment configuration for a given network
function getPayspecContractDeployment(networkName) {
    return contracts_helper_1.default.getDeploymentConfig(networkName);
}
exports.getPayspecContractDeployment = getPayspecContractDeployment;
// Generate a random nonce for a Payspec invoice
function getPayspecRandomNonce(size) {
    if (!size)
        size = 16;
    return web3_utils_1.default.randomHex(size);
}
exports.getPayspecRandomNonce = getPayspecRandomNonce;
// Generate a UUID for a Payspec invoice
function getPayspecInvoiceUUID(invoiceData) {
    const payspecContractAddress = { t: 'address', v: invoiceData.payspecContractAddress };
    const description = { t: 'string', v: invoiceData.description };
    const nonce = { t: 'uint256', v: ethers_1.BigNumber.from(invoiceData.nonce).toString() };
    const token = { t: 'address', v: invoiceData.token };
    const totalAmountDue = { t: 'uint256', v: ethers_1.BigNumber.from(invoiceData.totalAmountDue).toString() };
    const payToArray = JSON.parse(invoiceData.payToArrayStringified);
    const amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified);
    const payTo = { t: 'address[]', v: payToArray };
    const amountsDue = { t: 'uint[]', v: amountsDueArray };
    const expiresAt = { t: 'uint', v: invoiceData.expiresAt };
    const result = web3_utils_1.default.soliditySha3(payspecContractAddress, description, nonce, token, totalAmountDue, payTo, amountsDue, expiresAt);
    return result ? result : undefined;
}
exports.getPayspecInvoiceUUID = getPayspecInvoiceUUID;
// Add a UUID to a Payspec invoice
function generateInvoiceUUID(invoiceData) {
    return Object.assign(invoiceData, { invoiceUUID: getPayspecInvoiceUUID(invoiceData) });
}
exports.generateInvoiceUUID = generateInvoiceUUID;
// Parse a stringified array
function parseStringifiedArray(str) {
    return JSON.parse(str);
}
exports.parseStringifiedArray = parseStringifiedArray;
// Pay a Payspec invoice on behalf of a user
function userPayInvoice(from, invoiceData, provider, netName) {
    return __awaiter(this, void 0, void 0, function* () {
        const networkName = netName ? netName : 'mainnet';
        // Get the Payspec contract deployment configuration for the given network
        const payspecContractData = getPayspecContractDeployment(networkName);
        const payspecABI = payspecContractData.abi;
        const payspecAddress = payspecContractData.address;
        // Create an instance of the Payspec contract
        const payspecContractInstance = new ethers_1.Contract(invoiceData.payspecContractAddress, payspecABI);
        // Check that the contract address in the invoice data matches the expected contract address
        if (invoiceData.payspecContractAddress != payspecAddress) {
            console.error('Contract address mismatch', payspecAddress, invoiceData);
        }
        // Get the invoice details from the invoice data
        const description = invoiceData.description;
        const nonce = ethers_1.BigNumber.from(invoiceData.nonce).toString();
        const token = invoiceData.token;
        const totalAmountDue = ethers_1.BigNumber.from(invoiceData.totalAmountDue).toString();
        const payToArray = parseStringifiedArray(invoiceData.payToArrayStringified);
        const amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified);
        const ethBlockExpiresAt = invoiceData.expiresAt;
        const expectedUUID = invoiceData.invoiceUUID;
        // Get the signer for the user's account
        const signer = provider.getSigner();
        // Check if the invoice uses Ether or a token
        const usesEther = (token == exports.ETH_ADDRESS);
        const totalAmountDueEth = usesEther ? totalAmountDue : '0';
        // Calculate the value to send with the transaction (in Ether or token units)
        const valueEth = ethers_1.utils.parseUnits(totalAmountDueEth, 'wei').toHexString();
        // Get the UUID for the invoice from the Payspec contract
        const contractInvoiceUUID = yield payspecContractInstance.connect(signer).getInvoiceUUID(description, nonce, token, totalAmountDue, payToArray, amountsDueArray, ethBlockExpiresAt);
        // Check that the UUID from the Payspec contract matches the expected UUID
        if (contractInvoiceUUID != invoiceData.invoiceUUID) {
            console.error('Contract UUID mismatch', contractInvoiceUUID, invoiceData);
        }
        else {
            console.log('UUID match');
        }
        try {
            // Call the createAndPayInvoice function on the Payspec contract
            const tx = yield payspecContractInstance.connect(signer).createAndPayInvoice(description, nonce, token, totalAmountDue, payToArray, amountsDueArray, ethBlockExpiresAt, expectedUUID, { from, value: valueEth });
            // Return a success response with the transaction data
            return { success: true, data: tx };
        }
        catch (err) {
            // Return an error response with the error message
            return { success: false, error: err };
        }
    });
}
exports.userPayInvoice = userPayInvoice;
//# sourceMappingURL=index.js.map