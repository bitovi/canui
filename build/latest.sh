#!/bin/sh

# Makes the latest build and pushed it go gh-pages
FOLDER=canui-gh-pages
./js canui/build/make.js
git clone git@github.com:jupiterjs/canui.git $FOLDER
cd $FOLDER
git checkout gh-pages
mkdir -p release/latest/.
cp ../canui/dist/canui.js release/latest/.
git add . --all
git commit -m "Updating latest release"
git push git@github.com:jupiterjs/canui.git gh-pages
cd ..
rm -rf canui-gh-pages