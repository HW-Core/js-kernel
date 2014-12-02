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

Function.prototype.bind = function (scope) {
    var _function = this;

    return function () {
        return _function.apply(scope, arguments);
    };
};

var Bootstrap = (function () {
    var Obj = function _Bootstrap () {
    };

    var pub = Obj.prototype;
    var pub_static = Obj;

    var defRoot = "../../../../../";   // private static 

    var setGlobals = function (global, skipExtra) {
//      global namespaced
        global.hw2 = {
            // magic define
            set exports (module) {
                this.define([], module);
            },
            Module: function (module) {
                this.module = module;
            },
            /**
             * requirejs alias
             */
            define: function () {
                var args;
                switch (arguments.length) {
                    case 1:
                        var def = arguments[0];
                        args = [new hw2.Module(def)];
                        break;
                    case 2:
                        var def = arguments[1];
                        args = [arguments[0], new hw2.Module(def)];
                        break;
                    default:
                        throw new SyntaxError("Invalid number of parameters");
                }

                this.rdefine.apply(null, args);
            },
            rdefine: null
        };

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
        function escapeHTML (s) {
            return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
        }
        function qualifyURL (url) {
            var el = document.createElement('div');
            el.innerHTML = '<a href="' + escapeHTML(url) + '">#</a>';
            return el.firstChild.href;
        }

        var rootPath = document.currentScript.getAttribute("data-hw2-path-root") || window["HW2PATH_ROOT"] || defRoot;
        rootPath = qualifyURL(rootPath);

        this.setPaths(rootPath);
        that = this;

        function loadKernel (defines) {
            setGlobals(window);

            var req = requirejs.config({
            });

            req([defines.PATH_JS_KERNEL + "Core.js"], function (Hw2Core) {
                Hw2Core.const = that.defines;

                Hw2Core.I(function () {
                    if (typeof window[afterScript] === "function") {
                        window[afterScript].call(this);
                    } else {
                        this.Loader.load(afterScript);
                    }
                });
            });
        }

        var afterScript = document.currentScript.getAttribute("data-hw2-after-boot") || window["HW2_AFTERBOOT"];
        var script = document.createElement("script");
        script.type = "text/javascript";
        var that = this;
        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    loadKernel(that.defines);
                }
            };
        } else {  //Others
            script.onload = function () {
                loadKernel(that.defines);
            };
        }

        script.src = this.defines.PATH_CORE + 'modules/dep/requirejs/requirejs/index.js';
        document.currentScript.parentNode.appendChild(script);
    };

    pub.initNode = function (rootPath, callback) {
        var path = require("path");
        rootPath = rootPath || defRoot;
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

        return Hw2Core.I(callback); // export default instance of hw2core
    };

    pub.init = function () {
        this.defines = {};
        this.defines.IN_BROWSER = typeof window !== "undefined";

        if (this.defines.IN_BROWSER) {
            this.initBrowser();
        } else {
            module.exports = this.initNode.bind(this);
        }
    };


    return Obj;

})();

/**
 * INIT
 * 
 */

var boot = new Bootstrap();

boot.init();
