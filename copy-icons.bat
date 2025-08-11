@echo off
echo Copying SVG files as PNG placeholders...

copy "public\icons\icon-72x72.svg" "public\icons\icon-72x72.png"
copy "public\icons\icon-96x96.svg" "public\icons\icon-96x96.png"
copy "public\icons\icon-128x128.svg" "public\icons\icon-128x128.png"
copy "public\icons\icon-144x144.svg" "public\icons\icon-144x144.png"
copy "public\icons\icon-152x152.svg" "public\icons\icon-152x152.png"
copy "public\icons\icon-192x192.svg" "public\icons\icon-192x192.png"
copy "public\icons\icon-384x384.svg" "public\icons\icon-384x384.png"
copy "public\icons\icon-512x512.svg" "public\icons\icon-512x512.png"

echo PNG placeholders created. Please replace with actual PNG files for production.
pause
