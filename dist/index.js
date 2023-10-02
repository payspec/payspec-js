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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPayInvoice = exports.generatePayspecInvoice = exports.generatePayspecInvoiceSimple = exports.getMetadataHash = exports.getSmartInvoiceURL = exports.getSmartInvoiceURLWithPaymentsArray = exports.getPayspecExpiresInDelta = exports.getPayspecPaymentDataFromPaymentsArray = exports.getPayspecContractAddressFromChainId = exports.validateInvoice = exports.decodeInvoice = exports.encodeInvoice = exports.getCurrencyTokenAddress = exports.parseStringifiedArray = exports.getTotalAmountDueFromAmountsDueArray = exports.getTotalAmountDueFromPaymentElementsArray = exports.getPaymentElementsFromInvoice = exports.includesProtocolFee = exports.calculateSubtotalLessProtocolFee = exports.applyProtocolFeeToPaymentElements = exports.applyProtocolFee = exports.applyInvoiceUUID = exports.getPayspecInvoiceUUID = exports.getPayspecRandomNonce = exports.getPayspecContractABI = exports.getPayspecContractAddress = exports.getTokenDataFromTokenDictionary = exports.buildTokenDictionary = exports.ETH_ADDRESS = exports.getNetworkNameFromChainId = void 0;
const ethers_1 = require("ethers");
const contracts_helper_1 = require("./lib/contracts-helper");
Object.defineProperty(exports, "getNetworkNameFromChainId", { enumerable: true, get: function () { return contracts_helper_1.getNetworkNameFromChainId; } });
const contracts_helper_2 = require("./lib/contracts-helper");
const PayspecContractABI = require("./config/abi/payspec.abi.json");
const tokenConfig = require(`./config/tokens.json`);
exports.ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
/*
  consider: dictionary should be by network ?
*/
function buildTokenDictionary() {
    let tokenDictionary = {};
    for (let networkName in tokenConfig) {
        for (let tokenName in tokenConfig[networkName]) {
            let tokenData = tokenConfig[networkName][tokenName];
            let tokenAddress = tokenData.address;
            tokenDictionary[tokenAddress] = {
                tokenAddress: tokenAddress,
                tokenName: tokenName,
                symbol: tokenData.symbol,
                decimals: tokenData.decimals
            };
        }
    }
    return tokenDictionary;
}
exports.buildTokenDictionary = buildTokenDictionary;
function getTokenDataFromTokenDictionary(tokenDictionary, tokenAddress, chainId) {
    return tokenDictionary[tokenAddress];
}
exports.getTokenDataFromTokenDictionary = getTokenDataFromTokenDictionary;
function getPayspecContractAddress(networkName) {
    return (0, contracts_helper_2.getPayspecContractAddress)(networkName);
}
exports.getPayspecContractAddress = getPayspecContractAddress;
function getPayspecContractABI() {
    return PayspecContractABI;
}
exports.getPayspecContractABI = getPayspecContractABI;
function getPayspecRandomNonce(size) {
    if (!size)
        size = 16;
    return ethers_1.BigNumber.from(ethers_1.ethers.utils.randomBytes(size)).toHexString();
}
exports.getPayspecRandomNonce = getPayspecRandomNonce;
function getPayspecInvoiceUUID(invoiceData) {
    const expiration = Math.floor(parseInt(invoiceData.expiresAt.toString()));
    var payspecContractAddress = { t: 'address', v: invoiceData.payspecContractAddress };
    var metadataHash = { t: 'bytes32', v: invoiceData.metadataHash };
    var nonce = { t: 'uint256', v: ethers_1.BigNumber.from(invoiceData.nonce).toString() };
    var token = { t: 'address', v: invoiceData.token };
    var chainId = { t: 'uint256', v: ethers_1.BigNumber.from(invoiceData.chainId).toString() };
    let payToArray = JSON.parse(invoiceData.payToArrayStringified);
    let amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified);
    var payTo = { t: 'address[]', v: payToArray };
    var amountsDue = { t: 'uint[]', v: amountsDueArray };
    var expiresAt = { t: 'uint', v: expiration };
    /*
    test!!
  
    https://github.com/ethers-io/ethers.js/issues/671
  
    */
    /*
    
     function getInvoiceUUID(    address token,   address[] memory payTo, uint[] memory amountsDue,   uint256 nonce,uint256 chainId, bytes32 metadataHash, uint expiresAt  ) public view returns (bytes32 uuid) {
   
            address payspecContractAddress = address(this); //prevent from paying through the wrong contract
   
            bytes32 newuuid = keccak256( abi.encodePacked(payspecContractAddress, token, payTo, amountsDue,   nonce,  chainId, metadataHash,   expiresAt ) );
   
   
   
     */
    const result = ethers_1.ethers.utils.solidityKeccak256(['address', 'address', 'address[]', 'uint256[]', 'uint256', 'uint256', 'bytes32', 'uint256'], [payspecContractAddress.v, token.v, payTo.v, amountsDue.v, nonce.v, chainId.v, metadataHash.v, expiresAt.v]);
    return result ? result : undefined;
}
exports.getPayspecInvoiceUUID = getPayspecInvoiceUUID;
function applyInvoiceUUID(invoice) {
    return Object.assign(invoice, { invoiceUUID: getPayspecInvoiceUUID(invoice) });
}
exports.applyInvoiceUUID = applyInvoiceUUID;
function applyProtocolFee(invoice) {
    if (includesProtocolFee(invoice))
        return invoice;
    let paymentElements = getPaymentElementsFromInvoice(invoice);
    let originalTotalAmountDue = getTotalAmountDueFromPaymentElementsArray(paymentElements);
    // add the protocol fee to the payment elements 
    let updatedPaymentElements = applyProtocolFeeToPaymentElements(paymentElements);
    let { totalAmountDue, payToArrayStringified, amountsDueArrayStringified } = getPayspecPaymentDataFromPaymentsArray(updatedPaymentElements);
    // if(totalAmountDue != originalTotalAmountDue) throw new Error('Unable to apply protocol fee: total amount update mismatch.  This is a bug in the payspec javascript lib.')
    let invoiceClone = Object.assign({}, invoice);
    let updatedInvoice = Object.assign(invoiceClone, {
        payToArrayStringified,
        amountsDueArrayStringified
    });
    return updatedInvoice;
}
exports.applyProtocolFee = applyProtocolFee;
function applyProtocolFeeToPaymentElements(paymentElements) {
    const protocolFeeConfig = (0, contracts_helper_1.getProtocolFeeConfig)();
    let originalTotalAmountDue = getTotalAmountDueFromPaymentElementsArray(paymentElements);
    let updatedPaymentElements = [];
    for (let element of paymentElements) {
        //make sure rounding works well here 
        let amountDueLessFees = ethers_1.BigNumber.from(element.amountDue).mul(10000 - protocolFeeConfig.protocolFeePercentBasisPoints).div(10000);
        updatedPaymentElements.push({
            payTo: element.payTo,
            amountDue: amountDueLessFees.toString()
        });
    }
    let totalAmountDueLessFees = getTotalAmountDueFromPaymentElementsArray(updatedPaymentElements);
    let protocolFeeAmountDue = ethers_1.BigNumber.from(originalTotalAmountDue).sub(ethers_1.BigNumber.from(totalAmountDueLessFees)).toString();
    updatedPaymentElements.push({
        payTo: protocolFeeConfig.protocolFeeRecipientAddress,
        amountDue: protocolFeeAmountDue
    });
    return updatedPaymentElements;
}
exports.applyProtocolFeeToPaymentElements = applyProtocolFeeToPaymentElements;
/*
  rounding is busted for bignumber ..
*/
function calculateSubtotalLessProtocolFee(paymentElements) {
    const protocolFeeConfig = (0, contracts_helper_1.getProtocolFeeConfig)();
    let updatedPaymentElements = [];
    for (let element of paymentElements) {
        //make sure rounding works well here 
        let amountDueLessFees = ethers_1.BigNumber.from(element.amountDue).mul(10000 - protocolFeeConfig.protocolFeePercentBasisPoints).div(10000);
        updatedPaymentElements.push({
            payTo: element.payTo,
            amountDue: amountDueLessFees.toString()
        });
    }
    let totalAmountDueLessFees = getTotalAmountDueFromPaymentElementsArray(updatedPaymentElements);
    return totalAmountDueLessFees;
}
exports.calculateSubtotalLessProtocolFee = calculateSubtotalLessProtocolFee;
/*
  this is busted
*/
function includesProtocolFee(invoice) {
    const protocolFeeConfig = (0, contracts_helper_1.getProtocolFeeConfig)();
    let paymentElements = getPaymentElementsFromInvoice(invoice);
    let originalTotalAmountDue = getTotalAmountDueFromPaymentElementsArray(paymentElements);
    //why is this 2 ?? 
    //let totalAmountDueLessFees = calculateSubtotalLessProtocolFee(paymentElements)
    let protocolFeePercentBasisPoints = protocolFeeConfig.protocolFeePercentBasisPoints;
    // let protocolFeeAmount = BigNumber.from(originalTotalAmountDue).sub(BigNumber.from(totalAmountDueLessFees)).toString()
    let totalAmountDueLessFees = ethers_1.BigNumber.from(originalTotalAmountDue /*invoice.totalAmountDue*/).mul(10000).mul(10000 - protocolFeePercentBasisPoints).div(10000).div(10000);
    let protocolFeeAmount = ethers_1.BigNumber.from(originalTotalAmountDue).sub(totalAmountDueLessFees);
    console.log('payment elements', JSON.stringify(paymentElements));
    console.log('includes protocol fee... ', originalTotalAmountDue.toString(), totalAmountDueLessFees.toString(), protocolFeeAmount.toString());
    const protocolFeeRecipient = ethers_1.ethers.utils.getAddress((0, contracts_helper_1.getProtocolFeeConfig)().protocolFeeRecipientAddress);
    for (let element of paymentElements) {
        if (ethers_1.ethers.utils.getAddress(element.payTo) == protocolFeeRecipient
            && ethers_1.BigNumber.from(element.amountDue).gte(protocolFeeAmount)) {
            return true;
        }
    }
    return false;
}
exports.includesProtocolFee = includesProtocolFee;
function getPaymentElementsFromInvoice(invoice) {
    const payToArray = parseStringifiedArray(invoice.payToArrayStringified);
    const amountsDueArray = parseStringifiedArray(invoice.amountsDueArrayStringified);
    let result = [];
    for (let i = 0; i < payToArray.length; i++) {
        result.push({
            payTo: payToArray[i],
            amountDue: amountsDueArray[i]
        });
    }
    return result;
}
exports.getPaymentElementsFromInvoice = getPaymentElementsFromInvoice;
function getTotalAmountDueFromPaymentElementsArray(paymentElementsArray) {
    let totalAmountDue = ethers_1.BigNumber.from(0);
    for (let element of paymentElementsArray) {
        totalAmountDue = totalAmountDue.add(ethers_1.BigNumber.from(element.amountDue));
    }
    return totalAmountDue.toString();
}
exports.getTotalAmountDueFromPaymentElementsArray = getTotalAmountDueFromPaymentElementsArray;
function getTotalAmountDueFromAmountsDueArray(amountsDueArray) {
    let totalAmountDue = ethers_1.BigNumber.from(0);
    for (let amountDue of amountsDueArray) {
        totalAmountDue = totalAmountDue.add(ethers_1.BigNumber.from(amountDue));
    }
    return totalAmountDue.toString();
}
exports.getTotalAmountDueFromAmountsDueArray = getTotalAmountDueFromAmountsDueArray;
function parseStringifiedArray(str) {
    return JSON.parse(str);
}
exports.parseStringifiedArray = parseStringifiedArray;
function getCurrencyTokenAddress({ tokenName, chainId }) {
    if (isNaN(chainId))
        throw new Error("chainId must be a number");
    let networkName = (0, contracts_helper_1.getNetworkNameFromChainId)(chainId);
    return (0, contracts_helper_1.getTokenFromConfig)({ tokenName, networkName }).address;
}
exports.getCurrencyTokenAddress = getCurrencyTokenAddress;
function encodeInvoice(invoiceData) {
    return JSON.stringify(invoiceData);
}
exports.encodeInvoice = encodeInvoice;
function decodeInvoice(invoiceData) {
    return JSON.parse(invoiceData);
}
exports.decodeInvoice = decodeInvoice;
function validateInvoice(invoiceData) {
    const requiredFields = [
        'payspecContractAddress',
        'metadataHash',
        'nonce',
        'token',
        'chainId',
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
    if (!ethers_1.ethers.utils.isAddress(invoiceData.token))
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
        if (!ethers_1.ethers.utils.isAddress(payToAddress))
            throw new Error('payToAddress must be an address');
    });
    //total amount due must be equal to sum of amounts due array
    /* let totalAmountDue = BigNumber.from(invoiceData.totalAmountDue)
     let sumAmountsDue = BigNumber.from(0)
     amountsDueArray.forEach( (amountDue) => {
       sumAmountsDue = sumAmountsDue.add( BigNumber.from(amountDue) )
     })
   
     if(!totalAmountDue.eq(sumAmountsDue)) throw new Error('totalAmountDue must be equal to sum of amountsDueArray')
   */
    return true;
}
exports.validateInvoice = validateInvoice;
function getPayspecContractAddressFromChainId(chainId) {
    const networkName = (0, contracts_helper_1.getNetworkNameFromChainId)(chainId);
    return getPayspecContractAddress(networkName);
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
function getSmartInvoiceURLWithPaymentsArray({ baseUrl, tokenAddress, paymentsArray, chainId, metadata, nonce, expiration, expectedUUID }) {
    let payToArray = [];
    let payAmountArray = [];
    for (let payment of paymentsArray) {
        payToArray.push(payment.payTo);
        payAmountArray.push(payment.amountDue);
    }
    return getSmartInvoiceURL({
        baseUrl,
        tokenAddress,
        payTo: JSON.stringify(payToArray),
        payAmount: JSON.stringify(payAmountArray),
        chainId,
        metadata,
        nonce,
        expiration,
        expectedUUID
    });
}
exports.getSmartInvoiceURLWithPaymentsArray = getSmartInvoiceURLWithPaymentsArray;
function getSmartInvoiceURL({ baseUrl, tokenAddress, payTo, payAmount, chainId, metadata, nonce, expiration, expectedUUID }) {
    const metadataHash = getMetadataHash(metadata); //bytes32 
    const params = new URLSearchParams({
        payAmount,
        tokenAddress,
        payTo,
        chainId: chainId.toString(),
        nonce: nonce.toString(),
        expiration: expiration.toString()
    });
    for (let [key, value] of Object.entries(metadata)) {
        params.append(key, value);
    }
    const url = `${baseUrl}?${params.toString()}`;
    console.log(url); // "https://example.com/path/to/resource?color=blue&number=1"
    return url;
}
exports.getSmartInvoiceURL = getSmartInvoiceURL;
function getMetadataHash(metadata) {
    //sort entries so the order does not matter 
    const sortedEntries = Object.entries(metadata).sort((a, b) => a[0].localeCompare(b[0]));
    const sortedMetadata = Object.fromEntries(sortedEntries);
    let metadata_keys = Object.keys(sortedMetadata);
    let metadata_values = Object.values(sortedMetadata);
    const result = ethers_1.ethers.utils.solidityKeccak256(['string[]', 'string[]'], [metadata_keys, metadata_values]);
    return result;
}
exports.getMetadataHash = getMetadataHash;
/*

this is not deterministic WRT to the uuid !

*/
function generatePayspecInvoiceSimple({ chainId, metadataHash, tokenAddress, paymentsArray, durationSeconds }) {
    const payspecContractAddress = getPayspecContractAddressFromChainId(chainId);
    const nonce = getPayspecRandomNonce();
    const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;
    const expiresAt = getPayspecExpiresInDelta(durationSeconds ? durationSeconds : ONE_WEEK_SECONDS, 'seconds');
    const { totalAmountDue, payToArrayStringified, amountsDueArrayStringified } = getPayspecPaymentDataFromPaymentsArray(paymentsArray);
    const invoice = {
        payspecContractAddress: payspecContractAddress,
        metadataHash,
        nonce,
        token: tokenAddress,
        chainId: chainId.toString(),
        payToArrayStringified,
        amountsDueArrayStringified,
        expiresAt
    };
    invoice.invoiceUUID = getPayspecInvoiceUUID(invoice);
    return invoice;
}
exports.generatePayspecInvoiceSimple = generatePayspecInvoiceSimple;
/*
This should be deterministic
*/
function generatePayspecInvoice({ payspecContractAddress, chainId, metadataHash, tokenAddress, paymentsArray, expiration, nonce }) {
    //const payspecContractAddress = getPayspecContractAddressFromChainId(chainId)
    //const nonce = getPayspecRandomNonce()
    const expiresAt = expiration;
    const { totalAmountDue, payToArrayStringified, amountsDueArrayStringified } = getPayspecPaymentDataFromPaymentsArray(paymentsArray);
    const invoice = {
        payspecContractAddress: payspecContractAddress,
        metadataHash,
        nonce,
        token: tokenAddress,
        chainId: chainId.toString(),
        payToArrayStringified,
        amountsDueArrayStringified,
        expiresAt
    };
    invoice.invoiceUUID = getPayspecInvoiceUUID(invoice);
    return invoice;
}
exports.generatePayspecInvoice = generatePayspecInvoice;
//---------
function userPayInvoice({ from, invoiceData, provider }) {
    return __awaiter(this, void 0, void 0, function* () {
        //let netName = getNetworkNameFromChainId(chainId)
        //let networkName = netName? netName : 'mainnet'
        let payspecABI = getPayspecContractABI();
        let payspecContractInstance = new ethers_1.Contract(invoiceData.payspecContractAddress, payspecABI);
        let metadataHash = invoiceData.metadataHash;
        let nonce = ethers_1.BigNumber.from(invoiceData.nonce).toString();
        let token = invoiceData.token;
        let chainId = ethers_1.BigNumber.from(invoiceData.chainId).toString();
        let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified);
        let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified);
        let ethBlockExpiresAt = invoiceData.expiresAt;
        let totalAmountDue = getTotalAmountDueFromAmountsDueArray(amountsDueArray);
        let expectedUUID = invoiceData.invoiceUUID;
        let netName = (0, contracts_helper_1.getNetworkNameFromChainId)(parseInt(invoiceData.chainId));
        let expectedPayspecAddress = getPayspecContractAddress(netName);
        if (invoiceData.payspecContractAddress != expectedPayspecAddress) {
            console.error('Contract address mismatch', expectedPayspecAddress, invoiceData);
        }
        let signer = provider.getSigner();
        let usesEther = (token == exports.ETH_ADDRESS);
        let totalAmountDueEth = usesEther ? totalAmountDue : '0';
        //calculate value eth -- depends on tokenAddre in invoice data 
        let valueEth = ethers_1.utils.parseUnits(totalAmountDueEth, 'wei').toHexString();
        let contractInvoiceUUID = yield payspecContractInstance.connect(signer).getInvoiceUUID(token, payToArray, amountsDueArray, nonce, chainId, metadataHash, ethBlockExpiresAt);
        if (contractInvoiceUUID != invoiceData.invoiceUUID) {
            console.error('contract MISMATCH UUID ', contractInvoiceUUID, invoiceData);
            throw new Error("Mismatching UUID calculated");
        }
        try {
            let tx = yield payspecContractInstance.connect(signer).createAndPayInvoice(token, payToArray, amountsDueArray, nonce, chainId, metadataHash, ethBlockExpiresAt, expectedUUID, { from, value: valueEth });
            return { success: true, data: tx };
        }
        catch (err) {
            return { success: false, error: err };
        }
    });
}
exports.userPayInvoice = userPayInvoice;
//# sourceMappingURL=index.js.map