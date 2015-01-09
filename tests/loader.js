/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

hw2.defTests(function () {
    var $ = this;

    describe('Loader', function () {
        var loader = new $.Loader();

        describe('new', function () {
            it('should be created without error', function () {
                assert.typeOf(loader, "object", "is not an object");
            });
        });

        describe('load', function () {
            it('async load with promise', function (done) {
                $.Loader.load("tests/DummyJsFile").then(function (D) {
                    assert.ok(D.hello()==="hello");
                    done();
                });
            });
            it('async load with callback', function (done) {
                $.Loader.load("tests/DummyJsFile2.js", function (D) {
                    assert.ok(D.hello()==="hello");
                    done();
                });
            });

            it('sync load', function (done) {
                $.Loader.load("tests/DummyJsFile.js", function () {
                    var loaded = $.Loader.loadSync("tests/DummyJsFile.js");
                    if (loaded) {
                        done();
                    }
                });
            });

            if ($.const.IN_BROWSER) {
                it('sync load raw', function () {
                    var loaded = $.Loader.loadSync("tests/DummyJsFile.js", {rawScript: true});
                    assert.ok(loaded === "tests/DummyJsFile.js");
                });
            }
        });
    });
});