/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

'use strict';

hw2.exports = function () {
    var $ = this;

    $.Loader = function () {
    };

    var pub = $.Loader.prototype;
    var pub_static = $.Loader;

    pub_static.paths = {};

    /**
     * 
     * @param {String} src -> path of resource to load
     * @param {Function} callback -> function to cast as callback
     * @param {Object} options :
     *  {Boolean} sync ->  load in async/sync mode
     *  {Boolean} skipPlg -> skip hw2 plugin
     * @returns {Mixed}
     */
    pub_static.load = function (src, callback, options) {
        options = options || {sync: false};
        options.sync = options.sync !== undefined ? options.sync : false;

        src = Array.isArray(src) ? src : [src];

        if (!options.skipPlg) {
            for (var i in src) {
                src[i] = "hw2!" + src[i];
            }
        }

        if (!options.sync) {
            if (callback !== undefined)
                callback = callback.bind($);

            $.requirejs(src, callback);
        } else {
            var loadSync = function (src) {
                if ($.const.IN_BROWSER) {
                    var xhrObj = createXMLHTTPObject();
                    // open and send a synchronous request
                    xhrObj.open('GET', src, false);
                    xhrObj.send('');
                    // add the returned content to a newly created script tag
                    var se = document.createElement('script');
                    se.type = "text/javascript";
                    se.text = xhrObj.responseText;
                    document.getElementsByTagName('head')[0].appendChild(se);
                    return requirejs(src);
                } else {
                    return require(src);
                }
            };


            var modules = [];
            for (var i in src) {
                modules.push(loadSync(src[i]));
            }

            callback.apply($, modules);
        }

    };

    return $.Loader;
};

