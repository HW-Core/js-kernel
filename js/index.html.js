/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

hw2.exports = function () {
    var $ = this;
    $.Loader.load([
        $.const.PATH_JS_LIB + "browser/common/Loader.js",
        $.const.PATH_JS_LIB + "browser/common/Uri.js",
        $.const.PATH_JS_LIB + "browser/common/Events.js"
    ], function () {
        // NAVIGATOR
        var justLoading = null;

        function loadPage (page) {
            if (!justLoading || justLoading !== page) {
                justLoading = page;
                $.Browser.Loader.load("pages/" + page + ".html", checkNavigation, {selector: "#dyn-content"});
            }
        }

        function checkNavigation () {
            $.Browser.Events.onBodyLoad(function () {
                var pages = ["home", "class", "class-friendly", "class-basic", "loader", "installation"];

                pages.forEach(function (page) {
                    $.Browser.JQ(".nav-" + page).each(function (id, el) {
                        var element = $.Browser.JQ(el);
                        var evt = $.Browser.JQ._data(el, 'events');
                        if (!evt || !evt.mousedown) {
                            element.mousedown(function (evt) {
                                if (event.which === 1) // left mouse click
                                    loadPage(page);
                            });
                        }
                    });
                });
            });
        }

        var getPage = function  () {
            return new this.Browser.Uri(document.location.href).getFragment() || "home";
        }.bind($);

        window.addEventListener("popstate", function (e) {
            loadPage(getPage());
        });

        loadPage(getPage());
    });

};