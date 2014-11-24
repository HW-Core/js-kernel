/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define([
    HW2PATH_JS_LIB + "browser/common/Browser.js",
    HW2PATH_JS_LIB + "common/Path.js"
], function () {
    var $ = Hw2Core;
    return $.Browser.Path = $.Class({base: $.Path, members: [
            {
                attributes: "static",
                name: "fileExists",
                val: function (url) {
                    if (url) {
                        try {
                            var req = new XMLHttpRequest();
                            req.open('GET', url, false);
                            req.send();
                            return req.status === 200;
                        } catch (error) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
        ]}
    );
});