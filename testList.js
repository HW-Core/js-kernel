/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

// list of test files
hwc.exports = function () {
    var $ = this;
    return {
        dep: [
        ],
        test: [
            $.const.PATH_JS_KERNEL + "tests/tests/core.js",
            $.const.PATH_JS_KERNEL + "tests/tests/loader.js"
        ]
    };
};

