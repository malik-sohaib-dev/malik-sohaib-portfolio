#!/bin/sh
# Renders a seamless 3-second loop of each poster scene and encodes it for the web.
#   sh art/loops.sh [path/to/Blender]   -> public/media/loops/<slug>.webm and .mp4
set -e
BLENDER=${1:-/Applications/Blender.app/Contents/MacOS/Blender}
FFMPEG=${FFMPEG:-ffmpeg}
cd "$(dirname "$0")/.."
mkdir -p public/media/loops art/out/loops
for pair in p-ezvenda:ezvenda p-havoc:mini-havoc p-gympaid:gympaid photon:photon-elixir-phoenix p-vibe:arthur-vibe p-solar:bh-group; do
  scene=${pair%%:*}
  slug=${pair#*:}
  rm -f art/out/loops/"$slug"_*.png
  "$BLENDER" -b --factory-startup -P art/blender/poster.py -- "$scene" "art/out/loops/$slug" 720 900 72 | grep '^rendered'
  "$FFMPEG" -v error -y -framerate 24 -i "art/out/loops/${slug}_%04d.png" -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -pix_fmt yuv420p -an "public/media/loops/$slug.webm"
  "$FFMPEG" -v error -y -framerate 24 -i "art/out/loops/${slug}_%04d.png" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an "public/media/loops/$slug.mp4"
done
ls -la public/media/loops
