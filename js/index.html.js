hw2.include([
    "hw2!{PATH_JS_LIB}browser/application/Component.js",
    "hw2!{PATH_JS_LIB}browser/application/System.js"
]).define(function () {
    var $ = this;

    var Main = $.class.extends($.Browser.Component)([
        $.public({
            __construct: function (parent, childs, opt) {
                var comp = parent.getRouter().getRouteInfo().getComponent();
                var page = comp || "home";

                var template = new $.Browser.Template("pages/" + page + ".html", "styles/index.css");
                opt.template = template;
                this.__super(parent, [], opt);
            },
            update: function () {
                this.__super();
            },
            init: function () {
                var that = this;
                this.__super().then(function () {
                    var pages = ["home", "loader", "installation","getting-started","how-to-create-a-module"];

                    for (i in pages) {
                        that.i.getRouter().setRoute(".nav-" + pages[i], {component: pages[i]});
                    }
                });

            },
            build: function () {
                this.__super();

                var comp = this.i.getRouter().getRouteInfo().getComponent();
                var page = comp || "home";

                $.Browser.Loader.load("pages/" + page + ".html", null, {selector: "#dyn-content"});
            }
        }),
        $.private({
            prevContent: null
        })
    ]);

    var system = new $.Browser.System(true);

    system.register("main", Main, {autoStart: true, selector: "#dyn-content"});

    system.init();

});
;