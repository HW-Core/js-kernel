/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

HW2PATH_ROOT = typeof HW2PATH_ROOT !== "undefined" ? HW2PATH_ROOT : "../../../../../../";
listFile = typeof listFile !== "undefined" ? listFile : "./testList.js";

var Bootstrap = require("../index.js");

var Mocha = require(HW2PATH_CORE + 'modules/dep/mocha/index.js');
global.assert = require(HW2PATH_CORE + 'modules/dep/chai/index.js').assert;
global.mocha = new Mocha({
    ui: 'bdd',
    reporter: 'list',
    bail: false // do not stop at error
});

requirejs([listFile],function(testPaths) {
    requirejs(testPaths.dep,function() {

        for (id in testPaths.test) {
            mocha.addFile(testPaths.test[id]);
        }

        mocha.run(function (failures) {
            process.exit;
        });
    });
});


