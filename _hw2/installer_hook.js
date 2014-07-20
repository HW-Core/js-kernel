var path = require("path");

module.exports = function(action, config, modulePath) {
    if (action == "postinstall") {
        console.log("Kernel postinstall event...");

        var fs = require('fs');
        config.cwd = config.cwd || process.cwd();

        // copy to root overwriting existing if any
        fs.createReadStream(modulePath + '/_hw2/index_files/index.html')
                .pipe(fs.createWriteStream(path.join(config.cwd, 'index.html')));

        var mocha = path.join(config.cwd, config.directory, 'core-dep/mocha/');
        fs.createReadStream(path.join(modulePath, '_hw2/mocha_custom/bower.custom.json'))
                .pipe(fs.createWriteStream(mocha + 'bower.custom.json'));
        
        // workaround: to avoid _hw2 folder deletations after update we've
        // to update .bower.json right now since the "keep" procedure
        // take care of previous json, not new one
        fs.createReadStream(path.join(modulePath, '_hw2/mocha_custom/bower.custom.json'))
                .pipe(fs.createWriteStream(mocha + '.bower.json'));

        fs.mkdir(path.join(mocha, "_hw2"), function(e) {
            fs.createReadStream(path.join(modulePath, '/_hw2/mocha_custom/installer_hook.js'))
                    .pipe(fs.createWriteStream(path.join(mocha, '_hw2/installer_hook.js')));

            var exec = require('child_process').exec;

            exec("hw2-bower cache clean mocha && hw2-bower update core-dep/mocha --force", {cwd: config.cwd}, function(error, stdout, stderr) {
                console.log('Installing mocha node modules...');

                if (stderr !== null) {
                    console.log('' + stderr);
                }
                if (stdout !== null) {
                    console.log('' + stdout);
                }
                if (error !== null) {
                    console.log('' + error);
                }
            });
        });
    }
};
