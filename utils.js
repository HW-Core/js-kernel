/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

'use strict';

hw2.define(function () {
    var $=this;
    
    $.typeOf = function (obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
    
    
    $.typeCompare = function (type, val) {
        if (typeof type === "string") {
            var t = $.typeOf(val);
            if (t !== type) {
                throw new TypeError("Incompatible return type: " + t + " , excepted " + type);
            }
        } else {
            if (!(val.constructor === type)) {
                throw new TypeError("Incompatible return type: " + typeof val + " , excepted " + type.name);
            }
        }
    };
});