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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var logger_1 = __importDefault(require("./logger"));
var peerFactory_1 = __importDefault(require("./peerFactory"));
var enums_1 = require("./enums");
var events_1 = require("events");
var network_1 = __importDefault(require("./network"));
var DiscoverClient = /** @class */ (function (_super) {
    __extends(DiscoverClient, _super);
    function DiscoverClient(linkServerConfig, networkConfig, peerConfiguration) {
        var _a, _b;
        var _this = _super.call(this) || this;
        var protocol = linkServerConfig.secure ? 'wss://' : 'ws://';
        var urlParams = (_b = (_a = linkServerConfig.params) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
            var param = _a[0], value = _a[1];
            return param + "=" + value;
        }).join('&')) !== null && _b !== void 0 ? _b : '';
        var url = "" + protocol + linkServerConfig.path + ":" + linkServerConfig.port + "?" + urlParams;
        logger_1["default"].log('Opening discover server socket.');
        _this.webSocket = new WebSocket(url);
        _this.webSocket.onopen = _this.onConnectionOpen.bind(_this);
        _this.webSocket.onclose = _this.onConnectionClose.bind(_this);
        _this.webSocket.onmessage = function (event) {
            _this.handleMessage(JSON.parse(event.data));
        };
        _this.peerFactory = new peerFactory_1["default"](peerConfiguration);
        _this.peerFactory.on('icecandidate', _this.onPeerIceCandidate.bind(_this));
        _this.peerFactory.on('connection', _this.onPeerConnection.bind(_this));
        _this.network = new network_1["default"](networkConfig);
        return _this;
    }
    DiscoverClient.prototype.discover = function (amount) {
        logger_1["default"].log('Starting peer search.');
        this.send(enums_1.ServerMessageTypes.Link, {
            amount: amount
        });
        return this.network;
    };
    DiscoverClient.prototype.close = function () {
        this.webSocket.close();
        this.peerFactory.close();
    };
    DiscoverClient.prototype.onPeerConnection = function (linkId, peer) {
        this.send(enums_1.ServerMessageTypes.Complete, { linkId: linkId });
        this.network.addPeer(linkId, peer);
    };
    DiscoverClient.prototype.onPeerIceCandidate = function (linkId, candidate) {
        logger_1["default"].log('Peer candidate recceived.');
        this.send(enums_1.ServerMessageTypes.Candidate, { linkId: linkId, candidate: candidate });
    };
    DiscoverClient.prototype.onConnectionOpen = function () {
        logger_1["default"].log('Link server socket opened.');
        this.emit('open');
    };
    DiscoverClient.prototype.onConnectionClose = function () {
        logger_1["default"].log('Link server socket closed.');
    };
    DiscoverClient.prototype.send = function (type, payload) {
        this.webSocket.send(JSON.stringify({ type: type, payload: payload }));
    };
    DiscoverClient.prototype.handleMessage = function (message) {
        var _this = this;
        switch (message.type) {
            case enums_1.ServerMessageTypes.Link:
                var linkList = message.payload.links;
                logger_1["default"].log(linkList.length + " links found");
                logger_1["default"].log('Starting connections...');
                linkList.forEach(function (linkId) {
                    _this.peerFactory.createOffer(linkId).then(function (offer) {
                        _this.send(enums_1.ServerMessageTypes.Offer, {
                            linkId: linkId,
                            offer: offer
                        });
                    });
                });
                break;
            case enums_1.ServerMessageTypes.Offer:
                logger_1["default"].log('Offer recceived.');
                this.peerFactory
                    .recceiveOffer(message.payload)
                    .then(function (answer) {
                    _this.send(enums_1.ServerMessageTypes.Answer, {
                        answer: answer,
                        linkId: message.payload.linkId
                    });
                });
                break;
            case enums_1.ServerMessageTypes.Answer:
                this.peerFactory
                    .receiveAnswer(message.payload);
                break;
            case enums_1.ServerMessageTypes.Candidate:
                this.peerFactory.recceiveCandidate(message.payload);
                break;
            case enums_1.ServerMessageTypes.EmptyServerError:
                logger_1["default"].warn(message.payload.message);
                this.emit('emptylinkserver');
                break;
            case enums_1.ServerMessageTypes.LinkAmountTooHighError:
            case enums_1.ServerMessageTypes.MaxLinkAmountExceededError:
                logger_1["default"].error(message.payload.message);
                this.emit('configurationError', message);
                break;
            case enums_1.ServerMessageTypes.WrongMessageTypeError:
            case enums_1.ServerMessageTypes.WrongOrExpiredLinkError:
            case enums_1.ServerMessageTypes.WrongMessageFormatError:
                logger_1["default"].error(message.payload.message);
                this.emit('communicationError', message);
                break;
        }
    };
    return DiscoverClient;
}(events_1.EventEmitter));
exports["default"] = DiscoverClient;
//# sourceMappingURL=discoverClient.js.map