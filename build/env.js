"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = getEnv;
function getEnv(key) {
    var value = process.env[key];
    if (value === undefined) {
        throw new Error("Environment variable ".concat(key, " is missing and has no default value."));
    }
    return value;
}
