import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建一个简单的PNG图标（使用Canvas API模拟）
// 由于环境限制，我们创建一个简化的图标数据
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 创建一个简单的PNG文件头和数据
function createSimplePNG(size) {
  // 这是一个简化的蓝色圆形PNG图标的base64数据
  // 实际项目中应该使用专业工具生成
  const canvas = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="url(#grad)" stroke="#1e40af" stroke-width="2"/>
  <g transform="translate(${size/2},${size/2}) scale(${size/512})">
    <!-- 哑铃图标 -->
    <rect x="-120" y="-40" width="40" height="80" rx="8" fill="white"/>
    <rect x="-130" y="-30" width="20" height="60" rx="4" fill="white"/>
    <rect x="-140" y="-20" width="20" height="40" rx="4" fill="white"/>
    <rect x="80" y="-40" width="40" height="80" rx="8" fill="white"/>
    <rect x="110" y="-30" width="20" height="60" rx="4" fill="white"/>
    <rect x="120" y="-20" width="20" height="40" rx="4" fill="white"/>
    <rect x="-80" y="-8" width="160" height="16" rx="8" fill="white"/>
    <!-- AI标识 -->
    <rect x="-30" y="70" width="60" height="30" rx="15" fill="white"/>
    <text x="0" y="90" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#3b82f6">AI</text>
  </g>
</svg>`;
  
  return canvas;
}

// 生成SVG文件作为PNG的替代
iconSizes.forEach(size => {
  const svgContent = createSimplePNG(size);
  const filename = `icon-${size}x${size}.png.svg`;
  const filepath = path.join(__dirname, 'public', 'icons', filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename} (SVG format as PNG placeholder)`);
});

// 创建一个脚本来复制SVG文件为PNG文件名
const copyScript = `
# 复制SVG文件为PNG文件名的脚本
# 在实际部署时，这些文件应该被真正的PNG文件替换

echo "Copying SVG files as PNG placeholders..."

${iconSizes.map(size => `cp "public/icons/icon-${size}x${size}.svg" "public/icons/icon-${size}x${size}.png"`).join('\n')}

echo "PNG placeholders created. Please replace with actual PNG files for production."
`;

fs.writeFileSync(path.join(__dirname, 'copy-icons.sh'), copyScript);

// 创建Windows批处理文件
const batchScript = `@echo off
echo Copying SVG files as PNG placeholders...

${iconSizes.map(size => `copy "public\\icons\\icon-${size}x${size}.svg" "public\\icons\\icon-${size}x${size}.png"`).join('\n')}

echo PNG placeholders created. Please replace with actual PNG files for production.
pause
`;

fs.writeFileSync(path.join(__dirname, 'copy-icons.bat'), batchScript);

console.log('\n图标占位文件生成完成！');
console.log('运行 copy-icons.bat 来创建PNG占位文件。');
console.log('在生产环境中，请使用真正的PNG图标文件。');