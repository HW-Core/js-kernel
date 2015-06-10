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
    Function.prototype.bind = function (scope) {
        var _function = this;

        return function () {
            return _function.apply(scope, arguments);
        };
    };
}

var Bootstrap = (function () {
    var Obj = function _Bootstrap () {
    };

    var pub = Obj.prototype;
    var pub_static = Obj;

    var defRoot = "../../../../../";   // private static
    /**
     * 
     * Data attributes
     */
    var abAttr = "data-hwc-after-boot"; // after boot attribute name
    var rootPathAttr = "data-hwc-path-root";
    var autoAttr = "data-hwc-auto-init";
    var manualAttr = "data-hwc-manual-init";

    var setGlobals = function (global, skipExtra) {
//      global namespaced

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

            return obj;
        };

        global.hwc = {
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
                // if hwc has not been initialized yet, we must defer the module loading
                var scripts = document.getElementsByTagName('script');
                var lastScript = scripts[scripts.length - 1];

                if (!lastScript.src) {
                    // this is the case of modules defined inside a <script> tag
                    // without using a file
                    this.defineFn.apply(this, arguments);

                    return;
                } else if (!this.__rdefine) {
                    this.__pendingDefines.push(lastScript.src);
                    return;
                }

                var args;
                switch (arguments.length) {
                    case 1:
                        var def = arguments[0];

                        var hwcModule = function () {
                            return new hwc.Module(def, arguments);
                        };
                        hwcModule.__isHw2Module = true;

                        args = [hwcModule];
                        break;
                    case 2:
                        var def = arguments[1];

                        var hwcModule = function () {
                            return new hwc.Module(def, arguments);
                        };
                        hwcModule.__isHw2Module = true;

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
                if (!this.__rdefine) {
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
                                    def.call(that.__core);
                                });
                            break;
                        default:
                            throw new SyntaxError("Invalid number of parameters");
                    }
                }
            },
            init: null,
            /*
             * Internal used
             */
            // will be defined next
            __rdefine: null,
            __core: null
        };

        hwc.defTests = hwc.define; // special use for tests

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


    pub.setPaths = function (root) {
        this.defines.PATH_ROOT = root;
        this.defines.PATH_CORE = root + "hwcore/";
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

        var rootPath = currScript[rootPathAttr] ||
            window["HW2PATH_ROOT"] ||
            function () {
                var prefix = currScript.src ? that.dirName(currScript.src) + "/" : null;
                return prefix + defRoot;
            }();

        rootPath = this.qualifyURL(rootPath);

        this.setPaths(rootPath);

        // afterScript can be defined by script custom data attribute ( priority and suggested )
        // or using global const , otherwise the init process must be done manually later
        // via hwc.init(myAfterScript);
        var afterScript = (currScript["getAttribute"] && currScript.getAttribute(abAttr))
            || window["HW2_AFTERBOOT"] || false;

        setGlobals(window);

        function loadKernel (defines, afterScript) {
            var req = requirejs.config({
            });

            req([defines.PATH_JS_KERNEL + "Core.js"], function (HWCore) {
                HWCore.const = that.defines;
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
                    }).then(function () {
                        // run pending functions
                        var defs = $.global.hwc.getPendingFunc();
                        defs.forEach(function (args) {
                            $.global.hwc.defineFn.apply($.global.hwc, args);
                        });
                    });
                });
            });
        }

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
            window.hwc.init = init;
        }
    };

    pub.initNode = function () {
        var path = require("path");
        var rootPath = path.join(__dirname, defRoot);
        // convert from relative to absolute
        rootPath = path.resolve(rootPath) + "/";

        this.setPaths(rootPath);

        var requirejs = require(this.defines.PATH_CORE + 'modules/js/modules/requirejs/r/index.js').config({
            //Pass the top-level main.js/index.js require
            //function to requirejs so that node modules
            //are loaded relative to the top-level JS file.
            nodeRequire: require
        });

        setGlobals(global, true);

        var HWCore = requirejs(this.defines.PATH_JS_KERNEL + "Core.js");
        HWCore.const = this.defines;
        return HWCore.I; // export default instance of hw-core
    };

    pub.init = function () {
        this.defines = {};
        this.defines.IN_BROWSER = typeof window !== "undefined";

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

var boot = new Bootstrap();

boot.init();
