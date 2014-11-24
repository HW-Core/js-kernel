/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define(function () {
    var $ = Hw2Core;
    return Hw2Core.Path = $.Class({members: [
            {
                attributes: "static",
                name: "basename",
                val: function (path) {
                    return path.replace(/\\/g, '/').replace(/.*\//, '');
                }
            },
            {
                attributes: "static",
                name: "dirname",
                val: function (path) {
                    return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
                }
            },
            {
                attributes: "static",
                name: "extension",
                val: function (path) {
                    return (/(?:\.([^.]+))?$/).exec(path)[1];
                }
            }
        ]}
    );
});