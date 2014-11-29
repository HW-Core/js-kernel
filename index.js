/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */


/*
 * DEFINES AND LEGACY
 */

HW2_INBROWSER = typeof window !== "undefined";

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
    }
}

// simple assertion
if (typeof assert !== 'function') {
    function assert (condition, message) {
        if (!condition)
            throw Error("Assert failed" + (typeof message !== "undefined" ? ": " + message : ""));
    }
    ;
}

// you should define HW2PATH_ROOT in your index.html
HW2PATH_ROOT = typeof HW2PATH_ROOT !== "undefined" ? HW2PATH_ROOT : "../../../../../";

// convert from relative to absolute
if (HW2_INBROWSER) {
    function escapeHTML (s) {
        return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
    }
    function qualifyURL (url) {
        var el = document.createElement('div');
        el.innerHTML = '<a href="' + escapeHTML(url) + '">x</a>';
        return el.firstChild.href;
    }

    HW2PATH_ROOT = qualifyURL(HW2PATH_ROOT);
} else {
    var path = require("path");
    HW2PATH_ROOT = path.resolve(HW2PATH_ROOT) + "/";
}

HW2PATH_CORE = HW2PATH_ROOT + "hw2/";
HW2PATH_JS_SRC = HW2PATH_CORE + "modules/js/src/";
HW2PATH_JS_KERNEL = HW2PATH_JS_SRC + "kernel/";
HW2PATH_JS_LIB = HW2PATH_JS_SRC + "library/";


if (HW2_INBROWSER) {
    var requirejs;

    function loadKernel () {
        requirejs = require.config({
            context: 'Hw2Core'
        });

        requirejs([HW2PATH_JS_KERNEL + "Core.js"], function (Hw2Core) {
            if (typeof window[afterScript] === "function") {
                window[afterScript](Hw2Core);
            } else {
                requirejs([afterScript]);
            }
        });
    }

    var afterScript = document.currentScript.getAttribute("data-after-boot") || HW2_AFTERBOOT;
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {  //IE
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                loadKernel();
            }
        };
    } else {  //Others
        script.onload = function () {
            loadKernel();
        };
    }

    script.src = HW2PATH_CORE + 'modules/dep/requirejs/requirejs/index.js';
    document.currentScript.parentNode.appendChild(script);
} else {
    requirejs = require(HW2PATH_CORE + 'modules/dep/requirejs/r/index.js').config({
        //Pass the top-level main.js/index.js require
        //function to requirejs so that node modules
        //are loaded relative to the top-level JS file.
        context: 'Hw2Core',
        nodeRequire: require
    });

    global.requirejs = requirejs;
    global.define = requirejs.define;

    module.exports = requirejs(HW2PATH_JS_KERNEL + "Core.js");
}
