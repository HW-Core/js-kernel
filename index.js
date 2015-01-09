/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

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
    var abAttr = "data-hw2-after-boot"; // after boot attribute name
    var idAttr = "data-hw2-core-id";

    var setGlobals = function (global, skipExtra) {
//      global namespaced
        global.hw2 = {
            // magic define
            set exports (module) {
                this.define([], module);
            },
            Module: function (def, args) {
                this.module = def;
                this.args = args;
            },
            /**
             * requirejs alias
             */
            define: function () {
                var args;
                switch (arguments.length) {
                    case 1:
                        var def = arguments[0];

                        var hw2Module = function () {
                            return new hw2.Module(def, arguments);
                        }
                        hw2Module.__isHw2Module = true;

                        args = [hw2Module];
                        break;
                    case 2:
                        var def = arguments[1];

                        var hw2Module = function () {
                            return new hw2.Module(def, arguments);
                        }
                        hw2Module.__isHw2Module = true;

                        args = [arguments[0], hw2Module];
                        break;
                    default:
                        throw new SyntaxError("Invalid number of parameters");
                }

                this.rdefine.apply(null, args);
            },
            // will be defined next
            rdefine: null,
            init: null
        };
        
        hw2.defTests=hw2.define; // special use for tests

        if (!skipExtra) {
//      in environments without module system
            try {
                global.module = {};
                global.exports = global.module.exports = global.hw2.exports;
            } catch (e) {
                // nothing to do  
            }
        }
    };


    pub.setPaths = function (root) {
        this.defines.PATH_ROOT = root;
        this.defines.PATH_CORE = root + "hw2/";
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
        ;

        var that = this;

        var currScript = this.getCurrentScriptTag() || {};

        var rootPath = currScript["data-hw2-path-root"] ||
                window["HW2PATH_ROOT"] ||
                function () {
                    var prefix = currScript.src ? that.dirName(currScript.src) + "/" : null;
                    return prefix + defRoot;
                }();

        rootPath = this.qualifyURL(rootPath);

        this.setPaths(rootPath);

        // afterScript can be defined by script custom data attribute ( priority and suggested )
        // or using global const , otherwise the init process must be done manually later
        // via hw2.init(myAfterScript);
        var afterScript = (currScript["getAttribute"] && currScript.getAttribute(abAttr))
                || window["HW2_AFTERBOOT"] || false;

        setGlobals(window);

        function loadKernel (defines, afterScript) {
            var req = requirejs.config({
            });

            req([defines.PATH_JS_KERNEL + "Core.js"], function (Hw2Core) {
                Hw2Core.const = that.defines;

                Hw2Core.I(function () {
                    if (typeof afterScript === "function") {
                        afterScript.call(this);
                    } else if (typeof window[afterScript] === "function") {
                        window[afterScript].call(this);
                    } else {
                        this.Loader.load(afterScript);
                    }
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

            script.src = that.defines.PATH_CORE + 'modules/dep/requirejs/requirejs/index.js';
            document.currentScript.parentNode.appendChild(script);
        };

        if (afterScript) {
            init(afterScript);
        } else {
            window.hw2.init = init;
        }
    };

    pub.initNode = function () {
        var path = require("path");
        var rootPath = path.join(__dirname, defRoot);
        // convert from relative to absolute
        rootPath = path.resolve(rootPath) + "/";

        this.setPaths(rootPath);

        var requirejs = require(this.defines.PATH_CORE + 'modules/dep/requirejs/r/index.js').config({
            //Pass the top-level main.js/index.js require
            //function to requirejs so that node modules
            //are loaded relative to the top-level JS file.
            nodeRequire: require
        });

        setGlobals(global, true);

        var Hw2Core = requirejs(this.defines.PATH_JS_KERNEL + "Core.js");
        Hw2Core.const = this.defines;
        return Hw2Core.I; // export default instance of hw2core
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
                    // most browsers , but you need to specify hw2-after-boot in script tag
                    return document.querySelector('script[' + abAttr + ']');
                }() ||
                (function () {
                    // if you need to avoid afterBoot to manually run it and keep compatibility with oldest browser
                    // you can add an id attribute  to your tag
                    return document.querySelector('script[' + idAttr + ']');
                }()) ||
                (function () {
                    // alternative if not custom data attributes specified, but not always secure/works
                    return document.querySelector('script[src*="hw2/modules/js/src/kernel/index.js"]');
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
