/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

define(function () {
    //bootstrap class
    Bootstrap = (function () {
        var public = _Bootstrap.prototype;
        var public_static = _Bootstrap;

        function _Bootstrap () {

        }

        /*
        public_static.run = function (callback) {
            require([HW2PATH_JS_LIB + '/common/Application.js'], function () {
                callback();
            });
        };*/

        return _Bootstrap;

    })();

    return Bootstrap;
});
