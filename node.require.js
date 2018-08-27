var path = require("path");
global.hwc_path = path.resolve(__dirname + "/../") + "/";

// require r.js
var requirenodePath = global.hwc_path + "js-modules/requirejs/r/index";
global.requirejs = require(requirenodePath);

var wpconf = require("./webpack.config");

global.requirejs.config({
    nodeRequire: require,
    paths: hwc_conf.paths
});

if (typeof define !== 'function') {
    global.define = global.requirejs;
}

//replace nodejs require native method with requirejs one
module.constructor.prototype.require = global.requirejs;

module.exports = global.requirejs;

