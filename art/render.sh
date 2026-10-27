#!/bin/sh
# Renders the liquid-chrome poster objects with Blender, then compresses them for the site.
#   sh art/render.sh [path/to/Blender]
set -e
BLENDER=${1:-/Applications/Blender.app/Contents/MacOS/Blender}
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
render() { # slug kind arg
  "$BLENDER" -b --factory-startup -P art/blender/chrome.py -- "$2" "$3" "$TMP/$1.png" 1200 1500 | grep '^rendered'
  node -e "require('sharp')(process.argv[1]).webp({ quality: 88, alphaQuality: 90 }).toFile(process.argv[2])" "$TMP/$1.png" "src/assets/posters/$1-chrome.webp"
}
render ezvenda text 'Rs'
render mini-havoc bean x
render gympaid text '31'
render photon-elixir-phoenix merge 9
render arthur-vibe text '?'
render bh-group text 'kW'
render not-found text '404'
render monogram text 'SM'
rm -rf "$TMP"
