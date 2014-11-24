/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define(function () {
    return Hw2Core.Class = (function () {
        var lId = 0; // static last id registered

        /**
         *
         * @returns {Number} the incremented last id
         */
        _Class.incrId = function () {
            return ++lId;
        };

        /**
         *
         * @param {Object} descriptor elements:
         * type -> final / abstract modifier 
         * class -> name of class ( not implemented yet, use var best alternative )
         * base -> the prototype of parent class
         * use -> class or classes for code reusing
         * members -> associative array of members to add
         * @returns {_Class}
         */
        function _Class (descriptor) {
            var Obj = (function () {

                var __pub = _Object.prototype;
                var __pub_st = _Object;
                var __pvMembers = {st: {}, inst: []}; // private members
                var __pendingPvInst = [];

                function _Object () {
                    if (__pub_st.__isAbstract)
                        throw new Error('Abstract class may not be constructed');

                    var obj = Object.create(_Object.prototype);

                    var id = _Class.incrId();
                    __("__id", id, "public", {enumerable: true}, obj);
                    __pvMembers.inst[obj.__("__id")] = {};

                    for (id in __pendingPvInst) {
                        var m = __pendingPvInst[id];
                        __(m.name, m.val, m.attributes, obj);
                    }

                    try {
                        // call custom constructor if any
                        obj.__constructor.apply(this, arguments);
                    } catch (err) {
                    }

                    return obj;
                }

                /**
                 *  Magic methods and properties
                 */

                // dummy method for "duck type" checking
                Object.defineProperty(__pub, "__isClass", {value: function () {
                        return true;
                    },
                    enumerable: true
                });

                Object.defineProperty(__pub_st, "__isClass", {value: function (instance) {
                        return "__isClass" in instance;
                    },
                    enumerable: true
                });


                Object.defineProperty(__pub, "__pub_st", {value: function () {
                        return __pub_st;
                    },
                    enumerable: true
                });

                /**
                 * Destroy the object 
                 * TODO: reorganizing the instance array when it grows up
                 */
                Object.defineProperty(__pub, "__clean", {value: function () {
                        delete __pvMembers.inst[__("__id")];
                    },
                    enumerable: true
                });

                /**
                 * Inherit methods from another class ( such as traits )
                 */
                Object.defineProperty(__pub, "__inherit", {value: function (src) {
                        return __inherit(src, this, false);
                    },
                    enumerable: true
                });

                Object.defineProperty(__pub, "__addMembers", {value: function (elements) {
                        __pub_st.__addMembers(elements, this);
                    },
                    enumerable: true
                });

                /**
                 *
                 * @param {type} elements
                 * @param {type} instance (Optional) can be null if static member
                 * @returns {undefined}
                 */
                Object.defineProperty(__pub_st, "__addMembers", {value: function (elements, instance) {
                        for (var i = 0; i < elements.length; ++i) {
                            __pub_st.__(
                                    elements[i]["name"],
                                    elements[i]["val"],
                                    elements[i]["attributes"]
                                    , instance);
                        }
                    },
                    enumerable: true
                });

                Object.defineProperty(__pub, "__getMembers", {value: function (incStatic) {
                        return __pub_st.__getMembers(incStatic ? "both" : "instance", this);
                    },
                    enumerable: true
                });

                Object.defineProperty(__pub_st, "__getMembers", {value: function (type, instance) {
                        if (type === "static") {
                            return Object.keys(__pub_st);
                        } else if (type === "instance") {
                            return Object.keys(instance);
                        } else {
                            return {
                                static: Object.keys(__pub_st),
                                instance: Object.keys(instance)
                            };
                        }
                    },
                    enumerable: true
                });


                /**
                 * Add/Get a member to/from current object or prototype
                 * @param {type} name
                 * @param {type} val (Optional) giving name only, it will return the var value when it's possible
                 * @param {String} attributes (Optional)
                 * public/private
                 * static If no instance provided, this parameter will be forced.
                 * final
                 * @param {type} noInstance avoid current instance pass to define member in static or prototype instead
                 * @returns
                 */
                Object.defineProperty(__pub, "__", {value: function (name, val, attributes, noInstance) {
                        return __pub_st.__(name, val, attributes, noInstance ? null : this);
                    },
                    enumerable: true
                });

                /**
                 * Add/Get a member to/from defined Class, object or prototype
                 * @param {type} name
                 * @param {type} val (Optional) giving name only, it will return the var value when it's possible
                 * @param {String} attributes (Optional)
                 * public/private
                 * static If no instance provided, this parameter will be forced.
                 * final
                 * @param {type} instance (Optional) will use instance instead of prototype with non static members
                 * @returns
                 */
                Object.defineProperty(__pub_st, "__", {value: function (name, val, attributes, instance) {
                        if (val && name.indexOf("__") === 0) {
                            throw new Error("Members that starts with __ can only be declared internally!");
                        }

                        return __(name, val, attributes, instance, true);
                    },
                    enumerable: true
                });

                // private version
                var __ = function (name, val, attributes, instance, isPubCall) {
                    var res;

                    if (val) { // set                        
                        // true if not specified
                        var isPublic = attributes ? attributes.indexOf("private") < 0 : true;
                        // false if not specified
                        var isFinal = attributes ? attributes.indexOf("final") >= 0 : false;
                        // false if not specified, but if instance is not defined, it's forced to true
                        var isStatic = attributes ? attributes.indexOf("static") >= 0 : false;

                        if (!isPublic && !isStatic && !instance) {
                            __pendingPvInst.push({"name": name, "val": val, "attributes": attributes});
                            return;
                        }

                        var obj = isPublic ? // if
                                (isStatic ? __pub_st : __pub) : // else
                                (isStatic || name === "__id" ? // if
                                        __pvMembers.st : // else
                                        __pvMembers.inst[instance.__("__id")]);

                        // store parent object to apply next
                        var old = obj[name];

                        var tmp = {}, scope = null;
                        if (typeof val === "function") {
                            /*
                             * The first time we assign a value to a function is when we are
                             * inheriting a "Trait" ( "use" a class ) or just defining the method.
                             * So if there were another method before , it has been inherited by
                             * "base" and becomes the __super attribute
                             */
                            // define parent method if any
                            Object.defineProperty(tmp, "__super", {
                                value: old ? old.bind(obj) : null,
                                writable: false,
                                configurable: false,
                                enumerable: true
                            });
                        }

                        res = Object.defineProperty(obj, name, {
                            //__proto__: !isStatic ? obj.__proto__ : obj,
                            value: typeof val === "function" ? function () {
                                // expose private variable to internal class function
                                if (!scope) {
                                    if (!isStatic) {
                                        var instance = __pvMembers.inst[this.__("__id")];
                                        scope = instance;
                                    }

                                    // if still we've not scope
                                    if (!scope) {
                                        scope = {};
                                    }

                                    scope.__st = __pvMembers.st;
                                    scope.__super = tmp.__super;
                                    for (var prop in this) {
                                        scope[prop] = this[prop];
                                    }
                                }

                                return val.apply(scope, arguments);
                            } : val,
                            writable: !isFinal,
                            //configurable: $.inArray("configurable",attributes),
                            enumerable: true
                        });
                    } else { // get
                        if (!isPubCall) {
                            res = instance ? __pvMembers.inst[instance.__("__id")][name] : __pvMembers.st[name];
                        }

                        if (!res)
                            res = instance ? instance[name] : __pub_st[name];
                    }

                    return res;
                };

                return _Object;
            })();

            var __inherit = function (src, dest, isBase) {

                if (isBase) {
                    if (src.__isFinal)
                        throw Error("final class cannot be extended!");
                    // workaround
                    dest.prototype.prototype = src.prototype;
                    dest.prototype.__proto__ = src.prototype;
                } else {
                    function extend (destination, source) {
                        for (var prop in source) {
                            if (prop.indexOf("__") !== 0 // exclude Class magic methods
                                    && source.hasOwnProperty(prop) && prop !== "prototype") {
                                __(prop, source[prop], null, destination);
                            }
                        }
                    }

                    // traits
                    if (src instanceof Array) {
                        src.forEach(function (t) {
                            extend(dest.prototype, t);
                        });
                    } else {
                        extend(dest.prototype, src);
                    }
                }

            };

            if (descriptor) {
                if (descriptor.type && typeof descriptor.type === "string")
                    descriptor.type = descriptor.type.split(" ");

                /*if (typeof descriptor.class === "string")
                 Hw2Core[descriptor.class] = Obj;*/

                if (descriptor.base)
                    __inherit(descriptor.base, Obj, true);

                if (descriptor.use)
                    __inherit(descriptor.use, Obj, false);

                if (descriptor.members)
                    Obj.__addMembers(descriptor.members);

                if (descriptor.type) {
                    if (descriptor.type.indexOf("abstract") >= 0)
                        Object.defineProperty(Obj, "__isAbstract", {
                            value: true,
                            writable: false,
                            configurable: false,
                            enumerable: true
                        });

                    if (descriptor.type.indexOf("final") >= 0) {
                        Object.defineProperty(Obj, "__isFinal", {
                            value: true,
                            writable: false,
                            configurable: false,
                            enumerable: true
                        });

                        Object.preventExtensions(Obj);
                    }
                }
            }

            return Obj;
        }

        return _Class;
    }());
});
