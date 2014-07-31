var path = require("path");

module.exports = function(action,config,name,pkgPath,newMeta,oldMeta,callback) {
    if (action == "postinstall") {
        var fs = require('fs');
        config.cwd = config.cwd || process.cwd();

        // copy to root overwriting existing if any
        fs.createReadStream(pkgPath + '/_hw2/index_files/index.html')
                .pipe(fs.createWriteStream(path.join(config.cwd, 'index.html')));

        var mocha = path.join(config.cwd, config.directory, 'Hw2/dep/mocha/');
        fs.createReadStream(path.join(pkgPath, '_hw2/mocha_custom/upt.custom.json'))
                .pipe(fs.createWriteStream(mocha + 'upt.custom.json'));

        // workaround: to avoid _hw2 folder deletations after update we've
        // to update .bower.json right now since the "keep" procedure
        // take care of previous json, not new one
        fs.createReadStream(path.join(pkgPath, '_hw2/mocha_custom/upt.custom.json'))
                .pipe(fs.createWriteStream(mocha + '.upt.json'));

        fs.mkdir(path.join(mocha, "_hw2"), function(e) {
            fs.createReadStream(path.join(pkgPath, '/_hw2/mocha_custom/installer_hook.js'))
                    .pipe(fs.createWriteStream(path.join(mocha, '_hw2/installer_hook.js')));

            var exec = require('child_process').exec;

            exec("upt cache clean mocha && \
                    upt update Hw2/dep/mocha --config.directory=" + config.directory + " --force",
                    {cwd: config.cwd}, function(error, stdout, stderr) {
                console.log('updating mocha...');

                if (stderr !== null) {
                    console.log('' + stderr);
                }

                if (stdout !== null) {
                    console.log('' + stdout);
                }
                if (error !== null) {
                    console.log('' + error);
                }

                callback();
            });
        });


    } else {
        callback();
    }
};
