/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

hw2.define(function () {
    var $ = this;

    describe('Hw2Core', function () {
        describe('.I()', function () {
            it('should create the instance', function () {
                $.Core.I();
            });
        });

        describe('.delInstance(0)', function () {
            it('should delete the default instance', function () {
                $.Core.delInstance(0);
            });
        });

        describe('.I(done)', function () {
            it('should create the instance', function (done) {
                $.Core.I(done);
            });
        });

        describe('.I("myid",done)', function () {
            it('should create the instance', function (done) {
                $.Core.I("myid", done);
            });
        });

        describe('.delInstance("myid")', function () {
            it('should delete the myid instance', function () {
                $.Core.delInstance("myid");
            });
        });
    });
});
