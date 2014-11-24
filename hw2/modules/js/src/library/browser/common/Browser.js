/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
define([
    HW2PATH_CORE + 'modules/dep/jquery/index.js'
],
function () {
    $=Hw2Core;
    $.Browser = $.Class({type:"final"});
    
    // static initialization
    $.Browser.JQ=jQuery.noConflict(true);
    
    return $.Browser;
});