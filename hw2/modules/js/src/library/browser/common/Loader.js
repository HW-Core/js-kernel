/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define([
    HW2PATH_JS_LIB + "browser/common/Browser.js",
    HW2PATH_JS_KERNEL + "Loader.js"
], function () {
    var $ = Hw2Core;
    return $.Browser.Loader = $.Class("", {base: Hw2Core.Loader}, [
        {
            "name": "load",
            "val": function (filename, callback, filetype, sync) {
                if (!filetype) {
                    filetype = Hw2Core.Path.extension(filename)[1];
                }

                if (filetype === "css") {
                    try {
                        var el = document.createElement('link');
                        el.rel = 'stylesheet';
                        el.href = filename;
                        el.id = Hw2Core.String.hashCode(filename);
                        el.type = "text/css";
                        return $.Browser.JQ("head").append(el);
                    } catch (error) {
                        return false;
                    }
                } else if (filetype === "js") {
                    this._super(filename, callback, sync);
                }

                return true;
            }
        }
    ]);
});

