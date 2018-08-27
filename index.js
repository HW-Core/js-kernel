'use strict';
/*
 * VERY FIRST DEFINES AND LEGACY
 */

var __global = typeof window === 'object' ? window : global;

var hwc_conf = { paths: {} };

hwc_conf.path_core = __global.hwc_path ? __global.hwc_path : "modules/hw-code";

hwc_conf.paths.hwc_js_kernel = hwc_conf.path_core + "js-kernel/index";
hwc_conf.paths.hwc_js_modules_path = hwc_conf.path_core + "js-modules/";
hwc_conf.paths.hwc_js_modules_weakmap = hwc_conf.paths.hwc_js_modules_path + "weakmap/index";
hwc_conf.paths.hwc_js_modules_rsvp = hwc_conf.paths.hwc_js_modules_path + "rsvp/index";
hwc_conf.paths.hwc_js_modules_jquery = hwc_conf.paths.hwc_js_modules_path + "jquery/index";
hwc_conf.paths.hwc_js_modules_requirenode = hwc_conf.paths.hwc_js_modules_path + "requirejs/r/index";
hwc_conf.paths.hwc_js_modules_requirejs = hwc_conf.paths.hwc_js_modules_path + "requirejs/requirejs/index";


__global.hwc_conf = hwc_conf;


//if (typeof __webpack_require__ === "function") {
//    require("../js-modules/requirejs/requirejs/require.js");
//}

// ONLY FOR IE8-
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (what, i) {
        i = i || 0;
        var L = this.length;
        while (i < L) {
            if (this[i] === what)
                return i;
            ++i;
        }
        return -1;
    };
}

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

