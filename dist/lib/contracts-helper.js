"use strict";
//import { readJSONFile } from "./file-helper"
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtocolFeeConfig = exports.getTokenFromConfig = exports.getNetworkNameFromChainId = exports.getPayspecContractAddress = void 0;
const protocolFeeConfig = require("../config/protocol-fee-config.json");
const tokensConfig = require(`../config/tokens.json`);
const payspecDeploymentsConfig = require(`../config/payspec-deployments.json`);
/*
Get the deployment data for a contract, including the address and abi
*/
/* export function getDeploymentConfig(networkName: string, contractName?: string) : {address:string,abi:any} {

   if(!contractName) contractName = 'Payspec'

   let f = readJSONFile(`deployments/${networkName}/${contractName}.json`)

   if(!f.address || !f.abi) throw new Error('Could not load deployment file from Payspec')
   
   return f
 }*/
function getPayspecContractAddress(networkName) {
    return payspecDeploymentsConfig[networkName].payspec.address;
}
exports.getPayspecContractAddress = getPayspecContractAddress;
function getNetworkNameFromChainId(chainId) {
    if (isNaN(chainId))
        throw new Error("chainId must be a number");
    switch (chainId) {
        case 1: return 'mainnet';
        case 4: return 'rinkeby';
        case 5: return 'goerli';
        case 10: return 'optimism';
        default: return 'unknown';
    }
}
exports.getNetworkNameFromChainId = getNetworkNameFromChainId;
function getTokenFromConfig({ tokenName, networkName }) {
    let tokenData = tokensConfig[networkName.toLowerCase()][tokenName.toLowerCase()];
    if (!tokenData.address || !tokenData.decimals || !tokenData.symbol)
        throw new Error('Could not load token config from Payspec');
    return tokenData;
}
exports.getTokenFromConfig = getTokenFromConfig;
function getProtocolFeeConfig() {
    return protocolFeeConfig;
}
exports.getProtocolFeeConfig = getProtocolFeeConfig;
//# sourceMappingURL=contracts-helper.js.map