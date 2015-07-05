'use strict';

/*
 * VERY FIRST DEFINES AND LEGACY
 * TODO: old code, re-organizing or remove
 */

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

var HwcBootstrap = (function () {
    var Obj = function _Bootstrap () {
    };

    var pub = Obj.prototype;
    var pub_static = Obj;

    // private static
    var defCore = "../../../../";
    var defRoot = defRoot + "../";
    /**
     * 
     * Data attributes
     */
    var abAttr = "data-hwc-after-boot"; // after boot attribute name
    var rootPathAttr = "data-hwc-path-root";
    var corePathAttr = "data-hwc-path-core";
    // attribute to auto-initialize hwcore 
    var autoAttr = "data-hwc-auto-init";
    // using this attribute instead you must call hwc.init function manually
    var manualAttr = "data-hwc-manual-init";

    var __include = function () {
        var that = this;
        var includes = arguments;
        Array.isArray(arguments[0]) && (includes = arguments[0]);

        var obj = function (module) {
            return obj.define(module);
        };

        obj.define = function (module) {
            return that.define(includes, module);
        };

        obj.defineFn = function (module) {
            return that.defineFn(includes, module);
        };

        return obj;
    };

    var hwc = {
        // magic define
        set exports (module) {
            this.define([], module);
        },
        Module: function (def, args) {
            this.module = def;
            this.args = args;
        },
        __pendingDefines: [],
        __pendingFunc: [],
        include: __include,
        require: __include, // just an alias of include for now
        /**
         * requirejs alias
         */
        define: function () {
            /**
             * if you have to target also browser that doesn't support 
             * document.currentScript, please use the after-boot option or defineFn
             * and include libraries using hwc.include
             */
            if (this.isInBrowser() && document.currentScript) {
                if (!document.currentScript.src) {
                    // this is the case of modules defined inside a <script> tag
                    // without using a file
                    this.defineFn.apply(this, arguments);

                    return;
                } else if (!this.__rdefine) {
                    // if hwc has not been initialized yet, we must defer the module loading
                    this.__pendingDefines.push(document.currentScript.src);
                    return;
                }
            }

            var args;
            switch (arguments.length) {
                case 1:
                    var def = arguments[0];

                    var hwcModule = function () {
                        return new hwc.Module(def, arguments);
                    };
                    hwcModule.__isHwcModule = true;

                    args = [hwcModule];
                    break;
                case 2:
                    var def = arguments[1];

                    var hwcModule = function () {
                        return new hwc.Module(def, arguments);
                    };
                    hwcModule.__isHwcModule = true;

                    args = [arguments[0], hwcModule];
                    break;
                default:
                    throw new SyntaxError("Invalid number of parameters");
            }

            this.__rdefine.apply(null, args);
        },
        getPendingDefines: function () {
            return this.__pendingDefines;
        },
        getPendingFunc: function () {
            return this.__pendingFunc;
        },
        defineFn: function () {
            if (!this.__core || !this.__core.Loader) {
                this.__pendingFunc.push(arguments);
            } else {
                switch (arguments.length) {
                    case 1:
                        arguments[0].call(this.__core);
                        break;
                    case 2:
                        var inc = arguments[0];
                        var def = arguments[1];
                        var that = this;
                        this.__core.Loader.load(inc)
                            .then(function () {
                                def.apply(that.__core, arguments);
                            });
                        break;
                    default:
                        throw new SyntaxError("Invalid number of parameters");
                }
            }
        },
        I: function () {
            return this.__core.I();
        },
        getCoreClass: function () {
            return this.__core;
        },
        isInBrowser: function () {
            return typeof window !== "undefined";
        },
        /**
         * will be override on node and when manually init
         */
        init: function () {
            console.error("Cannot init! Is Core automatically initialized?");
        },
        /*
         * Internal used
         */
        // will be defined next
        __rdefine: null,
        __core: null
    };

    var setGlobals = function (global, skipExtra) {
//      global namespaced

        global.hwc = hwc;
        global.hwc.defTests = global.hwc.define; // special use for tests

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

    pub.setPaths = function (root, core) {
        this.defines.PATH_ROOT = root;
        this.defines.PATH_CORE = core || root + "hwcore/";
        this.defines.PATH_JS_SRC = this.defines.PATH_CORE + "modules/js/src/";
        this.defines.PATH_JS_KERNEL = this.defines.PATH_JS_SRC + "kernel/";
        this.defines.PATH_JS_LIB = this.defines.PATH_JS_SRC + "library/";
    };

    pub.initBrowser = function () {
        /**
         * Used to resolve kernel url automatically if possible
         * on browser
         */
        function resolveKernelUrl (currScript) {
            return currScript && currScript.src || function () {
                // the latest and worst chance to retreive it

                var matcher = function (stack, matchedLoc) {
                    return loc = matchedLoc;
                };

                try {

                    // Invalid code
                    0();

                } catch (ex) {

                    if (fileName in ex) { // Firefox
                        loc = ex[fileName];
                    } else if (stackTrace in ex) { // Opera
                        ex[stackTrace].replace(/called from line \d+, column \d+ in (.*):/gm, matcher);
                    } else if (stack in ex) { // WebKit, Blink and IE10
                        ex[stack].replace(/at.*?\(?(\S+):\d+:\d+\)?$/g, matcher);
                    }

                    return loc;
                }
            }();
        }

        var that = this;

        var currScript = this.getCurrentScriptTag() || {};

        var corePath = currScript[corePathAttr] ||
            window["HWCPATH_CORE"] ||
            function () {
                var prefix = currScript.src ? that.dirName(currScript.src) + "/" : "";
                return prefix + defCore;
            }();

        corePath = this.qualifyURL(corePath);
        corePath.slice(-1) != "/" && (corePath += "/"); // set last char

        var rootPath = currScript[rootPathAttr] ||
            window["HWCPATH_ROOT"] ||
            (currScript.src ? that.dirName(currScript.src) + "/" + defRoot : corePath + "../");

        rootPath = this.qualifyURL(rootPath);

        this.setPaths(rootPath, corePath);

        // afterScript can be defined by script custom data attribute ( priority and suggested )
        // or using global const , otherwise the init process must be done manually later
        // via hwc.init(myAfterScript);
        var afterScript = (currScript["getAttribute"] && currScript.getAttribute(abAttr))
            || window["HWC_AFTERBOOT"] || false;

        setGlobals(window);

        function loadKernel (defines, afterScript) {
            var req = requirejs.config({
            });

            req([defines.PATH_JS_KERNEL + "Core.js"], function (HWCore) {
                HWCore.const = window.hwc.const = that.defines;
                HWCore.I(function () {
                    var $ = this;
                    // this allows to load all modules defined before hw-core initialization
                    $.Loader.load($.global.hwc.getPendingDefines()).then(function () {
                        try {
                            if (afterScript) {
                                if (typeof afterScript === "function") {
                                    return afterScript.call($);
                                } else if (typeof window[afterScript] === "function") {
                                    return window[afterScript].call($);
                                } else {
                                    return $.Loader.load(afterScript);
                                }
                            }
                        } catch (e) {
                            console.log(e.stack);
                        }
                    });
                });
            });
        }

        /**
         * 
         * @param {function|string} afterScript : can be a path, a function name or a function
         */
        var init = function (afterScript) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            if (script.readyState) {  //IE
                script.onreadystatechange = function () {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        loadKernel(that.defines, afterScript);
                    }
                };
            } else {  //Others
                script.onload = function () {
                    loadKernel(that.defines, afterScript);
                };
            }

            script.src = that.defines.PATH_CORE + 'modules/js/modules/requirejs/requirejs/index.js';
            document.currentScript.parentNode.appendChild(script);
        };

        // by default hwcore always init automatically
        // except if manual-attribute is used
        if (!currScript[manualAttr]) {
            init(afterScript);
        } else {
            /**
             * 
             * @param {function|string} afterScript : can be a path, a function name or a function
             * @returns window.hwc
             */
            window.hwc.init = function (afterScript) {
                init(afterScript);
                return window.hwc;
            };
        }
    };

    pub.initNode = function () {
        var path = require("path");
        var rootPath = path.join(__dirname, defRoot);
        var corePath = path.join(__dirname, defCore);
        // convert from relative to absolute
        rootPath = path.resolve(rootPath) + "/";
        corePath = path.resolve(corePath) + "/";

        this.setPaths(rootPath, corePath);

        var requirejs = require(this.defines.PATH_CORE + 'modules/js/modules/requirejs/r/index.js').config({
            //Pass the top-level main.js/index.js require
            //function to requirejs so that node modules
            //are loaded relative to the top-level JS file.
            nodeRequire: require
        });

        setGlobals(global, true);

        var HWCore = requirejs(this.defines.PATH_JS_KERNEL + "Core.js");
        HWCore.const = global.hwc.const = this.defines;
        // export global hwc namespace
        // you can use .I() to instantiate then
        global.hwc.init = function (callback) {
            HWCore.I(callback);
            return global.hwc;
        };
        return global.hwc;
    };

    pub.init = function () {
        this.defines = {};
        this.defines.IN_BROWSER = hwc.isInBrowser();

        if (this.defines.IN_BROWSER) {
            this.initBrowser();
        } else {
            module.exports = this.initNode();
        }
    };


    /*
     * Bootstrap utils
     * Can be reused in other libs
     */


    pub.dirName = function (path) {
        return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
    };


    pub.escapeHTML = function (s) {
        return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
    };

    pub.qualifyURL = function (url) {
        var el = document.createElement('div');
        el.innerHTML = '<a href="' + this.escapeHTML(url) + '">#</a>';
        return el.firstChild.href;
    };


    pub.getCurrentScriptTag = function () {
        return document.currentScript || // the fatest way if running on modern and compatible browser
            function () {
                // most browsers , but you need to specify hwc-after-boot in script tag
                return document.querySelector('script[' + abAttr + ']');
            }() ||
            (function () {
                // if you need to avoid afterBoot to manually run it and keep compatibility with oldest browser
                // you can add an id attribute  to your tag
                return document.querySelector('script[' + autoAttr + ']') || document.querySelector('script[' + manualAttr + ']');
            }()) ||
            (function () {
                // alternative if not custom data attributes specified, but not always secure/works
                return document.querySelector('script[src*="hwcore/modules/js/src/kernel/index.js"]');
            }()) ||
            null;
    };

    return Obj;

})();

/**
 * INIT
 * 
 */

new HwcBootstrap().init();
