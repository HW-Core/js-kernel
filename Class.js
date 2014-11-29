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

                function _pvObject () {
                    return __constructor(true, arguments);
                }

                function _Object () {
                    return __constructor(false, arguments);
                }

                var __proto = _Object.prototype;
                var __proto_st = _Object;
                var __pvMembers = {
                    st: {self: _pvObject},
                    inst: []
                }; // private members
                var __pendingPvInst = [];
                var __base = null;

                function __constructor (isPvCall, args) {
                    if (__proto_st.__isAbstract) {
                        var caller = args.callee.caller.caller;
                        if (typeof caller["__isClass"] === "undefined" || caller.__getBase() !== __proto_st)
                            throw new Error('Abstract class may not be constructed');
                    }

                    if (__proto_st.__isStatic) {
                        throw new Error('Static class may not be instantiated');
                    }

                    var obj = Object.create(_Object.prototype);

                    var id = __getFirstFreeId();
                    __("__id", id, "public", null, obj);
                    __pvMembers.inst[id] = {};

                    for (var prop in __pendingPvInst) {
                        var m = __pendingPvInst[prop];
                        __(prop, m.val, m.attributes, m.retType, obj);
                    }


                    // check for private constructor
                    if (!isPvCall && __pvMembers.inst[id]["__construct"] !== undefined)
                        throw new Error('Class with private constructor may not be instantiated');

                    // this returns constructor and checks about protected accessor
                    obj.__pvFlag = isPvCall;
                    var constructor = __("__construct", undefined, null, null, obj);
                    delete obj.__pvFlag;

                    if (constructor !== undefined) {

                        // also base must be instantiated
                        if (__base) {
                            var base = Object.create(__base.prototype);
                            obj.__("__parent", __base.apply(base, args), "private");
                        }

                        // call constructor
                        constructor.apply(obj, args);
                    }

                    if (Obj.__isFinal) {
                        //Object.preventExtensions(Obj);
                        Object.seal(obj);
                    }

                    return obj;
                }

                Object.defineProperty(__proto, "__construct", {value: function () {
                    },
                    enumerable: true,
                    writable: true,
                    configurable: true
                });

                /**
                 *  Magic methods and properties
                 */

                // dummy method for "duck type" checking
                Object.defineProperty(__proto, "__isClass", {value: function () {
                        return true;
                    },
                    enumerable: true
                });

                Object.defineProperty(__proto_st, "__isClass", {value: function (instance) {
                        return "__isClass" in instance;
                    },
                    enumerable: true
                });

                Object.defineProperty(__proto_st, "__getBase", {value: function (instance) {
                        return __base;
                    },
                    enumerable: true
                });

                /**
                 * Destroy the object 
                 * TODO: reorganizing the instance array when it grows up
                 */
                Object.defineProperty(__proto, "__destruct", {value: function () {
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

                /**
                 * expose the static public members to call directly from an instantiated object
                 */
                Object.defineProperty(__proto, "__st", {value: function () {
                        return __proto_st;
                    },
                    enumerable: true,
                    writable: true
                });

                /**
                 * Inherit methods from another class ( such as traits )
                 */
                Object.defineProperty(__proto, "__inherit", {value: function (src) {
                        return __inherit(src, this, false);
                    },
                    enumerable: true
                });

                Object.defineProperty(__proto, "__addMembers", {value: function (elements) {
                        __proto_st.__addMembers(elements, this, arguments[1]);
                    },
                    enumerable: true
                });

                /**
                 *
                 * @param {type} elements
                 * @param {type} instance (Optional) can be null if static member
                 * @returns {undefined}
                 */
                Object.defineProperty(__proto_st, "__addMembers", {value: function (elements, instance) {
                        var publicCall = true;
                        // hidden argument for internal use
                        if (arguments[2] !== undefined && arguments[2] instanceof __Delegator)
                            publicCall = false;

                        for (var i = 0; i < elements.length; ++i) {
                            __(elements[i]["name"],
                                    elements[i]["val"],
                                    elements[i]["attributes"],
                                    elements[i]["retType"],
                                    instance,
                                    publicCall);
                        }
                    },
                    enumerable: true
                });

                Object.defineProperty(__proto, "__getMembers", {value: function (incStatic) {
                        return __proto_st.__getMembers(incStatic ? "both" : "instance", this);
                    },
                    enumerable: true
                });

                Object.defineProperty(__proto_st, "__getMembers", {value: function (type, instance) {
                        if (type === "static") {
                            return Object.keys(__proto_st);
                        } else if (type === "instance") {
                            return Object.keys(instance);
                        } else {
                            return {
                                static: Object.keys(__proto_st),
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
                Object.defineProperty(__proto, "__", {value: function (name, val, attributes, retType, noInstance) {
                        return __proto_st.__(name, val, attributes, retType, noInstance ? null : this);
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
                Object.defineProperty(__proto_st, "__", {value: function (name, val, attributes, retType, instance) {
                        /*if (val && name.indexOf("__") === 0 && name!=="__construct") {
                         throw new Error("Members that starts with __ can only be declared internally!");
                         }*/

                        return __(name, val, attributes, retType, instance, true);
                    },
                    enumerable: true
                });

                // private version
                function __ (name, val, attributes, retType, instance, isPubCall) {
                    var res;

                    if (typeof val !== "undefined") { // set                        
                        if (typeof attributes === "string")
                            attributes = attributes.split(" ");

                        // false if not specified, but if instance is not defined, it's forced to true
                        var isStatic = attributes ? attributes.indexOf("static") >= 0 : false;

                        if (__proto_st.__isStatic && !isStatic) {
                            throw new SyntaxError("You cannot add non-static members to a static class!");
                        }

                        var access = "public";
                        if (attributes) {
                            access = attributes.indexOf("protected") >= 0 ?
                                    "protected" :
                                    (attributes.indexOf("private") >= 0 ?
                                            "private" : access);
                        }

                        // false if not specified
                        var isFinal = attributes ? attributes.indexOf("final") >= 0 : false;

                        // if it's an instance variable, we've to delegate the definition to the constructor
                        if (!isStatic
                                && access === "private"
                                && !instance) {

                            if (access === "private") {
                                if (isPubCall)
                                    throw new Error("You cannot define a private member outside of Class!");

                                __pendingPvInst[name] = {"val": val, "attributes": attributes, "retType": retType};
                            }

                            return;
                        }

                        if (access === "public" || access == "protected") {
                            if (isStatic) {
                                obj = __proto_st;
                            } else if (typeof val === "function") {
                                obj = __proto;
                            } else {
                                obj = __proto;
                            }
                        } else if (isStatic) {
                            obj = __pvMembers.st;
                        } else {
                            obj = __pvMembers.inst[instance.__("__id")];
                        }

                        // store parent object to apply next
                        var old = obj[name];

                        if (old) {
                            if (isPubCall && access !== "public") {
                                throw new Error("You cannot define a private member outside of Class!");
                            }

                            // check for final members
                            var descr = Object.getOwnPropertyDescriptor(obj, name)
                                    || Object.getOwnPropertyDescriptor(obj.prototype, name);
                            if (descr && descr.set === undefined && descr.writable !== true) {
                                throw new SyntaxError("Final member cannot be overridden");
                            }
                        }

                        var scope = null;

                        var value = typeof val !== "function" ? val :
                                function () {
                                    if (!scope) {
                                        scope = {};


                                        scope.s = __proto_st.__scope === undefined ? __proto_st : __proto_st.__scope;

                                        scope._s = __pvMembers.st;

                                        scope._s.__scope = scope.s;

                                        // expose private variable to internal class function
                                        if (!isStatic) {
                                            scope.i = this.__scope === undefined ? this : this.__scope;

                                            // alternative this._i for traits
                                            scope._i = __pvMembers.inst[scope.i.__("__id")] || this._i;

                                            scope.__scope = scope._i.__scope = scope.i;
                                        } else {
                                            scope.__scope = scope.s;
                                        }

                                        // as scope for __super we pass the base class environment
                                        // TODO: however a check should be done when __super
                                        // calls a trait method since we need
                                        // current scope instead
                                        var sBind = isStatic ? __base : scope._i.__parent;
                                        Object.defineProperty(scope, "__super", {
                                            value: old ? old.bind(sBind) : null,
                                            writable: true,
                                            configurable: true,
                                            enumerable: true
                                        });

                                        // scope should be immutable
                                        //Object.freeze(scope);
                                    }

                                    if (retType) {
                                        var res = val.apply(scope, arguments);

                                        $.typeCompare(retType, res);

                                        return res;
                                    } else {
                                        return val.apply(scope, arguments);
                                    }
                                };

                        var descriptors = {
                            //__proto__: !isStatic ? obj.__proto__ : obj,
                            //configurable: attributes.indexOf("configurable"),
                            enumerable: access !== "protected"
                        };

                        if (access === "protected" || retType) {
                            descriptors.get = function () {
                                // check protected
                                if (access === "protected"
                                        && this.__scope === undefined
                                        && this.__pvFlag !== undefined && !this.__pvFlag) {
                                    throw new Error("Exception trying to retrieve a protected member");
                                }

                                if (typeof value !== "function" && retType)
                                    $.typeCompare(retType, value);

                                return value;
                            };

                            descriptors.set = function (newVal) {
                                if (isFinal)
                                    return;

                                // check protected

                                return value = newVal;
                            };
                        } else {
                            descriptors.value = value;
                            descriptors.writable = !isFinal;
                        }


                        res = Object.defineProperty(obj, name, descriptors);
                    } else { // get
                        if (!isPubCall) {
                            res = instance ? __pvMembers.inst[instance.__("__id")][name] : __pvMembers.st[name];
                        }

                        if (!res)
                            res = instance ? instance[name] : __proto_st[name];
                    }

                    return res;
                }
                ;

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
                                        && prop !== "prototype") {
                                    __(prop, source[prop], null, null, destination);
                                }
                            }
                        }

                        // traits
                        if (src instanceof Array) {
                            src.forEach(function (t) {
                                extend(dest, t);
                                extend(dest.prototype, t.prototype);
                            });
                        } else {
                            extend(dest, src);
                            extend(dest.prototype, src.prototype);
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

            function __Delegator () {
            }


            if (descriptor) {
                if (descriptor.type && typeof descriptor.type === "string")
                    descriptor.type = descriptor.type.split(" ");

                /*if (typeof descriptor.class === "string")
                 Hw2Core[descriptor.class] = Obj;*/

                if (descriptor.members)
                    Obj.__addMembers(descriptor.members, null, new __Delegator);

                if (descriptor.type) {
                    if (descriptor.type.indexOf("abstract") >= 0)
                        Object.defineProperty(Obj, "__isAbstract", {
                            value: true,
                            writable: false,
                            configurable: false,
                            enumerable: true
                        });

                    if (descriptor.type.indexOf("static") >= 0) {
                        Object.defineProperty(Obj, "__isStatic", {
                            value: true,
                            writable: false,
                            configurable: false,
                            enumerable: true
                        });
                    }

                    if (descriptor.type.indexOf("final") >= 0) {
                        Object.defineProperty(Obj, "__isFinal", {
                            value: true,
                            writable: false,
                            configurable: false,
                            enumerable: true
                        });

                        //Object.preventExtensions(Obj);
                        Object.seal(Obj);
                    }
                }
            }

            return Obj;
        }

        return _Class;
    }());
});
