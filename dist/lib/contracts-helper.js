"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtocolFeeConfig = exports.getTokenFromConfig = exports.getNetworkNameFromChainId = exports.getDeploymentConfig = void 0;
const file_helper_1 = require("./file-helper");
/*
Get the deployment data for a contract, including the address and abi
*/
function getDeploymentConfig(networkName, contractName) {
    if (!contractName)
        contractName = 'Payspec';
    let f = (0, file_helper_1.readJSONFile)(`deployments/${networkName}/${contractName}.json`);
    if (!f.address || !f.abi)
        throw new Error('Could not load deployment file from Payspec');
    return f;
}
exports.getDeploymentConfig = getDeploymentConfig;
function getNetworkNameFromChainId(chainId) {
    switch (chainId) {
        case 1: return 'mainnet';
        case 4: return 'rinkeby';
        case 5: return 'goerli';
        default: return 'unknown';
    }
}
exports.getNetworkNameFromChainId = getNetworkNameFromChainId;
function getTokenFromConfig({ tokenName, networkName }) {
    let tokensConfig = (0, file_helper_1.readJSONFile)(`config/tokens.json`);
    let tokenData = tokensConfig[networkName.toLowerCase()][tokenName.toLowerCase()];
    if (!tokenData.address || !tokenData.decimals || !tokenData.symbol)
        throw new Error('Could not load token config from Payspec');
    return tokenData;
}
exports.getTokenFromConfig = getTokenFromConfig;
function getProtocolFeeConfig() {
    return (0, file_helper_1.readJSONFile)('config/protocol-fee-config.json');
}
exports.getProtocolFeeConfig = getProtocolFeeConfig;
//# sourceMappingURL=contracts-helper.js.map