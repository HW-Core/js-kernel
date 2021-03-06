#!/usr/bin/env bash

PATH_MODULES="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../"
[ ! -d $PATH_MODULES/drassil/joiner ] && git clone https://github.com/drassil/joiner $PATH_MODULES/drassil/joiner -b master
source "$PATH_MODULES/drassil/joiner/joiner.sh"


#
# ADD DEPENDENCIES
#

mod_path="hw-core/js-modules/"

Joiner:add_file "http://requirejs.org/docs/release/2.1.15/r.js" $mod_path"/requirejs/r/index.js"
Joiner:add_file "http://requirejs.org/docs/release/2.1.15/minified/require.js" $mod_path"/requirejs/requirejs/index.js"
Joiner:add_file "https://raw.githubusercontent.com/components/rsvp.js/d2740bfe52a3a3d63bb132d45490d3126bf0e065/rsvp.js" $mod_path"/rsvp/index.js"
Joiner:add_file "https://raw.githubusercontent.com/Benvie/WeakMap/2693ff73a1650dc7b8beeeb6ce0eba79b53a66af/weakmap.js" $mod_path"/weakmap/index.js"

echo `Joiner:with_dev`

if Joiner:with_dev ; then
    Joiner:add_repo "https://github.com/mochajs/mocha" "mocha" "1.20.1" $mod_path
    
    Joiner:add_file "http://sinonjs.org/releases/sinon-1.10.3.js" $mod_path"/sinon/index.js"
    Joiner:add_file "http://chaijs.com/chai.js" $mod_path"/chai/index.js"

    Joiner:add_git_submodule "https://github.com/HW-Core/js-kernel.git" "js-kernel/tests" "tests" "hw-core"
    Joiner:add_git_submodule "https://github.com/HW-Core/js-kernel.git" "js-kernel/doc" "gh-pages" "hw-core"
fi


