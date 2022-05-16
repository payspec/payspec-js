"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deploymentFiles = {
    rinkeby: require('../../deployments/rinkeby/Payspec.json'),
    //mainnet: require('../deployments/mainnet/Payspec.json')
};
class ContractsHelper {
    /*
    Get the deployment data for a contract, including the address and abi
    */
    static getDeploymentConfig(networkName, contractName) {
        //@ts-ignore 
        let contents = deploymentFiles[networkName];
        return contents;
    }
}
exports.default = ContractsHelper;
//# sourceMappingURL=contracts-helper.js.map