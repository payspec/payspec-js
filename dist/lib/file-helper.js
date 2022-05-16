"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const web3_utils_1 = __importDefault(require("web3-utils"));
class FileHelper {
    static readJSONFile(uri) {
        let input = fs_1.default.readFileSync(path_1.default.resolve(uri), { encoding: 'utf8', flag: 'r' });
        return JSON.parse(input);
    }
    static readLocalFile(path) {
        let output = fs_1.default.readFileSync(path, { encoding: 'utf8' });
        return output;
    }
    static mkdirSync(path) {
        try {
            fs_1.default.mkdirSync(path);
        }
        catch (e) {
            //console.error(e)
        }
    }
    static addRandomSaltToFileName(fileName) {
        let fileNameSalt = web3_utils_1.default.randomHex(16);
        let fileNamePrefix = fileName.split('.')[0];
        let fileNamePostfix = fileName.split('.')[1];
        return fileNamePrefix.concat('_').concat(fileNameSalt).concat('.').concat(fileNamePostfix);
    }
}
exports.default = FileHelper;
//# sourceMappingURL=file-helper.js.map