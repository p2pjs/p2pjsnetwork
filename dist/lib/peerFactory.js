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
var logger_1 = __importDefault(require("./logger"));
var events_1 = require("events");
var partialPeer_1 = __importDefault(require("./partialPeer"));
;
var PeerFactory = /** @class */ (function (_super) {
    __extends(PeerFactory, _super);
    function PeerFactory(peerConfiguration) {
        var _this = _super.call(this) || this;
        _this.partialPeers = {};
        _this.peerConfiguration = peerConfiguration;
        return _this;
    }
    PeerFactory.prototype.close = function () {
        Object.entries(this.partialPeers).forEach(function (_a) {
            var _ = _a[0], value = _a[1];
            value.close();
        });
    };
    PeerFactory.prototype.createOffer = function (linkId) {
        return __awaiter(this, void 0, void 0, function () {
            var newPartialPeer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newPartialPeer = new partialPeer_1["default"](this.peerConfiguration);
                        this.onEvents(newPartialPeer, linkId);
                        this.partialPeers[linkId] = newPartialPeer;
                        return [4 /*yield*/, newPartialPeer.createOffer()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PeerFactory.prototype.recceiveOffer = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var newPartialPeer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newPartialPeer = new partialPeer_1["default"](this.peerConfiguration);
                        this.onEvents(newPartialPeer, payload.linkId);
                        this.partialPeers[payload.linkId] = newPartialPeer;
                        return [4 /*yield*/, newPartialPeer.recceiveOffer(payload.offer)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PeerFactory.prototype.receiveAnswer = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var partialPeer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(payload.linkId in this.partialPeers)) return [3 /*break*/, 2];
                        partialPeer = this.partialPeers[payload.linkId];
                        return [4 /*yield*/, partialPeer.recceiveAnswer(payload.answer)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        logger_1["default"].error('Answer recceived in unknown link id');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PeerFactory.prototype.recceiveCandidate = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var partialPeer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(payload.linkId in this.partialPeers)) return [3 /*break*/, 2];
                        partialPeer = this.partialPeers[payload.linkId];
                        return [4 /*yield*/, partialPeer.addCandidate(payload.candidate)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        logger_1["default"].error('Candidate recceived in unknown link id');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PeerFactory.prototype.onEvents = function (newPartialPeer, linkId) {
        var _this = this;
        newPartialPeer.on('icecandidate', function (candidate) {
            _this.emit('icecandidate', linkId, candidate);
        });
        newPartialPeer.on('completeConnection', function (peer) {
            newPartialPeer.removeAllListeners();
            delete _this.partialPeers[linkId];
            _this.emit('connection', linkId, peer);
        });
    };
    return PeerFactory;
}(events_1.EventEmitter));
exports["default"] = PeerFactory;
//# sourceMappingURL=peerFactory.js.map