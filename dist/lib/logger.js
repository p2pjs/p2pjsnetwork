"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.LogLevel = void 0;
var LOG_PREFIX = 'P2PJSNetwork: ';
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Disabled"] = 0] = "Disabled";
    LogLevel[LogLevel["Errors"] = 1] = "Errors";
    LogLevel[LogLevel["Warnings"] = 2] = "Warnings";
    LogLevel[LogLevel["All"] = 3] = "All";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var Logger = /** @class */ (function () {
    function Logger() {
        this.crrLogLevel = LogLevel.Disabled;
    }
    Object.defineProperty(Logger.prototype, "logLevel", {
        get: function () { return this.crrLogLevel; },
        set: function (logLevel) { this.crrLogLevel = logLevel; },
        enumerable: false,
        configurable: true
    });
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.crrLogLevel >= LogLevel.All) {
            this.print.apply(this, __spreadArray([LogLevel.All], args));
        }
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.crrLogLevel >= LogLevel.Warnings) {
            this.print.apply(this, __spreadArray([LogLevel.Warnings], args));
        }
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.crrLogLevel >= LogLevel.Errors) {
            this.print.apply(this, __spreadArray([LogLevel.Errors], args));
        }
    };
    Logger.prototype.setLogFunction = function (fn) {
        this.print = fn;
    };
    Logger.prototype.print = function (logLevel) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var copy = __spreadArray([LOG_PREFIX], rest);
        for (var i in copy) {
            if (copy[i] instanceof Error) {
                copy[i] = "(" + copy[i].name + ") " + copy[i].message;
            }
        }
        if (logLevel >= LogLevel.All) {
            console.log.apply(console, copy);
        }
        else if (logLevel >= LogLevel.Warnings) {
            console.warn.apply(console, __spreadArray(["WARNING"], copy));
        }
        else if (logLevel >= LogLevel.Errors) {
            console.error.apply(console, __spreadArray(["ERROR"], copy));
        }
    };
    return Logger;
}());
exports["default"] = new Logger();
//# sourceMappingURL=logger.js.map