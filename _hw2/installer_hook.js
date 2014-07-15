module.exports=function(event,basePath,modulePath) {
    
    if (event=="postinstall") {
        var fs = require('fs');

        fs.createReadStream(modulePath+'/_hw2/index_files/index.html')
                .pipe(fs.createWriteStream(basePath+'/../index.html')); // copy to root
    }
};