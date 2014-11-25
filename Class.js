/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define(function () {
    return Hw2Core.Class = (function () {
        /**
         *
         * @param {Object} descriptor elements:
         * type {Array of Strings / String} -> final / abstract modifier 
         * class {String} -> name of class ( not implemented yet, use var best alternative )
         * base {Object} -> the prototype of parent class
         * use {Object} -> class or classes for code reusing
         * members {Array of Object} -> associative array of members to add
         * @returns {_Class}
         */
        function _Class (descriptor) {
            var Obj = (function () {

                var __freeIds = {};

                var __setFreeId = function (id) {
                    __freeIds[id] = true;
                };

                var __delFreeId = function (id) {
                    delete __freeIds[id];
                };

                var __getFirstFreeId = function () {
                    for (var id in __freeIds) {
                        __delFreeId(id);
                        return id; // if there's a free id return directly
                    }

                    // otherwise increment the array
                    return __pvMembers.inst.length;
                };

                var __pub = _Object.prototype;
                var __pub_st = _Object;
                var __pvMembers = {st: {}, inst: []}; // private members
                var __pendingPvInst = [];
                var __base = null;

                function _Object () {
                    if (__pub_st.__isAbstract) { 
                        var caller=arguments.callee.caller;
                        if (typeof caller["__isClass"]==="undefined" || caller.__getBase() !== __pub_st )
                            throw new Error('Abstract class may not be constructed');
                    }

                    var obj = Object.create(_Object.prototype);

                    var id = __getFirstFreeId();
                    __("__id", id, "public", obj);
                    __pvMembers.inst[id] = {};

                    for (var prop in __pendingPvInst) {
                        var m = __pendingPvInst[prop];
                        __(m.name, m.val, m.attributes, obj);
                    }

                    if (typeof obj["__construct"]!=="undefined") {
                        // also base must be instantiated
                        if (__base) {
                            var base = Object.create(__base.prototype);
                            obj.__("__parent", __base.apply(base, arguments), "private");
                        }
                        
                        // call custom constructor if any
                        obj.__construct.apply(obj, arguments);
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
                
                Object.defineProperty(__pub_st, "__getBase", {value: function (instance) {
                        return __base;
                    },
                    enumerable: true
                });

                /**
                 * Destroy the object 
                 * TODO: reorganizing the instance array when it grows up
                 */
                Object.defineProperty(__pub, "__destruct", {value: function () {
                        var id = this.__("__id");
                        delete __pvMembers.inst[id];
                        __setFreeId(id);

                        for (var prop in this) { // destroy all object properties
                            this[prop] = undefined;
                            delete this[prop];
                        }

                        this.__proto__ = null;

                        return null;
                    },
                    enumerable: true
                            //writable: true
                });

                Object.defineProperty(__pub, "__construct", {value: function () {
                    },
                    enumerable: true,
                    writable: true
                });

                /**
                 * expose the static public members to call directly from an instantiated object
                 */
                Object.defineProperty(__pub, "__pub_st", {value: function () {
                        return __pub_st;
                    },
                    enumerable: true,
                    writable: true
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
                 * @param {type} noInstance avoid current instance pass to get member from static 
                 *  or define to prototype if no static attribute exist and value is a function
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
                        /*if (val && name.indexOf("__") === 0 && name!=="__construct") {
                         throw new Error("Members that starts with __ can only be declared internally!");
                         }*/

                        return __(name, val, attributes, instance, true);
                    },
                    enumerable: true
                });

                // private version
                var __ = function (name, val, attributes, instance, isPubCall) {
                    var res;

                    if (typeof val !== "undefined") { // set                        
                        // true if not specified
                        var isPublic = attributes ? attributes.indexOf("private") < 0 : true;
                        // false if not specified
                        var isFinal = attributes ? attributes.indexOf("final") >= 0 : false;
                        // false if not specified, but if instance is not defined, it's forced to true
                        var isStatic = attributes ? attributes.indexOf("static") >= 0 : false;

                        // if it's an instance variable, we've to delegate the definition to the constructor
                        if (!isStatic
                                && (typeof val !== "function" || !isPublic)
                                && !instance) {
                            __pendingPvInst.push({"name": name, "val": val, "attributes": attributes});
                            return;
                        }


                        if (isPublic) {
                            if (isStatic) {
                                obj = __pub_st;
                            } else if (typeof val === "function") {
                                obj = __pub;
                            } else {
                                obj = instance;
                            }
                        } else if (isStatic) {
                            obj = __pvMembers.st;
                        } else {
                            obj = __pvMembers.inst[instance.__("__id")];
                        }

                        // store parent object to apply next
                        var old = obj[name];

                        var scope = null;

                        res = Object.defineProperty(obj, name, {
                            //__proto__: !isStatic ? obj.__proto__ : obj,
                            value: typeof val === "function" ? function () {
                                if (!scope) {
                                    // expose private variable to internal class function
                                    if (!isStatic) {
                                        scope = typeof this.__scope === "undefined" ? this : this.__scope;
                                        scope.__i = __pvMembers.inst[scope.__("__id")];
                                        scope.__i.__scope = scope;
                                    } else {
                                        scope = typeof obj.__scope === "undefined" ? obj : obj.__scope;
                                    }

                                    scope.__s = __pvMembers.st;
                                    scope.__s.__scope = __pub_st;

                                    // as scope for __super we pass the base class environment
                                    // TODO: however a check should be done when __super
                                    // calls a trait method since we need
                                    // current scope instead
                                    var sBind = isStatic ? __base : scope.__i.__parent;
                                    Object.defineProperty(scope, "__super", {
                                        value: old ? old.bind(sBind) : null,
                                        writable: true,
                                        configurable: true,
                                        enumerable: true
                                    });
                                }

                                return val.apply(scope, arguments);
                            } : val,
                            writable: !isFinal,
                            //configurable: attributes.indexOf("configurable"),
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

                var __inherit = function (src, dest, isBase) {

                    if (isBase) {
                        if (src.__isFinal)
                            throw Error("final class cannot be extended!");
                        // workaround
                        dest.prototype.prototype = src.prototype;
                        dest.prototype.__proto__ = src.prototype;
                        __base = src;
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
                    if (descriptor.base)
                        __inherit(descriptor.base, _Object, true);

                    if (descriptor.use)
                        __inherit(descriptor.use, _Object, false);
                }


                return _Object;
            })();

            if (descriptor) {
                if (descriptor.type && typeof descriptor.type === "string")
                    descriptor.type = descriptor.type.split(" ");

                /*if (typeof descriptor.class === "string")
                 Hw2Core[descriptor.class] = Obj;*/

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
