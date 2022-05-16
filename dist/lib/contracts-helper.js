"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_helper_1 = __importDefault(require("./file-helper"));
class ContractsHelper {
    /*
    Get the deployment data for a contract, including the address and abi
    */
    static getDeploymentConfig(networkName, contractName) {
        let contents = file_helper_1.default.readJSONFile(`deployments/${networkName}/${contractName}.json`);
        return contents;
    }
}
exports.default = ContractsHelper;
//# sourceMappingURL=contracts-helper.js.map