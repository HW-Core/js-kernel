/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

describe('Loader', function () {
    var loader = new Hw2Core.Loader();

    describe('new', function () {
        it('should be created without error', function () {
            assert.typeOf(loader, "object", "is not an object");
        });
    });

    describe('load', function () {
        it('async load ok', function (done) {
            loader.load("tests/DummyJsFile", function() { done() });
        });
    });
});
