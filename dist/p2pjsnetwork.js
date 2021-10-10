// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"FRpO":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function' ? R.apply : function ReflectApply(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
};
var ReflectOwnKeys;

if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}

module.exports = EventEmitter;
module.exports.once = once; // Backwards-compat with node 0.10.x

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.

var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function () {
    return defaultMaxListeners;
  },
  set: function (arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }

    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function () {
  if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}; // Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.


EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }

  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];

  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);

  var doError = type === 'error';
  var events = this._events;
  if (events !== undefined) doError = doError && events.error === undefined;else if (!doError) return false; // If there is no 'error' event listener then throw.

  if (doError) {
    var er;
    if (args.length > 0) er = args[0];

    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    } // At least give some kind of context to the user


    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];
  if (handler === undefined) return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;
  checkListener(listener);
  events = target._events;

  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener); // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object

      events = target._events;
    }

    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] : [existing, listener]; // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    } // Check for listener leak


    m = _getMaxListeners(target);

    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true; // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax

      var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + String(type) + ' listeners ' + 'added. Use emitter.setMaxListeners() to ' + 'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0) return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = {
    fired: false,
    wrapFn: undefined,
    target: target,
    type: type,
    listener: listener
  };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  checkListener(listener);
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
}; // Emits a 'removeListener' event if and only if the listener was removed.


EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;
  checkListener(listener);
  events = this._events;
  if (events === undefined) return this;
  list = events[type];
  if (list === undefined) return this;

  if (list === listener || list.listener === listener) {
    if (--this._eventsCount === 0) this._events = Object.create(null);else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0) return this;
    if (position === 0) list.shift();else {
      spliceOne(list, position);
    }
    if (list.length === 1) events[type] = list[0];
    if (events.removeListener !== undefined) this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events, i;
  events = this._events;
  if (events === undefined) return this; // not listening for removeListener, no need to emit

  if (events.removeListener === undefined) {
    if (arguments.length === 0) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else if (events[type] !== undefined) {
      if (--this._eventsCount === 0) this._events = Object.create(null);else delete events[type];
    }

    return this;
  } // emit removeListener for all listeners on all events


  if (arguments.length === 0) {
    var keys = Object.keys(events);
    var key;

    for (i = 0; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }

    this.removeAllListeners('removeListener');
    this._events = Object.create(null);
    this._eventsCount = 0;
    return this;
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners !== undefined) {
    // LIFO order
    for (i = listeners.length - 1; i >= 0; i--) {
      this.removeListener(type, listeners[i]);
    }
  }

  return this;
};

function _listeners(target, type, unwrap) {
  var events = target._events;
  if (events === undefined) return [];
  var evlistener = events[type];
  if (evlistener === undefined) return [];
  if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;

function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);

  for (var i = 0; i < n; ++i) copy[i] = arr[i];

  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];

  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);

  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }

  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }

      resolve([].slice.call(arguments));
    }

    ;
    eventTargetAgnosticAddListener(emitter, name, resolver, {
      once: true
    });

    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, {
        once: true
      });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }

      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}
},{}],"WOs9":[function(require,module,exports) {
"use strict";

var __read = this && this.__read || function (o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
};

var __spreadArray = this && this.__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogLevel = void 0;
var LOG_PREFIX = 'P2PJSNetwork: ';
var LogLevel;

(function (LogLevel) {
  LogLevel[LogLevel["Disabled"] = 0] = "Disabled";
  LogLevel[LogLevel["Errors"] = 1] = "Errors";
  LogLevel[LogLevel["Warnings"] = 2] = "Warnings";
  LogLevel[LogLevel["All"] = 3] = "All";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

var Logger =
/** @class */
function () {
  function Logger() {
    this.crrLogLevel = LogLevel.Disabled;
  }

  Object.defineProperty(Logger.prototype, "logLevel", {
    get: function get() {
      return this.crrLogLevel;
    },
    set: function set(logLevel) {
      this.crrLogLevel = logLevel;
    },
    enumerable: false,
    configurable: true
  });

  Logger.prototype.log = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this.crrLogLevel >= LogLevel.All) {
      this.print.apply(this, __spreadArray([LogLevel.All], __read(args)));
    }
  };

  Logger.prototype.warn = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this.crrLogLevel >= LogLevel.Warnings) {
      this.print.apply(this, __spreadArray([LogLevel.Warnings], __read(args)));
    }
  };

  Logger.prototype.error = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this.crrLogLevel >= LogLevel.Errors) {
      this.print.apply(this, __spreadArray([LogLevel.Errors], __read(args)));
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

    var copy = __spreadArray([LOG_PREFIX], __read(rest));

    for (var i in copy) {
      if (copy[i] instanceof Error) {
        copy[i] = "(" + copy[i].name + ") " + copy[i].message;
      }
    }

    if (logLevel >= LogLevel.All) {
      console.log.apply(console, __spreadArray([], __read(copy)));
    } else if (logLevel >= LogLevel.Warnings) {
      console.warn.apply(console, __spreadArray(["WARNING"], __read(copy)));
    } else if (logLevel >= LogLevel.Errors) {
      console.error.apply(console, __spreadArray(["ERROR"], __read(copy)));
    }
  };

  return Logger;
}();

