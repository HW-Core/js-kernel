/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define(function () {
    var $ = Hw2Core;
    return $.Array = $.Class({members: [
            {
                /**
                 * Destroy all elements of array
                 */
                attributes: "public static",
                name: "clean",
                val: function(arr) {
                    var what, a = arr, L = a.length, ax;
                    while (L && arr.length) {
                        what = a[--L];
                        while ((ax = arr.indexOf(what)) !== -1) {
                            arr.splice(ax, 1);
                        }
                    }
                    return arr;
                }
            }
        ]}
    );
});