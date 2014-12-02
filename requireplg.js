define(function () {
    //Helper function to parse module name
    function parse (name) {
        var parts = name.split(':');
        var constant, path;
        if (parts.length > 1) {
            constant = parts[0],
                    path = parts[1];
        } else {
            path = parts[0];
        }

        return {
            constant: constant,
            path: path
        };
    }

    var context;
    var paths = {};


    return {
        normalize: function (name, parent) {
            var path = "";
            var parts = parse(name);
            if (parts.constant) {
                path = paths[parts.constant] || parts.constant + ":";
            }

            path += parts.path;

            return parent(path);
        },
        load: function (name, req, onload, config) {
            if (!context) {
                context = config.context;
                paths = context.const;
            }

            req([name], function (value) {
                onload(value instanceof hw2.Module ?
                        value.module.call(config.context) :
                        value);
            });
        }
    };
});