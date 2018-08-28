const p = require("path");

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

module.exports = hwc_conf;