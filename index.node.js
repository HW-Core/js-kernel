/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

listFile = typeof listFile !== "undefined" ? listFile : "./testList.js";

var Hw2Core = require("../index.js");

Hw2Core(function () {
    var $ = this;

    var Mocha = require($.const.PATH_CORE + 'modules/js/modules/mocha/index.js');
    global.assert = require($.const.PATH_CORE + 'modules/js/modules/chai/index.js').assert;
    global.mocha = new Mocha({
        ui: 'bdd',
        reporter: 'list',
        bail: false, // do not stop at error
        globals: ["hw2", "jQuery"],
        ignoreLeaks: false
    });

    $.Loader.load([listFile], function (testPaths) {
        $.Loader.load(testPaths.dep, function () {

            for (var id in testPaths.test) {
                mocha.addFile(testPaths.test[id]);
            }

            // small hack to run define with hw2core mocha tests on node
            hw2.defTests = function () {
                switch (arguments.length) {
                    case 1:
                        var def = arguments[0];
                        def.call($);
                        break;
                    case 2:
                        var def = arguments[1];
                        def.call($);
                        break;
                    default:
                        throw new SyntaxError("Invalid number of parameters");
                }
            };

            mocha.run(function (failures) {
                process.exit;
            });
        });
    });
});


