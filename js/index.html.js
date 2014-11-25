// TODO: use an AMD module instead ?

Hw2Core.I(function () {
    $ = Hw2Core;
    $.Loader.load([
        HW2PATH_JS_LIB + "browser/common/Loader.js",
        HW2PATH_JS_LIB + "browser/common/Uri.js",
        HW2PATH_JS_LIB + "browser/common/Events.js"
    ], function (Loader) {
        // NAVIGATOR
        $.Browser.Events.onBodyLoad(function () {
            var pages = ["home", "class", "loader", "core", "index"];

            pages.forEach(function (page) {
                $.Browser.JQ("#nav-"+page).on("click", function (e) {
                    Loader.load("pages/"+page+".html", null, {selector: "#dyn-content"});
                });
            });
        });

        var page=$.Browser.Uri.I().getFragment() || "home";
        // LOAD MAIN PAGE
        Loader.load("pages/"+page+".html", null, {selector: "#dyn-content"});
    });
});