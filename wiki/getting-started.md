**Getting started ( Sample Code )** 
------------------------------------

After the [installation](wiki/installation) , you can use following bootstrap code:

**if you want run it on browser, it's the html bootstrap example (index.html)**

    <html>
        <head>
            <script src="your-module-path/hw-core/js-modules/requirejs/requirejs/index.js"></script>
            <script src="your-module-path/hw-core/js-kernel/index.js"></script>
            <script>
                hwc.module([
                    // you can load hwc framework modules here
                ], function() {
                    // your code powered by hwc
                })
            </script>
        </head>
        <body>

        </body>
    </html>

**if you want run it on server, it's the bootstrap for nodejs (index.js):** 

    var hwc = require("your-module-path/hw-core/js-kernel/index.node");

    hwc.init(function() {
        // you can write your code here using hw-core features
    });