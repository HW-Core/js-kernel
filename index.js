/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

HW2_INBROWSER = typeof window !== "undefined";

// you should define HW2PATH_ROOT in your index.html
HW2PATH_ROOT = typeof HW2PATH_ROOT !== "undefined" ? HW2PATH_ROOT : "../../../../../";

// convert from relative to absolute
if (HW2_INBROWSER) {
    function escapeHTML(s) {
        return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
    }
    function qualifyURL(url) {
        var el= document.createElement('div');
        el.innerHTML= '<a href="'+escapeHTML(url)+'">x</a>';
        return el.firstChild.href;
    }
    
    HW2PATH_ROOT=qualifyURL(HW2PATH_ROOT);
} else {
    var path=require("path");
    HW2PATH_ROOT=path.resolve(HW2PATH_ROOT)+"/";
}

HW2PATH_CORE = HW2PATH_ROOT + "hw2/";
HW2PATH_JS_SRC = HW2PATH_CORE + "modules/js/src/";
HW2PATH_JS_KERNEL = HW2PATH_JS_SRC + "kernel/";
HW2PATH_JS_LIB = HW2PATH_JS_SRC + "library/";

if (HW2_INBROWSER) {
    var requirejs;

    function loadKernel () {
        requirejs = require;
        requirejs([HW2PATH_JS_KERNEL + "Bootstrap.js"], function (Bootstrap) {
            requirejs([afterScript]);
        });
    }

    var afterScript = document.currentScript.getAttribute("data-after-boot");
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
    requirejs = require(HW2PATH_CORE + 'modules/dep/requirejs/r/index.js');

    requirejs.config({
        //Pass the top-level main.js/index.js require
        //function to requirejs so that node modules
        //are loaded relative to the top-level JS file.
        nodeRequire: require
    });

    global.requirejs=requirejs;
    global.define=requirejs.define;

    module.exports=requirejs(HW2PATH_JS_KERNEL + "Bootstrap.js");
}