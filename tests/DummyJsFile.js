/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

hwc.define(function () {
    return (function () {
        var cObj = function _DummyFile () {
        };

        var public = cObj.prototype;
        var public_static = cObj;
        
        public_static.hello=function() {
            return "hello";
        };

        return cObj;

    })();
});
