'use strict';

hwc.define(function () {
    var $ = this;

    // property getter that walks in chain
    !function (Object, getPropertyDescriptor, getPropertyNames) {
        if (!(getPropertyDescriptor in Object)) {
            var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
            Object[getPropertyDescriptor] = function getPropertyDescriptor (o, name) {
                var proto = o, descriptor;
                while (proto && !(
                    descriptor = getOwnPropertyDescriptor(proto, name))
                    )
                    proto = proto.__proto__;
                return descriptor;
            };
        }
        if (!(getPropertyNames in Object)) {
            var getOwnPropertyNames = Object.getOwnPropertyNames, ObjectProto = Object.prototype, keys = Object.keys;
            Object[getPropertyNames] = function getPropertyNames (o) {
                var proto = o, unique = {}, names, i;
                while (proto != ObjectProto) {
                    for (names = getOwnPropertyNames(proto), i = 0; i < names.length; i++) {
                        unique[names[i]] = true;
                    }
                    proto = proto.__proto__;
                }
                return keys(unique);
            };
        }
    }(Object, "getPropertyDescriptor", "getPropertyNames");

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
    $.typeCompare = function (type, val, skipError) {
        if (val === null || val === undefined)
            return true;

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