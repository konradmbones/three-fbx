#!/bin/bash
for file in *.tif; do
  convert "$file" -resize 512x512 "${file%.tif}.jpg"
  # delete old tif file
  rm "$file"
done