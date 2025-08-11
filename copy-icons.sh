
# 复制SVG文件为PNG文件名的脚本
# 在实际部署时，这些文件应该被真正的PNG文件替换

echo "Copying SVG files as PNG placeholders..."

cp "public/icons/icon-72x72.svg" "public/icons/icon-72x72.png"
cp "public/icons/icon-96x96.svg" "public/icons/icon-96x96.png"
cp "public/icons/icon-128x128.svg" "public/icons/icon-128x128.png"
cp "public/icons/icon-144x144.svg" "public/icons/icon-144x144.png"
cp "public/icons/icon-152x152.svg" "public/icons/icon-152x152.png"
cp "public/icons/icon-192x192.svg" "public/icons/icon-192x192.png"
cp "public/icons/icon-384x384.svg" "public/icons/icon-384x384.png"
cp "public/icons/icon-512x512.svg" "public/icons/icon-512x512.png"

echo "PNG placeholders created. Please replace with actual PNG files for production."
