// TODO: use an AMD module instead ?

Hw2Core.I(function () {
    $ = Hw2Core;
    $.Loader.load([
        HW2PATH_JS_LIB + "browser/common/Loader.js",
        HW2PATH_JS_LIB + "browser/common/Uri.js",
        HW2PATH_JS_LIB + "browser/common/Events.js"
    ], function (Loader) {
        // NAVIGATOR
        var justLoading=null;

        function loadPage (page) {
            if (!justLoading || justLoading!==page) {
                justLoading=page;
                Loader.load("pages/" + page + ".html", checkNavigation, {selector: "#dyn-content"});
            }
        }

        function checkNavigation () {
            $.Browser.Events.onBodyLoad(function () {
                var pages = ["home", "class", "class-friendly", "class-basic", "loader", "installation"];

                pages.forEach(function (page) {
                    $.Browser.JQ(".nav-" + page).each(function (id,el) {
                        var element=$.Browser.JQ(el);
                        var evt = $.Browser.JQ._data(el, 'events');
                        if (!evt || !evt.click) {
                            element.click(function (evt) {
                                loadPage(page);
                            });
                        }
                    });
                });
            });
        }

        function getPage () {
            return new $.Browser.Uri(document.location.href).getFragment() || "home";
        }

        window.addEventListener("popstate", function (e) {
            loadPage(getPage());
        });

        loadPage(getPage());
    });
});