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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var peer_1 = __importDefault(require("./peer"));
var events_1 = require("events");
var PartialPeer = /** @class */ (function (_super) {
    __extends(PartialPeer, _super);
    function PartialPeer(peerConfiguration, dataChannelInit) {
        var _this = _super.call(this) || this;
        _this.peerConnection = new RTCPeerConnection(peerConfiguration === null || peerConfiguration === void 0 ? void 0 : peerConfiguration.rtcConfiguration);
        _this.receiverSocket = _this.peerConnection.createDataChannel('receiver', dataChannelInit);
        _this.peerConnection.addEventListener('datachannel', _this.onCompleteConnection.bind(_this));
        _this.peerConnection.addEventListener('icecandidate', _this.onIceCandidate.bind(_this));
        return _this;
    }
    PartialPeer.prototype.close = function () {
        this.peerConnection.close();
        this.receiverSocket.close();
    };
    PartialPeer.prototype.createOffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var offer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peerConnection.createOffer()];
                    case 1:
                        offer = _a.sent();
                        return [4 /*yield*/, this.peerConnection.setLocalDescription(offer)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, offer];
                }
            });
        });
    };
    PartialPeer.prototype.recceiveOffer = function (offer) {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peerConnection.setRemoteDescription(offer)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.peerConnection.createAnswer()];
                    case 2:
                        answer = _a.sent();
                        return [4 /*yield*/, this.peerConnection.setLocalDescription(answer)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, answer];
                }
            });
        });
    };
    PartialPeer.prototype.recceiveAnswer = function (answer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peerConnection.setRemoteDescription(answer)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PartialPeer.prototype.addCandidate = function (candidate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peerConnection.addIceCandidate(candidate)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PartialPeer.prototype.onIceCandidate = function (event) {
        this.emit('icecandidate', event.candidate);
    };
    PartialPeer.prototype.onCompleteConnection = function (event) {
        this.peerConnection.removeEventListener('datachannel', this.onCompleteConnection.bind(this));
        this.peerConnection.removeEventListener('icecandidate', this.onIceCandidate.bind(this));
        this.emit('completeConnection', new peer_1["default"](this.peerConnection, this.receiverSocket, event.channel));
    };
    return PartialPeer;
}(events_1.EventEmitter));
exports["default"] = PartialPeer;
//# sourceMappingURL=partialPeer.js.map