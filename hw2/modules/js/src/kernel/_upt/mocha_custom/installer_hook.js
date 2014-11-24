var exec = require('child_process').exec;

module.exports = function(action, config, name, pkgPath, newMeta, oldMeta, callback) {
    if (action == "postinstall") {
        console.log('Installing mocha node modules...');
        // using cd instead cwd because it has a strange behavior in this contest
        exec('cd "'+pkgPath+'" && npm install', /*{"cwd": pkgPath},*/ function(error, stdout, stderr) {
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
    } else {
        callback();
    }
};
