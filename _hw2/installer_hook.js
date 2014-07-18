var path=require("path");

module.exports = function(action, config, modulePath) {

    if (action == "postinstall") {
        var fs = require('fs');
        config.cwd=config.cwd || process.cwd();
        config.directory=config.directory || "";

        var modulePath=path.join(config.cwd,config.directory);
        // copy to root overwriting existing if any
        fs.createReadStream(modulePath + '/_hw2/index_files/index.html')
                .pipe(fs.createWriteStream( path.join(config.cwd , 'index.html') ));

        var mocha = path.join(modulePath, 'core-dep/mocha/');
        fs.createReadStream(path.join(modulePath,'_hw2/mocha_custom/bower.custom.json'))
                .pipe(fs.createWriteStream(mocha + 'bower.custom.json'));

        fs.mkdir(path.join(mocha , "_hw2"), function(e) {
            fs.createReadStream(path.join(modulePath, '/_hw2/mocha_custom/installer_hook.js'))
                    .pipe(fs.createWriteStream(path.join(mocha , '_hw2/installer_hook.js')));

            var exec = require('child_process').exec;

            exec("hw2-bower update core-dep/mocha --force", {cwd:config.cwd});
        });
    }
};
