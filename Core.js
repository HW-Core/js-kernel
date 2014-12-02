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
            "hw2",
            // we use it also to pass the context for plugin
            "hw2!" + scope.const.PATH_JS_KERNEL + "Loader.js",
            "hw2!" + scope.const.PATH_JS_KERNEL + 'syntax.js'
        ], function (reqPlg, Loader) {
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
    var _runCallback = function (cb) {
        if (typeof cb === "function")
            cb();
    };

    pub_static.const = {};
    pub_static.I = function (id, callback) {
        callback = typeof id === "function" && typeof callback === "undefined" ? id : callback;
        id = typeof id !== "string" ? 0 : id;

        if (typeof _instance[id] === "undefined") {
            _instance[id] = new _Core(callback, id);
        } else {
            _runCallback(callback);
        }

        return _instance[id];
    };

    pub_static.delInstance = function (id) {
        _instance.splice(id, 1);
    };

    return pub_static;
});