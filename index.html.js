function getParameterByName (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var listFile = getParameterByName("listfile") || "./testList.js";

Hw2Core.I();

requirejs([
    HW2PATH_CORE + 'modules/dep/chai/index.js',
    HW2PATH_CORE + 'modules/dep/mocha/mocha.js'
], function (chai) {
    mocha.checkLeaks();
    mocha.setup({
        ui : 'bdd',
        //globals: ["$","jQuery"],
        ignoreLeaks: false
    });
    assert = chai.assert;

    requirejs([listFile], function (list) {
        requirejs(list.dep, function () {
            list = list.test;

            var size = list.length;
            var loaded = 0;

            function runMocha () {
                if (size === loaded)
                    mocha.run();
            }

            for (id in list) {
                var sc = document.createElement("script");
                sc.setAttribute("src", list[id]);
                sc.setAttribute("type", "text/javascript");
                sc.onload = function () {
                    loaded++;
                    runMocha();
                };
                document.head.appendChild(sc);
            }
        });
    });
});


