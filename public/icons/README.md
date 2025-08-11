# 图标文件说明

本目录包含了PWA应用所需的各种尺寸图标文件。

## SVG图标
- icon.svg - 主图标文件
- icon-{size}x{size}.svg - 各种尺寸的SVG图标

## 使用说明

由于当前环境限制，PNG图标需要手动转换。您可以：

1. 使用在线SVG转PNG工具（如 https://convertio.co/svg-png/）
2. 使用设计软件（如Figma、Sketch、Photoshop）
3. 使用命令行工具（如ImageMagick）

## 需要的PNG尺寸

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 转换命令示例（如果安装了ImageMagick）

```bash
magick icon.svg -resize 72x72 icon-72x72.png
magick icon.svg -resize 96x96 icon-96x96.png
magick icon.svg -resize 128x128 icon-128x128.png
magick icon.svg -resize 144x144 icon-144x144.png
magick icon.svg -resize 152x152 icon-152x152.png
magick icon.svg -resize 192x192 icon-192x192.png
magick icon.svg -resize 384x384 icon-384x384.png
magick icon.svg -resize 512x512 icon-512x512.png
```

转换完成后，请将PNG文件放在此目录中。
