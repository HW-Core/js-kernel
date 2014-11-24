/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define(function () {
    $ = Hw2Core;
    return $.Object = $.Class({members: [
            {
                attributes: "static",
                name: "clone",
                val: function (obj) {
                    return JSON.parse(JSON.stringify(obj));
                }
            }
        ]
    });
});



