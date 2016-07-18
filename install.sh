#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
params="$@"

function add_repo() {
    url=$1
    name=$2
    branch=$3
    basedir=$4
    path=$DIR/$basedir/$name
    
    (git --git-dir=$path/.git/ rev-parse && git --git-dir=$path/.git/ pull origin $branch) || git clone $url/$name.git -b $branch $path 
	[ -f $DIR/$3/$1/install.sh ] && bash $path/install.sh $params
}

function add_file() {
    mkdir -p $2
    wget -nc $1 -P $2
}


#
# ADD DEPENDENCIES
#

add_repo "git@github.com:HW-Core/" "js-kernel" "master" "../"

mod_path="../js-modules/"
add_file "http://requirejs.org/docs/release/2.1.15/r.js" $mod_path"/requirejs/r/index.js"
add_file "http://requirejs.org/docs/release/2.1.15/minified/require.js" $mod_path"/requirejs/requirejs/index.js"
add_file "https://raw.githubusercontent.com/components/rsvp.js/d2740bfe52a3a3d63bb132d45490d3126bf0e065/rsvp.js" $mod_path"/rsvp/index.js"
add_file "https://raw.githubusercontent.com/Benvie/WeakMap/2693ff73a1650dc7b8beeeb6ce0eba79b53a66af/weakmap.js" $mod_path"/weakmap/index.js"

if [[ $1 == "dev" ]]; then
    add_repo "https://github.com/visionmedia/" "mocha" "1.20.1" $mod_path
    
    add_file "http://sinonjs.org/releases/sinon-1.10.3.js" $mod_path"/sinon/index.js"
    add_file "http://chaijs.com/chai.js" $mod_path"/chai/index.js"
fi


