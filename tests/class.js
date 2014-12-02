/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

hw2.define(function () {
    $ = this;

    describe('Class', function () {
        // CREATE A FINAL CLASS
        var FinalCl = $.Class({type: "final", members: [
                {
                    name: "test",
                    val: function () {
                        return "t";
                    }
                },
                {
                    name: "test2",
                    val: function () {
                        return "t2";
                    }
                },
                {
                    name: "test3",
                    val: function () {
                        return "t3";
                    }
                }
            ]});

        var Trait = $.Class({type: "final", members: [
                {
                    name: "__construct",
                    val: function () {
                        //return this.__super();
                    },
                    attributes: "protected"
                },
                {
                    name: "getInstance",
                    val: function () {
                        return new this._s.self();
                    },
                    attributes: "public static"
                },
                {
                    name: "test2",
                    val: function () {
                        return "t2-trait+" + this._i.privVar;
                    }
                }
            ]});

        // CREATE AN ABSTRACT CLASS
        var AbstractCl = $.Class({
            type: "abstract",
            members: [
                {
                    name: "abstractPrivVal",
                    val: "a private value",
                    attributes: "private"
                },
                {
                    name: "getAbsPrivVal",
                    val: function () {
                        return this._i.abstractPrivVal;
                    },
                    attributes: "public"
                },
                {
                    name: "privMethod",
                    val: function () {
                        return "privMethod";
                    },
                    attributes: "private"
                },
                {
                    name: "test1",
                    val: function () {
                        return "t1";
                    },
                    attributes: "protected"
                },
                {
                    name: "test5",
                    val: function () {
                        return "t4";
                    }
                }
            ]
        });

        // CREATE A FULL CLASS
        var FullCl = $.Class({base: AbstractCl, use: [FinalCl, Trait], members: [
                {
                    name: "__construct",
                    val: function () {
                        //return this.__super();
                    },
                    attributes: "public"
                },
                {
                    name: "privMethod",
                    val: function () {
                        return "it's private";
                    },
                    attributes: "private"
                },
                {
                    name: "privStaticMethod",
                    val: function () {
                        return "it's private and static";
                    },
                    attributes: "static private"
                },
                {
                    name: "privVar",
                    val: true,
                    attributes: "private"
                },
                {
                    // overwrite FinalCl class method
                    name: "test3",
                    val: function () {
                        return this._i.privMethod();
                    }
                },
                {
                    name: "test4",
                    val: function () {
                        return this._s.privStaticMethod();
                    },
                    retType: "string"
                },
                {
                    name: "test5",
                    val: function () {
                        return this.__super();//this.__s.privStaticMethod() + this.pub_i.test3();
                    },
                    attributes: "public"
                }
            ]
        });


        // CREATE AN EMPTY CLASS
        var EmptyCl = $.Class();

        /*
         * Create some classes using c-like style
         * 
         */
        var StClass = $.static.class([
            // short declaration with single member
            $.public.static("test2", function () {
                return this._s.foo();
            }),
            $.public.static.final({
                hello: "world",
                how: $.typeHint(String, "how"),
                test: function () {
                    return this._s.foo();
                }
            }),
            $.private.static({
                foo: function () {
                    return "hey";
                },
                bar: function () {
                    return "wow";
                }
            })
        ]);

        var StyledCl = $.public.class([
            $.protected({
                "Number x": undefined,
                "Number y": undefined,
            }),
            $.public("__construct", function (x, y) {
                this.i.x = x;
                this.i.y = y;
            }),
            $.public.final(Number, "add", function () {
                return this.i.x + this.i.y;
            })
        ]);

        // RUN TESTS

        describe('constructor', function () {
            it('should create the instance', function () {
                assert.typeOf(new EmptyCl(), "object", "Class not created");
                assert.typeOf(new FinalCl(), "object", "Class not created");
            });
        });

        describe('abstract constructor', function () {
            it('abstract class should not be instantiated', function () {
                assert.throw(function () {
                    new AbstractCl()
                }, Error, "Abstract class may not be constructed");
            });
        });

        describe('final', function () {
            it('final class cannot be extended', function () {
                assert.throw(function () {
                    var c = $.Class({base: FinalCl});
                    new c;
                }, Error, "final class cannot be extended!");
            });

            it('final class cannot be dynamically changed', function () {
                assert.throw(function () {
                    var f = new FinalCl();
                    f.newMethod = function () {
                        alert("created")
                    };
                    f.newMethod();
                }, Error);
            });
        });

        describe('extend abstract', function () {
            it('abstract class must be extended', function () {
                var c = $.Class({base: AbstractCl, members: [
                        {
                            // overwrite AbstractCl class method
                            name: "test1",
                            val: function () {
                                return this.__super() + "t1plus";
                            },
                            attributes: "public"
                        }
                    ]});
                c = new c();
                assert.ok(c.getAbsPrivVal() === "a private value", "get method returns abstract value");
                assert.ok(c.test1() === "t1t1plus", "test method returns t1t1plus calling __super");
                assert.instanceOf(c, AbstractCl, 'class is an instance of AbstractCl');
            });
        });

        describe('instantiate FullCl', function () {
            it('should be created successfully', function () {
                var c = new FullCl();
                assert.throw(function () {
                    c.__("extPriv",function(){ console.log("this is a private method declared externally"); },["private"]);
                }, Error, "You cannot define a private/protected member outside of Class!");
                assert.instanceOf(c, AbstractCl, "FullCl is an instance of AbstractCl");
                assert.notInstanceOf(c, FinalCl, "FullCl isn't an instance of FinalCl");
                assert.ok(c.test2() === "t2-trait+true", "Trait.test2 should override Final.test2 because of LIFO ordering");
            });
        });

        describe('private members', function () {
            it('private members shouldn\'t be visible', function () {
                var c = new FullCl();
                assert.ok(c.test3() === "it's private", "private var should be accessible from internal");
                assert.ok(c.test4() === "it's private and static", "private static var should be accessible from internal");
                assert.typeOf(c.privMethod, "undefined", "private method must be undefined");
                assert.typeOf(c.privVar, "undefined", "private member must be undefined");
                assert.typeOf(c._s, "undefined", "private __s accessor must be undefined");
            });
        });

        describe('restrictive constructors', function () {
            it('private constructor', function () {
                assert.throw(function () {
                    new Trait()
                }, Error, "Exception trying to retrieve a protected member");
                assert.instanceOf(Trait.getInstance(), Trait, "getInstance should return an instance of Trait");
            });
        });


        describe('destruct', function () {
            it('should destruct instance without errors', function () {
                var c = new FullCl();
                c.__destruct(); // assignment is required on production: c=c.__destruct();
                assert.typeOf(c.__isClass, "undefined", "all methods should be deleted");
            });
        });

        describe('styled class', function () {
            it('should instantiate and call methods without errors', function () {
                assert.ok(new StyledCl(3, 4).add() === 7, "should return 7");
            });
        });

        describe('styled static class', function () {
            it('shouldn\'t be instantiated but can call methods without errors', function () {
                assert.throw(function () {
                    new StClass();
                }, Error, "Static class may not be instantiated");
                assert.ok(StClass.test() === "hey", "should return hello");
            });
        });

        describe('test friendly-style class of documentation', function () {
            it("we shouldn't have any exception in declaration, definition and instantiation", function () {
                // classes from documentation
                var LastName = $.public.final.class([
                    // short-style using args instead of object when only 
                    // one method is going to be defined

                    $.private("lastName", "Bar"),
                    // if you have multiple members with same accessors
                    // you can define them passing an object

                    $.public({
                        getLastName: function () {
                            return this.i.lastName;
                        },
                        setLastName: function (lName) {
                            this.i.lastName = lName;
                        }
                    })
                ]);

                var FirstName = $.public.abstract.class([
                    $.protected({firstName: "Foo"}), // it is visible from this class and its childs


                    $.public("getFirstName", function () {
                        return this.i.firstName;
                    })
                ]);
                
                
                // use LastName class as a "trait" and extends FirstName
                var MyName = $.public.final.class.extends(FirstName).use(LastName)([
                    //$.private("lastName", "Bar"),
                    
                    // multiple member declaration under same public accessor ( C/C++ style )
                    $.public({
                        __construct: function (firstName, lastName, nickName) {
                            this.i.firstName = firstName;
                            this.i.setLastName(lastName);
                            this._s.nickName = nickName;
                        },
                        // override method of "FirstName" class to add nickname too
                        getFirstName: function () {
                            // use magic "__super" to access parent method
                            return this.__super() + " ( " + this._s.nickName + " )";
                        }
                    }),
                    
                    // override method of "LastName" trait
                    $.public("getLastName", function () {
                        return "My last name is: " + this.i.lastName;
                    }),
                    
                    // it's the type-hinting , you can force data-type for this var
                    $.private.static("nickName", $.typeHint("string", "baz")),
                    
                    // Another way to define type-hint, compatible with multiple members declaration
                    $.protected.final({"Date birthDay": new Date('December 17,1990 03:24:00')}),
                    
                    // Yet Another way to define type-hint using parameters ( only for single-member declaration)
                    $.public.static(String, "getNickName", function () {
                        return this._s.nickName;
                    })
                ]);

                var myName = new MyName("Hello", "World", "I'm a Class");

                var myFirstName = myName.getFirstName();

                assert.ok(myFirstName === "Hello ( I'm a Class )", "it's not a class!");
                console.log(myName.getLastName());
            });
        });
    });

});