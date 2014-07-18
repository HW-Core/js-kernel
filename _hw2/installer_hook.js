module.exports = function(action, config, modulePath) {

    if (action == "postinstall") {
        var fs = require('fs');
        // copy to root overwriting existing if any
        fs.createReadStream(modulePath + '/_hw2/index_files/index.html')
                .pipe(fs.createWriteStream(config.cwd + '/index.html'));

        var mocha = config.cwd+"/"+config.directory + '/core-dep/mocha/';
        fs.createReadStream(modulePath + '/_hw2/mocha_custom/bower.custom.json')
                .pipe(fs.createWriteStream(mocha + 'bower.custom.json'));

        fs.mkdir(mocha + "_hw2", function(e) {
            fs.createReadStream(modulePath + '/_hw2/mocha_custom/installer_hook.js')
                    .pipe(fs.createWriteStream(mocha + '_hw2/installer_hook.js'));

            var exec = require('child_process').exec;

            exec("hw2-bower update core-dep/mocha --force", {cwd:config.cwd});
        });
    }
};