exports.default = new Logger();
},{}],"UnXq":[function(require,module,exports) {
"use strict";

var __read = this && this.__read || function (o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
};

var __spreadArray = this && this.__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomId = void 0;

var randomId = function randomId(len) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return __spreadArray([], __read(Array(len))).map(function () {
    return characters.charAt(Math.floor(Math.random() * characters.length));
  }).join('');
};

exports.randomId = randomId;
},{}],"Hxpd":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var logger_1 = __importDefault(require("./logger"));

var events_1 = __importDefault(require("events"));

var utils_1 = require("./utils");

var Peer =
/** @class */
function (_super) {
  __extends(Peer, _super);

  function Peer(peerConnection, receiverSocket, transmitterSocket, peerConfiguration) {
    var _this = _super.call(this) || this;

    _this.peerConnection = peerConnection;
    _this.receiverSocket = receiverSocket;
    _this.transmitterSocket = transmitterSocket;
    _this.peerConfiguration = __assign({
      messageIdLength: 8
    }, peerConfiguration);

    _this.peerConnection.addEventListener("connectionstatechange", _this.connectionStateHandler.bind(_this));

    _this.receiverSocket.onmessage = function (event) {
      return _this.emit('message', JSON.parse(event.data), _this);
    };

    return _this;
  }

  Peer.prototype.connectionStateHandler = function () {
    switch (this.peerConnection.iceConnectionState) {
      case "failed":
      case "closed":
      case "disconnected":
        logger_1.default.warn("Peer dsiconnected");
        this.peerConnection.close();
        this.emit('close', this);
        break;

      case "completed":
        logger_1.default.log("Connection completed");
        break;
    }
  };

  Peer.prototype.send = function (type, payload) {
    var _a;

    this.transmitterSocket.send(JSON.stringify({
      type: type,
      payload: payload,
      id: utils_1.randomId((_a = this.peerConfiguration) === null || _a === void 0 ? void 0 : _a.messageIdLength)
    }));
  };

  return Peer;
}(events_1.default);

exports.default = Peer;
},{"./logger":"WOs9","events":"FRpO","./utils":"UnXq"}],"yXgN":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var peer_1 = __importDefault(require("./peer"));

var events_1 = __importDefault(require("events"));

