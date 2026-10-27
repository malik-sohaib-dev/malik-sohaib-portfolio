#!/bin/sh
# Renders the grayscale poster scenes with Blender and compresses them for the site.
#   sh art/posters.sh [path/to/Blender]
set -e
BLENDER=${1:-/Applications/Blender.app/Contents/MacOS/Blender}
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
for pair in ezvenda:ezvenda mini-havoc:mini-havoc gympaid:gympaid photon:photon-elixir-phoenix vibe:arthur-vibe pvsmith:bh-group; do
  scene=${pair%%:*}
  slug=${pair#*:}
  "$BLENDER" -b --factory-startup -P art/blender/poster.py -- "$scene" "$TMP/$slug.png" 1200 1500 | grep '^rendered'
  node -e "require('sharp')(process.argv[1]).webp({ quality: 84 }).toFile(process.argv[2])" "$TMP/$slug.png" "src/assets/posters/$slug-art.webp"
done
rm -rf "$TMP"
