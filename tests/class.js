/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

describe('Class', function () {
    var EmptyCl = Hw2Core.Class();
    var FinalCl = Hw2Core.Class({type: "final", members: [
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
    var AbstractCl = Hw2Core.Class({
        type: "abstract",
        members: [
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
                }
            }
        ]
    });

    var FullCl = Hw2Core.Class({base: AbstractCl, use: FinalCl, members: [
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
                    return this.privMethod();
                }
            },
            {
                name: "test4",
                val: function () {
                    return this.__st.privStaticMethod();
                }
            }
        ]
    });

    describe('constructor', function () {
        it('should create the instance', function () {
            assert.typeOf(new EmptyCl(), "object", "Class not created");
        });
    });

    describe('abstract constructor', function () {
        it('abstract class should not be instantiated', function () {
            assert.throw(function () {
                new AbstractCl()
            }, Error, "Abstract class may not be constructed");
        });
    });

    describe('extend final', function () {
        it('final class cannot be extended', function () {
            assert.throw(function () {
                var c = Hw2Core.Class({base: FinalCl});
                new c;
            }, Error, "final class cannot be extended!");
        });
    });

    describe('extend abstract', function () {
        it('abstract class must be extended', function () {
            var c = Hw2Core.Class({base: AbstractCl, members : [
                {
                    // overwrite AbstractCl class method
                    name: "test1",
                    val: function () {
                        return this.__super()+"t1plus";
                    }
                }
            ]});
            c = new c();
            assert.ok(c.test1()==="t1t1plus", "test method returns t1t1plus calling __super");
            assert.instanceOf(c, AbstractCl, 'class is an instance of AbstractCl');
        });
    });
    
    describe('instantiate FullCl', function () {
        it('should be created successfully', function () {
            var c = new FullCl();
            assert.instanceOf(c, AbstractCl, "FullCl is an instance of AbstractCl");
            assert.notInstanceOf(c, FinalCl, "FullCl isn't an instance of FinalCl");
        });
    });

    describe('private members', function () {
        it('private members shouldn\'t be visible', function () {
            var c = new FullCl();
            assert.typeOf(c.privMethod, "undefined", "private method must be undefined");
            assert.typeOf(c.privVar, "undefined", "private member must be undefined");
            assert.ok(c.test3()==="it's private", "private var should be accessible from internal");
            assert.ok(c.test4()==="it's private and static", "private static var should be accessible from internal");
        });
    });
});