var PartialPeer =
/** @class */
function (_super) {
  __extends(PartialPeer, _super);

  function PartialPeer(peerConfiguration, dataChannelInit) {
    var _this = _super.call(this) || this;

    _this.peerConnection = new RTCPeerConnection(peerConfiguration === null || peerConfiguration === void 0 ? void 0 : peerConfiguration.rtcConfiguration);
    _this.receiverSocket = _this.peerConnection.createDataChannel('receiver', dataChannelInit);

    _this.peerConnection.addEventListener('datachannel', _this.onCompleteConnection.bind(_this));

    _this.peerConnection.addEventListener('icecandidate', _this.onIceCandidate.bind(_this));

    return _this;
  }

  PartialPeer.prototype.createOffer = function () {
    return __awaiter(this, void 0, Promise, function () {
      var offer;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.peerConnection.createOffer()];

          case 1:
            offer = _a.sent();
            return [4
            /*yield*/
            , this.peerConnection.setLocalDescription(offer)];

          case 2:
            _a.sent();

            return [2
            /*return*/
            , offer];
        }
      });
    });
  };

  PartialPeer.prototype.recceiveOffer = function (offer) {
    return __awaiter(this, void 0, Promise, function () {
      var answer;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.peerConnection.setRemoteDescription(offer)];

          case 1:
            _a.sent();

            return [4
            /*yield*/
            , this.peerConnection.createAnswer()];

          case 2:
            answer = _a.sent();
            return [4
            /*yield*/
            , this.peerConnection.setLocalDescription(answer)];

          case 3:
            _a.sent();

            return [2
            /*return*/
            , answer];
        }
      });
    });
  };

  PartialPeer.prototype.recceiveAnswer = function (answer) {
    return __awaiter(this, void 0, Promise, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.peerConnection.setRemoteDescription(answer)];

          case 1:
            _a.sent();

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  PartialPeer.prototype.addCandidate = function (candidate) {
    return __awaiter(this, void 0, Promise, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.peerConnection.addIceCandidate(candidate)];

          case 1:
            _a.sent();

            return [2
            /*return*/
            ];
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
    this.emit('completeConnection', new peer_1.default(this.peerConnection, this.receiverSocket, event.channel));
  };

  return PartialPeer;
}(events_1.default);

exports.default = PartialPeer;
},{"./peer":"Hxpd","events":"FRpO"}],"KsPy":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var logger_1 = __importDefault(require("./logger"));

var events_1 = __importDefault(require("events"));

var partialPeer_1 = __importDefault(require("./partialPeer"));

;

var PeerFactory =
/** @class */
function (_super) {
  __extends(PeerFactory, _super);

  function PeerFactory(peerConfiguration) {
    var _this = _super.call(this) || this;

    _this.partialPeerPool = {};
    _this.peerConfiguration = peerConfiguration;
    return _this;
  }

  PeerFactory.prototype.createOffer = function (linkId) {
    return __awaiter(this, void 0, void 0, function () {
      var newPartialPeer;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            newPartialPeer = new partialPeer_1.default(this.peerConfiguration);
            this.onEvents(newPartialPeer, linkId);
            this.partialPeerPool[linkId] = newPartialPeer;
            return [4
            /*yield*/
            , newPartialPeer.createOffer()];

          case 1:
            return [2
            /*return*/
            , _a.sent()];
        }
      });
    });
  };

  PeerFactory.prototype.recceiveOffer = function (payload) {
    return __awaiter(this, void 0, Promise, function () {
      var newPartialPeer;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            newPartialPeer = new partialPeer_1.default(this.peerConfiguration);
            this.onEvents(newPartialPeer, payload.linkId);
            this.partialPeerPool[payload.linkId] = newPartialPeer;
            return [4
            /*yield*/
            , newPartialPeer.recceiveOffer(payload.offer)];

          case 1:
            return [2
            /*return*/
            , _a.sent()];
        }
      });
    });
  };

  PeerFactory.prototype.receiveAnswer = function (payload) {
    return __awaiter(this, void 0, Promise, function () {
      var partialPeer;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(payload.linkId in this.partialPeerPool)) return [3
            /*break*/
            , 2];
            partialPeer = this.partialPeerPool[payload.linkId];
            return [4
            /*yield*/
            , partialPeer.recceiveAnswer(payload.answer)];

          case 1:
            _a.sent();

            return [3
            /*break*/
            , 3];

          case 2:
            logger_1.default.error('Answer recceived in unknown link id');
            _a.label = 3;

          case 3:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  PeerFactory.prototype.recceiveCandidate = function (payload) {
    return __awaiter(this, void 0, Promise, function () {
      var partialPeer;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(payload.linkId in this.partialPeerPool)) return [3
            /*break*/
            , 2];
            partialPeer = this.partialPeerPool[payload.linkId];
            return [4
            /*yield*/
            , partialPeer.addCandidate(payload.candidate)];

          case 1:
            _a.sent();

            return [3
            /*break*/
            , 3];

          case 2:
            logger_1.default.error('Candidate recceived in unknown link id');
            _a.label = 3;

          case 3:
            return [2
            /*return*/
            ];
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
      delete _this.partialPeerPool[linkId];

      _this.emit('connection', linkId, peer);
    });
  };

  return PeerFactory;
}(events_1.default);

