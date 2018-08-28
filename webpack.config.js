const p = require("path");
const webpack = require("webpack");
var current_path = __dirname || "./";

var hwc_conf = require("./webpack.paths");

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
