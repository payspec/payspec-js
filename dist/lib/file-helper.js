"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJSONFile = void 0;
const fs = require('fs');
const path = require('path');
function readJSONFile(uri) {
    let input = fs.readFileSync(path.resolve(uri), { encoding: 'utf8', flag: 'r' });
    return JSON.parse(input);
}
exports.readJSONFile = readJSONFile;
//# sourceMappingURL=file-helper.js.map