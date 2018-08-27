const p = require("path");
const webpack = require("webpack");
var current_path = __dirname || "./";

var hwc_conf = { paths: {} };

hwc_conf.path_core = p.resolve(__dirname + "/../") + "/";

hwc_conf.paths.hwc_js_kernel_loader = hwc_conf.paths.hwc_js_kernel = hwc_conf.path_core + "js-kernel/index";
hwc_conf.paths.hwc_js_modules_path = hwc_conf.path_core + "js-modules/";
hwc_conf.paths.hwc_js_modules_weakmap = hwc_conf.paths.hwc_js_modules_path + "weakmap/index";
hwc_conf.paths.hwc_js_modules_rsvp = hwc_conf.paths.hwc_js_modules_path + "rsvp/index";
hwc_conf.paths.hwc_js_modules_jquery = hwc_conf.paths.hwc_js_modules_path + "jquery/index";
hwc_conf.paths.hwc_js_modules_requirenode = hwc_conf.paths.hwc_js_modules_path + "requirejs/r/index";
hwc_conf.paths.hwc_js_modules_requirejs = hwc_conf.paths.hwc_js_modules_path + "requirejs/requirejs/index";


global.hwc_conf = hwc_conf;

if (typeof module !== 'undefined' && module.exports) {
    // for nodejs environments
    var exports = {};

    exports.mode = "production";

    exports.devtool = 'source-map';

    exports.entry = [
        hwc_conf.paths.hwc_js_kernel + ".js"
    ];

    exports.output = {
        path: current_path + '/dist',
        filename: 'hwc-kernel.min.js'
    };

    exports.resolveLoader = {
        modules: [
            p.resolve(__dirname, "node_modules"),
            "node_modules"
        ],
    };

    exports.plugins = [
        new webpack.IgnorePlugin(/vertx/)
    ];

    exports.resolve = {
        modules: [
            p.resolve(__dirname),
            "node_modules"
        ],
        alias: hwc_conf.paths
    };

    module.exports = exports;
}
