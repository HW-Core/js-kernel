define(function () {
    var context;
    var paths = {};


    return {
        normalize: function (name, parent) {
            // scan
            var path = "", constant = "", start = -1, len = name.length;
            for (var i = 0; i < len; i++) {
                if (start == -1) {
                    if (name[i] === "{") {
                        start = i;
                        continue;
                    }

                    path += name[i];
                } else {
                    // reset
                    if (name[i] === "{") {
                        start = -1;
                        // it's not a constant so concatenate original substring
                        path += "{" + constant + "{";
                        continue;
                    }

                    if (name[i] === "}") {
                        path += paths[constant] || "{" + constant + "}";
                        start = -1;
                        continue;
                    }

                    constant += name[i];
                    // it's the latest character
                    if (i == len - 1) {
                        path += "{" + constant;
                    }
                }
            }

            return parent(path);
        },
        load: function (name, req, onload, config) {
            if (!context) {
                context = config.context;
                paths = context.const;
            }

            req([name], function (value) {
                // small hack
                if (value && value.__isHw2Module) {
                    value = value();
                }

                var res = value instanceof hw2.Module ?
                        value.module.apply(config.context, value.args) :
                        value;

                onload(res);
            });
        }
    };
});