exports.default = PeerFactory;
},{"./logger":"WOs9","events":"FRpO","./partialPeer":"yXgN"}],"ZRYf":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerMessageTypes = void 0;
var ServerMessageTypes;

(function (ServerMessageTypes) {
  ServerMessageTypes["Link"] = "LINK";
  ServerMessageTypes["Offer"] = "OFFER";
  ServerMessageTypes["Answer"] = "ANSWER";
  ServerMessageTypes["Candidate"] = "CANDIDATE";
  ServerMessageTypes["Complete"] = "COMPLETE";
  ServerMessageTypes["EmptyServerError"] = "EMPTY_SERVER_ERROR";
  ServerMessageTypes["WrongOrExpiredLinkError"] = "WRONG_OR_EXPIRED_LINK_ERROR";
  ServerMessageTypes["WrongMessageFormatError"] = "WRONG_MESSAGE_FORMAT_ERROR";
  ServerMessageTypes["WrongMessageTypeError"] = "WRONG_MESSAGE_TYPE_ERROR";
  ServerMessageTypes["LinkAmountTooHighError"] = "LINK_AMOUNT_TOO_HIGH_ERROR";
  ServerMessageTypes["MaxLinkAmountExceededError"] = "MAX_LINK_AMOUNT_EXCEEDED_ERROR";
})(ServerMessageTypes = exports.ServerMessageTypes || (exports.ServerMessageTypes = {}));

;
},{}],"XH4Q":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __read = this && this.__read || function (o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var logger_1 = __importDefault(require("./logger"));

var peerFactory_1 = __importDefault(require("./peerFactory"));

var enums_1 = require("./enums");

var events_1 = __importDefault(require("events"));

var LinkServerService =
/** @class */
function (_super) {
  __extends(LinkServerService, _super);

  function LinkServerService(linkServerConfig, peerConfiguration) {
    var _a, _b;

    var _this = _super.call(this) || this;

    var protocol = linkServerConfig.secure ? 'wss://' : 'ws://';
    var urlParams = (_b = (_a = linkServerConfig.params) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
      var _b = __read(_a, 2),
          param = _b[0],
          value = _b[1];

      return param + "=" + value;
    }).join('&')) !== null && _b !== void 0 ? _b : '';
    var url = "" + protocol + linkServerConfig.path + ":" + linkServerConfig.port + "?" + urlParams;
    logger_1.default.log('Opening link server socket.');
    _this.webSocket = new WebSocket(url);
    _this.webSocket.onopen = _this.onConnectionOpen.bind(_this);
    _this.webSocket.onclose = _this.onConnectionClose.bind(_this);

    _this.webSocket.onmessage = function (event) {
      _this.handleMessage(JSON.parse(event.data));
    };

    _this.peerFactory = new peerFactory_1.default(peerConfiguration);

    _this.peerFactory.on('icecandidate', _this.onPeerIceCandidate.bind(_this));

    _this.peerFactory.on('connection', _this.onPeerConnection.bind(_this));

    return _this;
  }

  LinkServerService.prototype.searchPeers = function (amount) {
    logger_1.default.log('Starting peer search.');
    this.send(enums_1.ServerMessageTypes.Link, {
      amount: amount
    });
  };

  LinkServerService.prototype.onPeerConnection = function (linkId, peer) {
    this.send(enums_1.ServerMessageTypes.Complete, {
      linkId: linkId
    });
    this.emit('connection', peer);
  };

  LinkServerService.prototype.onPeerIceCandidate = function (linkId, candidate) {
    logger_1.default.log('Peer candidate recceived.');
    this.send(enums_1.ServerMessageTypes.Candidate, {
      linkId: linkId,
      candidate: candidate
    });
  };

  LinkServerService.prototype.onConnectionOpen = function () {
    logger_1.default.log('Link server socket opened.');
    this.emit('open');
  };

  LinkServerService.prototype.onConnectionClose = function () {
    logger_1.default.log('Link server socket closed.');
  };

  LinkServerService.prototype.send = function (type, payload) {
    this.webSocket.send(JSON.stringify({
      type: type,
      payload: payload
    }));
  };

  LinkServerService.prototype.handleMessage = function (message) {
    var _this = this;

    switch (message.type) {
      case enums_1.ServerMessageTypes.Link:
        var linkList = message.payload.links;
        logger_1.default.log(linkList.length + " links found");
        logger_1.default.log('Starting connections...');
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
        logger_1.default.log('Offer recceived.');
        this.peerFactory.recceiveOffer(message.payload).then(function (answer) {
          _this.send(enums_1.ServerMessageTypes.Answer, {
            answer: answer,
            linkId: message.payload.linkId
          });
        });
        break;

      case enums_1.ServerMessageTypes.Answer:
        this.peerFactory.receiveAnswer(message.payload);
        break;

      case enums_1.ServerMessageTypes.Candidate:
        this.peerFactory.recceiveCandidate(message.payload);
        break;

      case enums_1.ServerMessageTypes.EmptyServerError:
        logger_1.default.warn(message.payload.message);
        this.emit('emptylinkserver');
        break;

      case enums_1.ServerMessageTypes.LinkAmountTooHighError:
      case enums_1.ServerMessageTypes.MaxLinkAmountExceededError:
        logger_1.default.error(message.payload.message);
        this.emit('configurationError', message);
        break;

      case enums_1.ServerMessageTypes.WrongMessageTypeError:
      case enums_1.ServerMessageTypes.WrongOrExpiredLinkError:
      case enums_1.ServerMessageTypes.WrongMessageFormatError:
        logger_1.default.error(message.payload.message);
        this.emit('communicationError', message);
        break;
    }
  };

  return LinkServerService;
}(events_1.default);

