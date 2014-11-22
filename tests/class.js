/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

describe('Class', function () {
    var cl = Hw2Core.Class();
    var finalCl = Hw2Core.Class({type: "final"});
    var abstractCl = Hw2Core.Class({
        type: "abstract",
        members: [
            {
                name : "test",
                val : function() {
                    return true;
                }
            }
        ]
    });

    describe('constructor', function () {
        it('should create the instance', function () {
            assert.typeOf(new cl(), "object", "Class not created");
        });
    });

    describe('abstract constructor', function () {
        it('abstract class should not be instantiated', function () {
            assert.throw(function () {
                new abstractCl()
            }, Error, "Abstract class may not be constructed");
        });
    });
    
    describe('extend final', function () {
        it('final class cannot be extended', function () {
            assert.throw(function () {
                var c= Hw2Core.Class({base:finalCl});
                new c;
            }, Error, "final class cannot be extended!");
        });
    });
    
    describe('extend abstract', function () {
        it('abstract class must be extended', function () {
            var c= Hw2Core.Class({base:abstractCl});
            c=new c();
            assert.ok(c.test(),"test method returns true");
        });
    });
    
    
    describe('private members', function () {
        it('private members shouldn\'t be visible', function () {
            var c= Hw2Core.Class({members:[
                    {
                        name : "privMethod",
                        val : function() {
                            return true;
                        },
                        attributes: "private"
                    },
                    {
                        name : "privVar",
                        val : true,
                        attributes: "private"
                    }
            ]});
            c=new c();
            
            assert.typeOf(c.privMethod,"undefined","private method must be undefined");
            assert.typeOf(c.privVar,"undefined","private member must be undefined");
        });
    });
});
