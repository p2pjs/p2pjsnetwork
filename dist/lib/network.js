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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var events_1 = require("events");
var enums_1 = require("./enums");
var logger_1 = __importStar(require("./logger"));
var utils_1 = require("./utils");
get;
availablePeers();
ReadonlyArray();
broadcast(type, string, payload, any);
void ;
close();
void ;
;
var Network = /** @class */ (function (_super) {
    __extends(Network, _super);
    function Network(networkConfig) {
        var _this = _super.call(this) || this;
        _this.peers = {};
        _this.receivedIds = {};
        _this.networkConfig = __assign({ logLevel: logger_1.LogLevel.Disabled, garbageCollectorInterval: 60000, idSaltLength: 8, messageLifespan: 300 }, networkConfig);
        logger_1["default"].logLevel = _this.networkConfig.logLevel;
        _this.garbageCollectorInterval = setInterval(_this.collectGarbage.bind(_this), _this.networkConfig.garbageCollectorInterval);
        return _this;
    }
    Object.defineProperty(Network.prototype, "availablePeers", {
        get: function () {
            return Object.values(this.peers);
        },
        enumerable: false,
        configurable: true
    });
    Network.prototype.collectGarbage = function () {
        var _this = this;
        logger_1["default"].log('Collecting garbage...');
        Object.keys(this.receivedIds).forEach(function (id) {
            if (new Date() > new Date(_this.receivedIds[id].ttl)) {
                delete _this.receivedIds[id];
            }
        });
    };
    Network.prototype.close = function () {
        Object.entries(this.peers).forEach(function (_a) {
            var _ = _a[0], value = _a[1];
            value.close();
        });
        clearInterval(this.garbageCollectorInterval);
    };
    Network.prototype.addPeer = function (peerId, peer) {
        var _this = this;
        this.peers[peerId] = peer;
        logger_1["default"].log("Peer connected - " + Object.keys(this.peers).length);
        this.emit('connection', peerId, peer);
        peer.on('message', this.handleMessage.bind(this));
        peer.on('close', function (peer) { return _this.connectionClosed(peerId, peer); });
    };
    Network.prototype.connectionClosed = function (peerId, peer) {
        delete this.peers[peerId];
        logger_1["default"].log(Object.keys(this.peers).length + " peers connected");
        this.emit('close', peerId, peer);
    };
    Network.prototype.handleMessage = function (message) {
        switch (message.type) {
            case enums_1.NetworkMessageTypes.Broadcast:
                if (!Object.keys(this.receivedIds).includes(message.id)) {
                    this.receivedIds[message.id] = utils_1.decodeTimespanedId(message.id);
                    this.broadcastMessage(message);
                    this.emit('message', message.payload);
                }
                break;
            default:
                this.emit('message', message);
                break;
        }
    };
    Network.prototype.broadcastMessage = function (message) {
        Object.entries(this.peers).forEach(function (_a) {
            var _ = _a[0], value = _a[1];
            value.sendTraced(message);
        });
    };
    Network.prototype.broadcast = function (type, payload) {
        var message = {
            type: enums_1.NetworkMessageTypes.Broadcast,
            payload: {
                type: type,
                payload: payload
            },
            id: utils_1.randomTimespanedId(this.networkConfig.idSaltLength, this.networkConfig.messageLifespan)
        };
        this.receivedIds[message.id] = utils_1.decodeTimespanedId(message.id);
        this.broadcastMessage(message);
    };
    return Network;
}(events_1.EventEmitter));
exports["default"] = Network;
//# sourceMappingURL=network.js.map