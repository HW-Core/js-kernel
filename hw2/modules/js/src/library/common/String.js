/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define(function () {
    var $ = Hw2Core;
    return Hw2Core.String = $.Class({members: [
            {
                /**
                 * convert any string to hashcode
                 */
                attributes: "public static",
                name: "hashCode",
                val: function (string) {
                    var hash = 0;
                    if (string.length === 0)
                        return hash;
                    for (i = 0; i < string.length; i++) {
                        char = string.charCodeAt(i);
                        hash = ((hash << 5) - hash) + char;
                        hash = hash & hash; // Convert to 32bit integer
                    }
                    return hash;
                }
            }
        ]}
    );
}); 