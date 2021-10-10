"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.decodeTimespanedId = exports.randomTimespanedId = exports.randomId = void 0;
var base64url_1 = __importDefault(require("base64url"));
var randomId = function (len) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return __spreadArray([], Array(len)).map(function () { return characters.charAt(Math.floor(Math.random() * characters.length)); }).join('');
};
exports.randomId = randomId;
var randomTimespanedId = function (len, lifespan) { return (base64url_1["default"].encode(JSON.stringify({
    salt: exports.randomId(len),
    ttl: Date.now() + lifespan * 1000
}))); };
exports.randomTimespanedId = randomTimespanedId;
var decodeTimespanedId = function (id) { return (JSON.parse(base64url_1["default"].decode(id))); };
exports.decodeTimespanedId = decodeTimespanedId;
//# sourceMappingURL=utils.js.map