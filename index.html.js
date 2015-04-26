hw2.exports = function () {
    var $ = this;
    function getParameterByName (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var listFile = getParameterByName("listfile") || "./testList.js";

    var css = document.createElement('link');
    css.rel = "stylesheet";
    css.href = $.const.PATH_CORE + 'modules/js/modules/mocha/mocha.css';
    document.getElementsByTagName('head')[0].appendChild(css);

    $.Loader.load([
        $.const.PATH_CORE + 'modules/js/modules/chai/index.js',
        $.const.PATH_CORE + 'modules/js/modules/mocha/mocha.js'
    ], function (chai) {
        mocha.checkLeaks();
        mocha.setup({
            ui: 'bdd',
            //globals: ["$","jQuery"],
            ignoreLeaks: false
        });
        assert = chai.assert;

        $.Loader.load([listFile], function (list) {
            $.Loader.load(list.dep, function () {
                var testList = list.test;

                $.Loader.load(testList, function () {
                    mocha.run();
                });
            });
        });
    });
};