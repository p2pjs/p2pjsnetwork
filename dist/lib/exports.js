"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.LogLevel = exports.p2pjsnetwork = void 0;
var network_1 = __importDefault(require("./network"));
var logger_1 = require("./logger");
exports.p2pjsnetwork = {
    Network: network_1["default"],
    LogLevel: logger_1.LogLevel
};
var logger_2 = require("./logger");
__createBinding(exports, logger_2, "LogLevel");
exports["default"] = network_1["default"];
window.p2pjsnetwork = exports.p2pjsnetwork;
//# sourceMappingURL=exports.js.map