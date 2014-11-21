/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

describe('Bootstrap', function () {
    describe('new', function () {
        it('should be created without error', function () {
            assert.typeOf(new Bootstrap(),"object", "is not an object");
        });
    });
});
