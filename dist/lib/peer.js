"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var logger_1 = __importDefault(require("./logger"));
var events_1 = require("events");
var Peer = /** @class */ (function (_super) {
    __extends(Peer, _super);
    function Peer(peerConnection, receiverSocket, transmitterSocket, peerConfiguration) {
        var _this = _super.call(this) || this;
        _this.peerConnection = peerConnection;
        _this.receiverSocket = receiverSocket;
        _this.transmitterSocket = transmitterSocket;
        _this.peerConfiguration = __assign({}, peerConfiguration);
        _this.peerConnection.addEventListener("connectionstatechange", _this.connectionStateHandler.bind(_this));
        _this.receiverSocket.onmessage = function (event) { return _this.emit('message', JSON.parse(event.data), _this); };
        return _this;
    }
    Peer.prototype.connectionStateHandler = function () {
        switch (this.peerConnection.iceConnectionState) {
            case "failed":
            case "closed":
            case "disconnected":
                logger_1["default"].warn("Peer dsiconnected");
                this.peerConnection.close();
                this.emit('close', this);
                break;
            case "completed":
                logger_1["default"].log("Connection completed");
                break;
        }
    };
    Peer.prototype.sendTraced = function (message) {
        this.transmitterSocket.send(JSON.stringify(message));
    };
    Peer.prototype.send = function (type, payload) {
        this.transmitterSocket.send(JSON.stringify({
            type: type,
            payload: payload
        }));
    };
    Peer.prototype.close = function () {
        this.peerConnection.close();
        this.receiverSocket.close();
        this.transmitterSocket.close();
    };
    return Peer;
}(events_1.EventEmitter));
exports["default"] = Peer;
//# sourceMappingURL=peer.js.map