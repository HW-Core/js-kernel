var exec = require('child_process').exec;

module.exports = function(action, config, modulePath) {

    if (action == "postinstall") {
        console.log('Installing mocha node modules...');
        exec('npm install', {"cwd": modulePath}, function(error, stdout, stderr) {
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
    }
};
