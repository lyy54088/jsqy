import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图标尺寸配置
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 创建简单的Canvas图标生成函数
function generateIcon(size) {
  const canvas = `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圆形 -->
  <circle cx="256" cy="256" r="240" fill="#3b82f6" stroke="#1e40af" stroke-width="8"/>
  
  <!-- 哑铃图标 -->
  <g transform="translate(256,256)">
    <!-- 左侧重量 -->
    <rect x="-120" y="-40" width="40" height="80" rx="8" fill="white"/>
    <rect x="-130" y="-30" width="20" height="60" rx="4" fill="white"/>
    <rect x="-140" y="-20" width="20" height="40" rx="4" fill="white"/>
    
    <!-- 右侧重量 -->
    <rect x="80" y="-40" width="40" height="80" rx="8" fill="white"/>
    <rect x="110" y="-30" width="20" height="60" rx="4" fill="white"/>
    <rect x="120" y="-20" width="20" height="40" rx="4" fill="white"/>
    
    <!-- 中间杠铃 -->
    <rect x="-80" y="-8" width="160" height="16" rx="8" fill="white"/>
    
    <!-- 握把纹理 -->
    <line x1="-40" y1="-6" x2="-40" y2="6" stroke="#3b82f6" stroke-width="2"/>
    <line x1="-20" y1="-6" x2="-20" y2="6" stroke="#3b82f6" stroke-width="2"/>
    <line x1="0" y1="-6" x2="0" y2="6" stroke="#3b82f6" stroke-width="2"/>
    <line x1="20" y1="-6" x2="20" y2="6" stroke="#3b82f6" stroke-width="2"/>
    <line x1="40" y1="-6" x2="40" y2="6" stroke="#3b82f6" stroke-width="2"/>
  </g>
  
  <!-- AI标识 -->
  <g transform="translate(256,350)">
    <rect x="-30" y="-15" width="60" height="30" rx="15" fill="white"/>
    <text x="0" y="5" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#3b82f6">AI</text>
  </g>
  
  <!-- 装饰性元素 -->
  <circle cx="150" cy="150" r="8" fill="white" opacity="0.7"/>
  <circle cx="362" cy="150" r="6" fill="white" opacity="0.5"/>
  <circle cx="150" cy="362" r="6" fill="white" opacity="0.5"/>
  <circle cx="362" cy="362" r="8" fill="white" opacity="0.7"/>
</svg>`;
  
  return canvas;
}

// 生成所有尺寸的图标
iconSizes.forEach(size => {
  const svgContent = generateIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(__dirname, 'public', 'icons', filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// 生成PNG版本的说明文件
const readmeContent = `# 图标文件说明

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

${iconSizes.map(size => `- icon-${size}x${size}.png`).join('\n')}

## 转换命令示例（如果安装了ImageMagick）

\`\`\`bash
${iconSizes.map(size => `magick icon.svg -resize ${size}x${size} icon-${size}x${size}.png`).join('\n')}
\`\`\`

转换完成后，请将PNG文件放在此目录中。
`;

fs.writeFileSync(path.join(__dirname, 'public', 'icons', 'README.md'), readmeContent);
console.log('Generated README.md with conversion instructions');
console.log('\n图标生成完成！请按照README.md中的说明转换为PNG格式。');