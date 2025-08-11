#!/bin/bash

# 健身教练应用后端服务部署脚本
# 使用方法: ./scripts/deploy.sh [environment]
# 环境选项: development, staging, production

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
ENVIRONMENT=${1:-development}

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log_error "无效的环境参数: $ENVIRONMENT"
    log_info "使用方法: $0 [development|staging|production]"
    exit 1
fi

log_info "开始部署到 $ENVIRONMENT 环境..."

# 检查必要的工具
check_dependencies() {
    log_info "检查依赖工具..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装或不在 PATH 中"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装或不在 PATH 中"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 检查环境变量
check_env_vars() {
    log_info "检查环境变量..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -z "$JWT_SECRET" ]; then
            log_error "生产环境必须设置 JWT_SECRET 环境变量"
            exit 1
        fi
        
        # AI服务配置为可选
        if [ -z "$AI_API_KEY" ]; then
            log_warning "未设置 AI_API_KEY，AI功能将不可用"
        fi
        
        if [ -z "$MONGO_ROOT_PASSWORD" ]; then
            log_warning "未设置 MONGO_ROOT_PASSWORD，将使用默认密码"
        fi
    fi
    
    log_success "环境变量检查完成"
}

# 构建镜像
build_images() {
    log_info "构建 Docker 镜像..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        docker-compose build app-dev
    else
        docker-compose build app
    fi
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    case $ENVIRONMENT in
        development)
            docker-compose --profile development up -d
            ;;
        staging)
            docker-compose up -d app mongodb redis
            ;;
        production)
            docker-compose --profile production up -d
            ;;
    esac
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    # 等待 MongoDB
    log_info "等待 MongoDB 启动..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
            log_success "MongoDB 已就绪"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "MongoDB 启动超时"
        exit 1
    fi
    
    # 等待应用服务
    log_info "等待应用服务启动..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "应用服务已就绪"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "应用服务启动超时"
        exit 1
    fi
}

# 运行健康检查
health_check() {
    log_info "运行健康检查..."
    
    # 检查应用健康状态
    response=$(curl -s http://localhost:3000/health)
    if echo "$response" | grep -q '"status":"ok"'; then
        log_success "应用健康检查通过"
    else
        log_error "应用健康检查失败"
        log_error "响应: $response"
        exit 1
    fi
    
    # 检查数据库连接
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo
    log_info "服务信息:"
    echo "  - 环境: $ENVIRONMENT"
    echo "  - 应用地址: http://localhost:3000"
    echo "  - 健康检查: http://localhost:3000/health"
    echo "  - API 文档: http://localhost:3000/api-docs"
    echo
    log_info "管理命令:"
    echo "  - 查看日志: docker-compose logs -f app"
    echo "  - 停止服务: docker-compose down"
    echo "  - 重启服务: docker-compose restart"
    echo
    log_info "数据库信息:"
    echo "  - MongoDB 端口: 27017"
    echo "  - Redis 端口: 6379"
    echo
}

# 清理函数
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "部署失败，正在清理..."
        docker-compose down
    fi
}

# 设置清理陷阱
trap cleanup EXIT

# 主执行流程
main() {
    log_info "开始部署健身教练应用后端服务"
    log_info "目标环境: $ENVIRONMENT"
    echo
    
    check_dependencies
    check_env_vars
    build_images
    start_services
    wait_for_services
    health_check
    show_deployment_info
    
    log_success "部署成功完成！"
}

# 执行主函数
main