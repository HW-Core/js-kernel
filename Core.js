/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

define(function () {
    /*
     * Core class
     */
    return Hw2Core = (function () {
        var cObj = function _Core (callback) {
            requirejs([HW2PATH_JS_KERNEL + 'Loader.js'], function () {
                _runCallback(callback);
            });
        };

        var public = cObj.prototype;
        var public_static = cObj;

        // private static
        var _instance = [];
        var _runCallback = function (cb) {
            if (typeof cb === "function")
                cb();
        };

        public_static.I = function (id, callback) {
            callback = typeof id === "function" && typeof callback === "undefined" ? id : callback;
            id = typeof id !== "string" ? 0 : id;

            if (typeof _instance[id] === "undefined") {
                _instance[id] = new cObj(callback);
            } else {
                _runCallback(callback);
            }

            return _instance[id];
        };

        public_static.delInstance = function (id) {
            _instance.splice(id, 1);
        };

        return cObj;

    })();
});
