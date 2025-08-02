#!/bin/bash

# 健身教练应用后端服务快速启动脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🏋️  健身教练应用后端服务${NC}"
echo -e "${BLUE}================================${NC}"
echo

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 创建环境变量文件...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ 已创建 .env 文件，请根据需要修改配置${NC}"
fi

# 选择启动模式
echo -e "${BLUE}请选择启动模式:${NC}"
echo "1) 开发模式 (development)"
echo "2) 生产模式 (production)"
echo
read -p "请输入选择 (1-2): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 启动开发环境...${NC}"
        docker-compose --profile development up -d
        ;;
    2)
        echo -e "${BLUE}🚀 启动生产环境...${NC}"
        docker-compose up -d
        ;;
    *)
        echo -e "${YELLOW}无效选择，默认启动开发环境${NC}"
        docker-compose --profile development up -d
        ;;
esac

echo
echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
if curl -f http://localhost:3000/health &> /dev/null; then
    echo -e "${GREEN}✅ 服务启动成功！${NC}"
    echo
    echo -e "${BLUE}📋 服务信息:${NC}"
    echo "  🌐 应用地址: http://localhost:3000"
    echo "  ❤️  健康检查: http://localhost:3000/health"
    echo "  📚 API 文档: http://localhost:3000/api-docs"
    echo
    echo -e "${BLUE}🔧 管理命令:${NC}"
    echo "  📊 查看日志: docker-compose logs -f"
    echo "  🛑 停止服务: docker-compose down"
    echo "  🔄 重启服务: docker-compose restart"
    echo
else
    echo -e "${YELLOW}⚠️  服务可能还在启动中，请稍后访问 http://localhost:3000/health 检查状态${NC}"
fi