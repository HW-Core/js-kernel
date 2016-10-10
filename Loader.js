'use strict';

hwc.define([
    'hwc!{PATH_CORE}js-modules/rsvp/index.js'
], function (RSVP) {
    var $ = this;

    var Loader = function () {
    };

    // private static
    function prepare (src, options) {
        src = Array.isArray(src) ? src : [src];

        if (!options.skipPlg) {
            for (var i in src) {
                if (src[i].indexOf("hwc!") !== 0)
                    src[i] = "hwc!" + src[i];
            }
        }

        return src;
    }

    var pub = Loader.prototype;
    var pub_static = Loader;

    pub_static.paths = {};

    /**
     * 
     * @param {String} src -> path of resource to load, you can use following format for path:
     * 1: CONSTANT:path ( where CONSTANT is retrieved from HWCore context )
     * 2: full path
     * @param {Function} callback -> function to cast as callback, if omitted 
     * a promise will be returned
     * @param {Object} options :
     *  {Boolean} skipPlg -> skip hwc plugin
     * @returns {Mixed}
     */
    pub_static.load = function (src, callback, options) {
        options = options || {};
        src = prepare(src, options);

        var done;

        function _load (resolve, reject, callback) {
            try {
                $.requirejs(src, function () {
                    var result = arguments;
                    if (callback) {
                        if (typeof callback !== "function")
                            throw new Error("callback type is: " + typeof (callback));

                        callback.apply($, result);
                    } else {
                        resolve.apply(null, result);
                    }
                }, function (err) {
                    if (callback) {
                        throw err;
                    } else {
                        reject(err);
                    }
                });
            } catch (e) {
                if (callback) {
                    throw new Exception(e);
                } else {
                    reject(e);
                }
            }
        }

        return callback && _load(null, null, callback) || new $.Promise(_load)["catch"](function (e) {
            console.error(e); // this is needed because Async lib is not loaded yet
        });
    };

    /**
     * 
     * @param {String} src -> path of resource to load
     * @param {Object} options :
     *  {Boolean} skipPlg -> skip hwc plugin
     *  {Boolean} rawScript -> put js code in script tag and 
     *  skip hwc plugin ( only for browser environment )
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
    
    Object.defineProperty($,"RSVP",{
        configurable: false,
        writable: false,
        value: RSVP
    });
    
    Object.defineProperty($,"Promise",{
        configurable: false,
        writable: false,
        value: RSVP.Promise
    });
    
    Object.defineProperty($,"Loader",{
        configurable: false,
        writable: false,
        value: Loader
    });

    return $.Loader;
});