exports.default = LinkServerService;
},{"./logger":"WOs9","./peerFactory":"KsPy","./enums":"ZRYf","events":"FRpO"}],"PuRK":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var events_1 = __importDefault(require("events"));

var linkServerService_1 = __importDefault(require("./linkServerService"));

var logger_1 = __importStar(require("./logger"));

;

var Network =
/** @class */
function (_super) {
  __extends(Network, _super);

  function Network(networkConfig) {
    var _this = _super.call(this) || this;

    _this.peers = [];

    var config = __assign({
      linkServerConfig: {
        path: 'localhost',
        secure: false,
        port: 7070
      },
      logLevel: logger_1.LogLevel.Disabled,
      startPeersCount: 3
    }, networkConfig);

    logger_1.default.logLevel = config.logLevel;
    _this.startPeersCount = config.startPeersCount;
    _this.linkServer = new linkServerService_1.default(config.linkServerConfig);

    _this.linkServer.on('open', _this.start.bind(_this));

    _this.linkServer.on('connection', _this.connectionReceived.bind(_this));

    return _this;
  }

  Object.defineProperty(Network.prototype, "availablePeers", {
    get: function get() {
      return this.peers;
    },
    enumerable: false,
    configurable: true
  });

  Network.prototype.start = function () {
    this.linkServer.searchPeers(this.startPeersCount);
  };

  Network.prototype.connectionReceived = function (peer) {
    this.peers.push(peer);
    logger_1.default.log("Peer connected - " + this.peers.length);
    this.emit('connection', peer);
    peer.on('message', this.handleMessage.bind(this));
    peer.on('close', this.connectionClosed.bind(this));
  };

  Network.prototype.connectionClosed = function (peer) {
    var index = this.peers.indexOf(peer);
    this.peers.splice(index, 1);
    logger_1.default.log(this.peers.length + " peers connected");
    this.emit('close', peer);
  };

  Network.prototype.handleMessage = function (message) {
    console.log(message);
  };

  return Network;
}(events_1.default);

exports.default = Network;
},{"events":"FRpO","./linkServerService":"XH4Q","./logger":"WOs9"}],"iTK6":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.p2pjsnetwork = void 0;

var network_1 = __importDefault(require("./network"));

var logger_1 = require("./logger");

exports.p2pjsnetwork = {
  Network: network_1.default,
  LogLevel: logger_1.LogLevel
};
exports.default = network_1.default;
window.p2pjsnetwork = exports.p2pjsnetwork;
},{"./network":"PuRK","./logger":"WOs9"}]},{},["iTK6"], null)
//# sourceMappingURL=/p2pjsnetwork.js.map