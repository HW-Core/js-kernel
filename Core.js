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
                hwc: scope.const.PATH_JS_KERNEL + "requireplg",
                hcore: scope.const.PATH_JS_KERNEL + "Core"
            },
            context: scope,
            nodeRequire: scope.const.IN_BROWSER ? undefined : require
        });

        // we could use requirejs flag too
        // scope.const.IN_BROWSER=requirejs.isBrowser;

        scope.global = scope.const.IN_BROWSER ? window : global;
        scope.global.hwc.__core = scope;
        scope.global.hwc.__rdefine = define;

        scope.requirejs([
            "hwc", // special path defined above
            // we use it also to pass the context for plugin
            "hwc!" + scope.const.PATH_JS_KERNEL + 'utils.js',
            "hwc!" + scope.const.PATH_JS_KERNEL + "Loader.js"
        ], function (reqPlg, utils, Loader) {
            var $ = scope;

            /**
             * Alternatives for loading in PHP-style
             */
            Object.defineProperty($, "include", {
                configurable: false,
                writable: false,
                value: $.Loader.load
            });

            Object.defineProperty($, "require", {
                configurable: false,
                writable: false,
                value: $.Loader.load
            });

            Object.defineProperty($, "includeSync", {
                configurable: false,
                writable: false,
                value: $.Loader.loadSync
            });

            Object.defineProperty($, "requireSync", {
                configurable: false,
                writable: false,
                value: $.Loader.loadSync
            });

            // run pending
            var defs = scope.global.hwc.getPendingFunc();
            defs.forEach(function (args) {
                scope.global.hwc.defineFn.apply(scope.global.hwc, args);
            });

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