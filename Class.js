/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define(function () {
    with (Hw2Core) { // namespace
        var scope = Hw2Core; // HW2Core context
        return scope.Class = (function () {
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
             * class -> name of class ( optional )
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

                    function _Object () {
                        if (__pub_st.__isAbstract)
                            throw new Error('Abstract class may not be constructed');

                        var obj = Object.create(_Object.prototype);

                        var id = Class.incrId();
                        obj.__("__id", id, "public", {enumerable: true});
                        __pvMembers.inst[obj.__("__id")] = {};
                        try {
                            // call custom constructor if any
                            obj.__constructor.apply(this, arguments);
                        } catch (err) {
                        }

                        if (obj.__st().__isFinal)
                            Object.preventExtensions(obj);

                        if (descriptor) {
                            if (typeof descriptor.class === "string")
                                scope[descriptor.class] = Obj;

                            if (descriptor.base)
                                __inherit(descriptor.base, _Object, true);

                            if (descriptor.use)
                                __inherit(descriptor.use, _Object, false);
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


                    Object.defineProperty(__pub, "__st", {value: function () {
                            return __pub_st;
                        },
                        enumerable: true
                    });

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

                            var obj = isPublic ?
                                    (isStatic ? __pub_st : __pub) :
                                    (!instance || isStatic || name === "__id" ?
                                            __pvMembers.st : __pvMembers.inst[instance.__("__id")]);

                            // store parent object to apply next
                            var old = obj[name];

                            res = Object.defineProperty(obj, name, {
                                __proto__: obj.__proto__,
                                value: val,
                                writable: !isFinal,
                                //configurable: $.inArray("configurable",attributes),
                                enumerable: true
                            });

                            /*
                             * The first time we assign a value to a function is when we are
                             * inheriting a "Trait" ( "use" a class ) or just defining the method.
                             * So if there were another method before , it has been inherited by
                             * "base" and becomes the __super attribute
                             */

                            if (typeof res[name] === "function" && !res[name].__super) {
                                // define parent method if any
                                Object.defineProperty(res[name], "__super", {
                                    value: old,
                                    writable: false,
                                    configurable: false,
                                    enumerable: true
                                });
                            }
                        } else { // get
                            if (!isPubCall) {
                                res = instance ? __pvMembers.inst[instance.__("__id")][name] : __pvMembers.st[name];
                            }

                            if (!res)
                                res = instance ? instance[name] : __pub_st[name];
                        }

                        return res;
                    };

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
                                    if (source.hasOwnProperty(prop) && prop !== "prototype") {
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

                    return _Object;
                })();

                if (descriptor) {
                    if (descriptor.type && typeof descriptor.type === "string")
                        descriptor.type = descriptor.type.split(" ");

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

                        if (descriptor.type.indexOf("final") >= 0)
                            Object.defineProperty(Obj, "__isFinal", {
                                value: true,
                                writable: false,
                                configurable: false,
                                enumerable: true
                            });
                    }
                }

                return Obj;
            }

            return _Class;
        }());
    }
});