(function () {
    /*
     * ==============================
     *
     * Core class
     * @type Obj
     *
     * ==============================
     */

    var HWCore = (function () {
        var _Core = function (id) {
            // each instance of core must define its scope
            var scope = {};
            scope.id = id;
            scope.const = pub_static.const;

            scope.global = scope.const.IN_BROWSER ? window : global;

            // a new instance must return
            // the created scope, not Core class itself
            return scope;
        };

        var pub = _Core.prototype;
        var pub_static = _Core;

        // private static
        var _instance = [];

        pub_static.const = {};
        pub_static.I = function (id, callback) {
            callback = typeof id === "function" && typeof callback === "undefined" ? id : callback;
            id = typeof id !== "string" ? 0 : id;

            if (typeof _instance[id] === "undefined") {
                _instance[id] = {
                    loading: true,
                    inst: null
                };

                _instance[id].inst = new _Core(id);

                if (typeof callback === "function") {
                    callback.apply(_instance[id].inst);
                }
            } else {
                var wait = function () {
                    // if new instance has been commited but not loaded
                    // fully, we must wait before cast the callback
                    if (_instance[id].loading) {
                        setTimeout(wait, 0); // maybe not the best way?
                    } else {
                        if (typeof callback === "function") {
                            callback.apply(_instance[id].inst);
                        }
                    }
                };

                wait();
            }

            return _instance[id];
        };

        pub_static.delInstance = function (id) {
            _instance.splice(id, 1);
        };

        return pub_static;
    })();

    /*
     * ==============================
     *
     * Loader Class
     *
     * ==============================
     */
    function defineLoader($, RSVP) {
        var Loader = function () {
        };

        var pub = Loader.prototype;
        var pub_static = Loader;

        pub_static.paths = {};

        /**
         *
         * @param {String} src -> paths of resource to load
         * @param {Function} callback -> function to cast as callback, if omitted
         * a promise will be returned
         * @param {Object} options :
         *  {Boolean} skipPlg -> skip hwc plugin
         * @returns {Mixed}
         */
        pub_static.load = function (src, callback, options) {
            options = options || {};
            src = Array.isArray(src) ? src : [src];

            function _load(resolve, reject, callback) {
                function done() {
                    var result = arguments;
                    if (callback) {
                        if (typeof callback !== "function")
                            throw new Error("callback type is: " + typeof (callback));

                        callback.apply($, result);
                    } else {
                        resolve.apply(null, result);
                    }
                }

                try {
                    hwc.__requirejs(src, done, function (err) {
                        if (callback) {
                            throw err;
                        } else {
                            reject(err);
                        }
                    });
                } catch (e) {
                    if (callback) {
                        throw new Exception(e);
                    } else {
                        reject(e);
                    }
                }
            }

            return callback && _load(null, null, callback) || new $.Promise(_load)["catch"](function (e) {
                console.error(e); // this is needed because Async lib is not loaded yet
            });
        };

        /**
         *
         * @param {String} src -> path of resource to load
         * @returns {Mixed}
         */
        pub_static.loadSync = function (src) {
            var _src = Array.isArray(src) ? src : [src];

            var lSync = function (url) {
                if ($.const.IN_BROWSER) {
                    _loadSync(url);
                } else {
                    //require(["./"+url]);
                }
            };

            if (_src.length > 1) {
                var modules = [];
                for (var i in _src) {
                    modules.push(lSync(_src[i]));
                }
                return modules;
            } else {
                return lSync(_src[0]);
            }

        };

        Object.defineProperty($, "Loader", {
            configurable: false,
            writable: false,
            value: Loader
        });

        /**
         * Alternatives for loading in PHP-style
         */
        Object.defineProperty($, "include", {
            configurable: false,
            writable: false,
            value: $.Loader.load
        });

        Object.defineProperty($, "require", {
            configurable: false,
            writable: false,
            value: $.Loader.load
        });

        Object.defineProperty($, "includeSync", {
            configurable: false,
            writable: false,
            value: $.Loader.loadSync
        });

        Object.defineProperty($, "requireSync", {
            configurable: false,
            writable: false,
            value: $.Loader.loadSync
        });

        Object.defineProperty($, "RSVP", {
            configurable: false,
            writable: false,
            value: RSVP
        });

        Object.defineProperty($, "Promise", {
            configurable: false,
            writable: false,
            value: RSVP.Promise
        });
    }

    /*
     * ==============================
     *
     * Utils
     *
     * ==============================
     */

    function defineUtils($) {
        // property getter that walks in chain
        !function (Object, getPropertyDescriptor, getPropertyNames) {
            if (!(getPropertyDescriptor in Object)) {
                var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
                Object[getPropertyDescriptor] = function getPropertyDescriptor(o, name) {
                    var proto = o, descriptor;
                    while (proto && !(
                        descriptor = getOwnPropertyDescriptor(proto, name))
                    )
                        proto = proto.__proto__;
                    return descriptor;
                };
            }
            if (!(getPropertyNames in Object)) {
                var getOwnPropertyNames = Object.getOwnPropertyNames, ObjectProto = Object.prototype, keys = Object.keys;
                Object[getPropertyNames] = function getPropertyNames(o) {
                    var proto = o, unique = {}, names, i;
                    while (proto != ObjectProto) {
                        for (names = getOwnPropertyNames(proto), i = 0; i < names.length; i++) {
                            unique[names[i]] = true;
                        }
                        proto = proto.__proto__;
                    }
                    return keys(unique);
                };
            }
        }(Object, "getPropertyDescriptor", "getPropertyNames");

        $.typeOf = function (obj) {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        };

        /**
         *
         * @param {type} type
         * @param {type} val
         * @param {type} skipError, if set to true then return a boolean instead throw an error
         * @returns {undefined}
         */
        $.typeCompare = function (type, val, skipError) {
            if (val === null || val === undefined)
                return true;

            if (typeof type === "string") {
                var t = $.typeOf(val);
                if (t !== type) {
                    if (skipError)
                        return false;
                    // else
                    throw new TypeError("Incompatible type: " + t + " , excepted " + type);
                }
            } else {
                if (!(val.constructor === type)) {
                    if (skipError)
                        return false;
                    // else
                    throw new TypeError("Incompatible type: " + typeof val + " , excepted " + type.name);
                }
            }

            return true;
        };

        $.typeFn = function (/* arguments type, function */) {

        };
    }

    /*
     * ==============================
     *
     * HwcBootstrap
     * @type Obj
     *
     * ==============================
     */

    var HwcBootstrap = (function () {
        var Obj = function _Bootstrap() {
        };

        var pub = Obj.prototype;
        var pub_static = Obj;

        var setGlobals = function (global, skipExtra) {
            //      global namespaced

            global.hwc = hwc;
            global.hwc.defTests = global.hwc.define; // special use for tests
            hwc.__global = global;

            if (!skipExtra) {
                //      in environments without module system
                try {
                    global.module = {};
                    global.exports = global.module.exports = global.hwc.exports;
                } catch (e) {
                    // nothing to do
                }
            }
        };

        pub.initBrowser = function () {
            setGlobals(window);

            if (hwc.isRequireJs()) {
                // nothing to do for now
            } else if (hwc.isWebPack()) {
                var req = require;
                var def = define;
                require("script-loader!hwc_js_modules_requirejs");
                /*window.hwc.define=window.define;
                window.hwc.require=window.require;
                require=req;
                define=def;*/
            } else {
                _loadSync(hwc_conf.paths.hwc_js_modules_requirejs + '.js');
            }

            hwc.__requirejs = requirejs;

            hwc.__requirejs.config({
                paths: hwc_conf.paths
            });
        };

        pub.initNode = function () {
            hwc.__requirejs = global.requirejs;

            setGlobals(global, true);
        }

        pub.init = function (callback) {
            this.defines = {};
            this.defines.IN_BROWSER = hwc.isInBrowser();

            this.defines.PATH_CORE = hwc.conf.path_core || "../";
            this.defines.PATH_ROOT = this.defines.PATH_CORE + "../";
            this.defines.PATH_JS_KERNEL = this.defines.PATH_CORE + "js-kernel/index.js";
            this.defines.PATH_JS_LIB = this.defines.PATH_CORE + "js-lib-";

            hwc.Core = HWCore;

            if (this.defines.IN_BROWSER) {
                this.initBrowser();
            } else {
                this.initNode();
            }

            HWCore.const = hwc.const = this.defines;

            hwc.__core = hwc.Core.I(callback);

            console.log("ok");

            defineUtils(hwc);
        };

        return Obj;
    })();

    function _loadSync(url) {
        // get some kind of XMLHttpRequest
        var xhrObj = createXMLHTTPObject();
        // open and send a synchronous request
        xhrObj.open('GET', url, false);
        xhrObj.send('');
        // add the returned content to a newly created script tag
        var se = document.createElement('script');
        se.type = "text/javascript";
        se.text = xhrObj.responseText;
        var position = document.currentScript && document.currentScript.parentNode ? document.currentScript.parentNode : document.head;
        position.appendChild(se);
    }

    /*
     * ==============================
     *
     *  hwc global static object
     *
     * ==============================
     */

    var hwc = {
        conf: hwc_conf,
        __defineLoader: defineLoader,
        __pendingFunc: [],
        defineFn: function () {
            if (!this.__core || !this.__core.Loader) {
                this.__pendingFunc.push(arguments);
            } else {
                switch (arguments.length) {
                    case 1:
                        return arguments[0].call(this.__core);
                        break;
                    case 2:
                        var inc = arguments[0];
                        var def = arguments[1];
                        var that = this;
                        return this.__core.Loader.load(inc, function () {
                            def.apply(that.__core, arguments);
                        });
                        break;
                    default:
                        throw new SyntaxError("Invalid number of parameters");
                }
            }
        },
        /**
         *
         * @param {type} id -> leave blank to retreive main instance
         * @returns {unresolved}
         */
        I: function (id) {
            return this.Core.I(id);
        },
        getCoreClass: function () {
            return this.__core;
        },
        isInBrowser: function () {
            return typeof window !== "undefined";
        },
        isWebPack: function () {
            return typeof __webpack_require__ === "function";
        },
        isRequireJs: function () {
            return typeof requirejs === 'function';
        },
        getGlobalObj: function () {
            return this.__global;
        },
        /*
         * Internal used
         */
        // will be defined next
        __core: null,
        __global: null,
        __requirejs: null
    };


    /**
     * INIT
     *
     */

    var newInst = new HwcBootstrap().init();

    if (hwc.isInBrowser())
        module.exports = hwc.I();

})();

define(["hwc_js_modules_rsvp"], function (RSVP) {
    hwc.__core.loading = false;
    hwc.__defineLoader(hwc, RSVP);

    return hwc;
});
