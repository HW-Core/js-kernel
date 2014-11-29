/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

define(function () {
    $ = Hw2Core;

    var mod = (function (modifiers) {
        function buildMembers (members, modifiers) {
            var m = [];
            for (var name in members) {
                var val, retType;
                if (members[name] instanceof $.dType) {
                    retType = members[name].type;
                    val = members[name].value;
                } else {
                    val = members[name];
                }

                m.push({
                    attributes: modifiers || ["public"],
                    name: name,
                    val: val,
                    retType: retType
                });
            }

            return m;
        }

        var obj = function () {
            var members;

            switch (arguments.length) {
                case 1:
                    members = arguments[0];
                    break;
                case 2:
                    var vname = arguments[0];
                    members = {};
                    members[vname] = arguments[1];
                    break;
                default:
                    throw new SyntaxError("Wrong number of parameters");
            }

            if (typeof members !== undefined) {
                return buildMembers(members, obj.modifiers);
            }

            return obj.modifiers;
        };

        obj.modifiers = modifiers;

        /**
         * CLASS
         */
        obj.class = (function () {
            var descriptor = {
                type: obj.modifiers,
                base: null,
                use: [],
                members: []
            };

            var cl = function (members) {
                if (members !== undefined)
                    cl.members(members);

                return $.Class(descriptor);
            };

            cl.extends = function (base) {
                if (base !== undefined) {
                    if (descriptor.base) {
                        throw new SyntaxError("Multiple use of extends");
                    }

                    descriptor.base = base;
                }

                return cl;
            };

            cl.use = function (traits) {
                if (traits !== undefined)
                    descriptor.use = descriptor.use.length ? descriptor.use.concat(traits) : traits;

                return cl;
            };

            cl.members = function (members) {
                if (members !== undefined && members instanceof Array) {
                    members.forEach(function (m) {
                        descriptor.members = descriptor.members.length > 0 ? descriptor.members.concat(m) : m;
                    });

                    return cl;
                }

                throw new SyntaxError("Members must be defined as an array of properties!");
            };

            cl.define = function () {
                return cl();
            };

            return cl;
        })();

        // NOT IMPLEMENTED YET
        /**
         * INTERFACE
         */
        /*obj.interface = (function () {
         var descriptor={
         type: obj.modifiers.push("interface"),
         base: null,
         use: [],
         members: []
         };
         
         var iface=function(members) {
         if (members!==undefined)
         iface.members(members);
         
         return $.Class(descriptor);
         };
         
         iface.extends=function(base) {
         descriptor.use=descriptor.use.length ? descriptor.use.concat(traits) : traits;
         return cl;
         };
         
         iface.members=function(members) {               
         descriptor.members=descriptor.members.length ? descriptor.use.concat(members) : members;
         return iface;
         };
         
         iface.define=function() {
         return iface();
         };
         
         return iface;
         })();
         */

        /**
         * TEMPLATE
         */
        /*
         obj.template = (function () {
         var descriptor={
         type: obj.modifiers.push("template"),
         base: null,
         use: [],
         members: []
         };
         
         var tmpl=function(members) {
         if (members!==undefined)
         tmpl.members(members);
         
         return $.Class(descriptor);
         };
         
         tmpl.extends=function(base) {
         if (descriptor.base) {
         throw new SyntaxError("Multiple use of extends");
         }
         
         descriptor.base=base;
         return tmpl;
         };
         
         tmpl.members=function(members) {               
         descriptor.members=descriptor.members.length ? descriptor.use.concat(members) : members;
         return tmpl;
         };
         
         tmpl.define=function() {
         return tmpl();
         };
         
         return tmpl;
         })();
         */

        return obj;
    });

    $.public = new mod(["public"]);
    $.private = new mod(["private"]);
    $.protected = new mod(["protected"]);

    $.static = new mod(["static"]);
    $.final = new mod(["final"]);
    $.abstract = new mod(["abstract"]);

    //
    // COMBINATIONS
    //
    //

    // PUBLIC
    $.public.final = new mod(["public", "final"]);
    $.public.static = new mod(["public", "static"]);
    $.public.final.static = new mod(["public", "final", "static"]);
    $.public.static.final = $.public.final.static;
    $.public.abstract = new mod(["public", "abstract"]);

    // PRIVATE
    $.private.final = new mod(["private", "final"]);
    $.private.static = new mod(["private", "static"]);
    $.private.final.static = new mod(["private", "final", "static"]);
    $.private.static.final = $.private.final.static;
    $.private.abstract = new mod(["private", "abstract"]);

    // PROTECTED
    $.protected.final = new mod(["protected", "final"]);
    $.protected.static = new mod(["protected", "static"]);
    $.protected.final.static = new mod(["protected", "final", "static"]);
    $.protected.static.final = $.protected.final.static;
    $.protected.abstract = new mod(["protected", "abstract"]);

    // ABSTRACT
    $.abstract.public = new mod(["abstract", "public"]);
    $.abstract.private = new mod(["abstract", "private"]);
    $.abstract.protected = new mod(["abstract", "protected"]);

    // STATIC

    $.static.public = new mod(["static", "public"]);
    $.static.private = new mod(["static", "private"]);
    $.static.protected = new mod(["static", "protected"]);

    // FINAL
    $.final.public = new mod(["final", "public"]);
    $.final.private = new mod(["final", "private"]);
    $.final.protected = new mod(["final", "protected"]);

    // STATIC/FINAL COMBINATION
    $.final.static = $.static.final = new mod(["static", "final"]);
    $.final.static.public = $.static.final.public = new mod(["static", "final", "public"]);
    $.final.static.private = $.static.final.private = new mod(["static", "final", "private"]);
    $.final.static.protected = $.static.final.protected = new mod(["static", "final", "protected"]);


    /*
     * 
     * UTILS
     * 
     */


    $.typeOf = function (obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    $.dType = function (type, value) {
        this.type = type;
        this.value = value;
    };


    $.typeHint = function (type, value) {
        if (typeof value !== "function")
            $.typeCompare(type, value);

        return new $.dType(type, value);
    };

    $.typeCompare = function (type, val) {
        if (typeof type === "string") {
            var t = Hw2Core.typeOf(val);
            if (t !== type) {
                throw new TypeError("Incompatible return type: " + t + " , excepted " + type);
            }
        } else {
            if (!(val.constructor === type)) {
                throw new TypeError("Incompatible return type: " + typeof val + " , excepted " + type.name);
            }
        }
    }

});