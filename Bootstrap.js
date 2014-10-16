/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

var Hw2 = Hw2 || {}; // namespace

var HW2PATH_SHARE = HW2PATH_ROOT + "share/";
var HW2PATH_LOCAL = HW2PATH_ROOT + "local/";
var HW2PATH_JS_LIB = HW2PATH_SHARE + "modules/hw2/modules/js/src/Library/";

document.write("<script src='" + HW2PATH_SHARE + "modules/jquery/jquery/dist/jquery.js'><\/script>");

window.onload = function() {
    // create custom alias for jquery to avoid conflicts
    Hw2.JQ = jQuery.noConflict(true);

    Hw2.JQ.ajaxSetup({async: false});
    Hw2.JQ.getScript(HW2PATH_JS_LIB + "Application.js");
    Hw2.JQ.ajaxSetup({async: true});

    var App = Hw2.Application;

    App.loadResource(HW2PATH_JS_LIB + "JsMethods.js", "js");
    App.loadResource(HW2PATH_JS_LIB + "Namespacer.js", "js");
    //run local bootstrap
    App.loadResource(HW2PATH_LOCAL + "init/Bootstrap.js", "js", true);
};

//# sourceURL=share/bootstrap.js