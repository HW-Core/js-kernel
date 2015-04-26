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
    
    /**
     * 
     * @param {type} type
     * @param {type} val
     * @param {type} skipError, if set to true then return a boolean instead throw an error
     * @returns {undefined}
     */
    $.typeCompare = function (type, val,skipError) {
        if (typeof type === "string") {
            var t = $.typeOf(val);
            if (t !== type) {
                if (skipError)
                    return false;
                // else
                throw new TypeError("Incompatible type: " + t + " , excepted " + type);
            }
        } else {
            if (!(val.constructor === type)) {
                if (skipError)
                    return false;
                // else
                throw new TypeError("Incompatible type: " + typeof val + " , excepted " + type.name);
            }
        }
        
        return true;
    };
    
    $.typeFn = function (/* arguments type, function */) {
        
    };
});