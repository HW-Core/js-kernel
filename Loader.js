/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

'use strict';

hw2.define([
    'hw2!PATH_CORE:modules/dep/q/index.js'
], function (Q) {
    var $ = this;

    $.Q = Q;

    $.Loader = function () {
    };

    // private static
    function prepare (src, options) {
        src = Array.isArray(src) ? src : [src];

        if (!options.skipPlg) {
            for (var i in src) {
                if (src[i].indexOf("hw2!") !== 0)
                    src[i] = "hw2!" + src[i];
            }
        }

        return src;
    }

    var pub = $.Loader.prototype;
    var pub_static = $.Loader;

    pub_static.paths = {};

    /**
     * 
     * @param {String} src -> path of resource to load, you can use following format for path:
     * 1: CONSTANT:path ( where CONSTANT is retrieved from Hw2Core context )
     * 2: full path
     * @param {Function} callback -> function to cast as callback, if omitted 
     * a promise will be returned
     * @param {Object} options :
     *  {Boolean} skipPlg -> skip hw2 plugin
     * @returns {Mixed}
     */
    pub_static.load = function (src, callback, options) {
        options = options || {};
        src = prepare(src, options);


        var deferred = $.Q.defer();

        $.requirejs(src, function () {
            if (typeof callback === "function") {
                callback.apply($, arguments);
            }

            deferred.resolve.apply($, arguments);
        });

        return deferred.promise;
    };

    /**
     * 
     * @param {String} src -> path of resource to load
     * @param {Object} options :
     *  {Boolean} skipPlg -> skip hw2 plugin
     *  {Boolean} rawScript -> put js code in script tag and 
     *  skip hw2 plugin ( only for browser environment )
     * @returns {Mixed}
     */
    pub_static.loadSync = function (src, options) {
        options = options || {};
        options.rawScript && (options.skipPlg = true);
        src = prepare(src, options);

        var lSync = function (src) {
            if ($.const.IN_BROWSER) {
                if (options.rawScript) {
                    var xhrObj = new XMLHttpRequest();
                    // open and send a synchronous request
                    xhrObj.open('GET', src, false);
                    xhrObj.send('');
                    var se = document.createElement('script');
                    se.type = "text/javascript";
                    se.text = xhrObj.responseText;
                    document.getElementsByTagName('head')[0].appendChild(se);
                    return src; // should return something
                } else {
                    try {
                        return $.requirejs(src);
                    } catch (e) {
                        throw new Error(src + " must be loaded before to reload it async");
                    }
                }
            } else {
                return $.requirejs(src);
            }
        };


        if (src.length > 1) {
            var modules = [];
            for (var i in src) {
                modules.push(lSync(src[i]));
            }
            return modules;
        } else {
            return lSync(src[0]);
        }

    };

    return $.Loader;
});

