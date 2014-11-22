/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

// list of test files
define(function(){
    return {
        dep: [  
            HW2PATH_JS_KERNEL + "Class.js",
            HW2PATH_JS_KERNEL + "Loader.js"
        ],
        test: [
            HW2PATH_JS_KERNEL + "tests/tests/core.js",
            HW2PATH_JS_KERNEL + "tests/tests/class.js",
            HW2PATH_JS_KERNEL + "tests/tests/loader.js",
        ]
    };
});
