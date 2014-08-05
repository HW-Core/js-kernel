module.exports = function(action, config, name, pkgPath, newMeta, oldMeta, callback) {
    var path = require("path");
    var mkdirp = require('mkdirp');
    var fs = require('fs');

    if (action == "postresolved" && !config.cmdOptions.production) {
        console.log("Creating mocha hooks and customizations..");

        config.cwd = config.cwd || process.cwd();

        var mocha = path.join(config.cwd, config.directory, 'hw2/dep/mocha/');
        var mocha_upt=path.join(mocha, "_upt")

        mkdirp.sync(mocha_upt); // create mocha folder + _upt

        // copy overwriting
        fs.createReadStream(path.join(pkgPath, '_upt/mocha_custom/upt.custom.json'))
        .pipe(fs.createWriteStream(path.join(mocha,'upt.custom.json'))
                .on("finish",function() {

                        // workaround: to avoid _upt folder deletations after update we've
                        // to update .upt.json right now since the "keep" procedure
                        // take care of previous json, not new one
                        fs.createReadStream(path.join(pkgPath, '_upt/mocha_custom/upt.custom.json'))
                        .pipe(fs.createWriteStream(path.join(mocha , '.upt.json'))
                                 .on("finish",function() {

                                        fs.createReadStream(path.join(pkgPath, '_upt/mocha_custom/installer_hook.js'))
                                        .pipe(fs.createWriteStream(path.join(mocha_upt, 'installer_hook.js'))
                                                .on("finish",function() {;
                                                    callback();
                                                 })
                                         )
                                 })
                        )
                })
        );
    } else {
        callback();
    }
};
