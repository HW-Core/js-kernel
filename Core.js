/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

'use strict';
/*
 * Core class
 */
define(function () {
    var _Core = function (callback, id) {
        // each instance of core must define its scope
        var scope = {};
        // expose Core to scope
        scope.Core = pub_static;
        scope.const = pub_static.const;
        scope.requirejs = requirejs.config({
            paths: {
                hw2: scope.const.PATH_JS_KERNEL + "requireplg",
                hw2core: scope.const.PATH_JS_KERNEL + "Core"
            },
            context: scope,
            nodeRequire: scope.const.IN_BROWSER ? undefined : require
        });

        // we could use requirejs flag too
        // scope.const.IN_BROWSER=requirejs.isBrowser;

        scope.global = scope.const.IN_BROWSER ? window : global;
        scope.global.hw2.rdefine = define;

        scope.requirejs([
            "hw2", // special path defined above
            // we use it also to pass the context for plugin
            "hw2!" + scope.const.PATH_JS_KERNEL + 'utils.js',
            "hw2!" + scope.const.PATH_JS_KERNEL + "Loader.js",
        ], function (reqPlg,utils, Loader) {
            callback.apply(scope);
        });

        // a new instance must return 
        // the created scope, not Core class itself
        return scope;
    };

    var pub = _Core.prototype;
    var pub_static = _Core;

    // private static
    var _instance = [];

    pub_static.const = {};
    pub_static.I = function (id, callback) {
        callback = typeof id === "function" && typeof callback === "undefined" ? id : callback;
        id = typeof id !== "string" ? 0 : id;

        if (typeof _instance[id] === "undefined") {
            _instance[id] = {
                loading: true,
                inst: new _Core(function () {
                    _instance[id].loading = false;
                    if (typeof callback === "function")
                        callback.apply(this, arguments)
                }, id)};
        } else {
            var wait = function () {
                // if new instance has been commited but not loaded
                // fully, we must wait before cast the callback
                if (_instance[id].loading) {
                    setTimeout(wait, 0); // maybe not the best way?
                } else {
                    if (typeof callback === "function") {
                        callback.apply(_instance[id].inst);
                    }
                }
            };

            wait();
        }

        return _instance[id];
    };

    pub_static.delInstance = function (id) {
        _instance.splice(id, 1);
    };

    return pub_static;
});