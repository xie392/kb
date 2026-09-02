#!/bin/bash
set -e

# 部署根目录（脚本所在目录）
DEPLOY_DIR=$(cd "$(dirname "$0")/.." && pwd)  # repo 里的脚本，根目录是上级
REPO_DIR="$DEPLOY_DIR/repo"

echo "📂 工作目录: $DEPLOY_DIR"
cd "$DEPLOY_DIR"
mkdir -p data

# 1. 检查 tipkit workspace 依赖（必须在 ../tipkit 目录）
if [ ! -d "$DEPLOY_DIR/tipkit/.git" ]; then
    echo "⚠️  未找到 $DEPLOY_DIR/tipkit 目录，尝试克隆（使用国内镜像加速）..."
    # 使用 ghproxy 加速 GitHub 克隆
    git clone --depth 1 https://ghproxy.com/https://github.com/xie392/tipkit.git "$DEPLOY_DIR/tipkit" || {
        echo "❌ 克隆 tipkit 失败，请手动将 tipkit 仓库放到 $DEPLOY_DIR/tipkit 目录"
        exit 1
    }
else
    echo "✅ 找到 tipkit 依赖"
fi

# 源码已经由 workflow 解压到 $REPO_DIR 了，直接进入构建
cd "$REPO_DIR"

# 2. 初始化 .env（仅首次）
cd "$DEPLOY_DIR"
if [ ! -f .env ]; then
    if [ -z "$ADMIN_BASE_PATH" ] || [ -z "$SITE_URL" ] || [ -z "$INIT_USERNAME" ] || [ -z "$INIT_PASSWORD" ]; then
        echo "❌ 首次部署需要设置环境变量：ADMIN_BASE_PATH SITE_URL INIT_USERNAME INIT_PASSWORD"
        exit 1
    fi
    SECRET=$(openssl rand -base64 32)
    cat > .env <<EOF
AUTH_SECRET="${SECRET}"
DATABASE_URL="file:/data/dev.db"
ATTACHMENT_STORAGE_DIR="/data/attachments"
BACKUP_DIR="/data/backups"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_ADMIN_BASE_PATH="${ADMIN_BASE_PATH}"
NEXT_PUBLIC_SITE_URL="${SITE_URL}"
INIT_USERNAME="${INIT_USERNAME}"
INIT_PASSWORD="${INIT_PASSWORD}"
EOF
    chmod 600 .env
    echo "✅ 已创建 .env，初始账号: ${INIT_USERNAME}"
else
    echo "ℹ️ .env 已存在"
fi
chmod 600 .env

# 3. 构建镜像（使用 BuildKit 缓存）
echo "🔨 开始构建镜像..."
cd "$REPO_DIR"
DOCKER_BUILDKIT=1 docker build \
    --build-arg NEXT_PUBLIC_ADMIN_BASE_PATH="${ADMIN_BASE_PATH:-$(grep NEXT_PUBLIC_ADMIN_BASE_PATH "$DEPLOY_DIR/.env" | cut -d'"' -f2)}" \
    --build-arg NEXT_PUBLIC_SITE_URL="${SITE_URL:-$(grep NEXT_PUBLIC_SITE_URL "$DEPLOY_DIR/.env" | cut -d'"' -f2)}" \
    -t kb:latest .

# 4. 重启服务
echo "🚀 启动服务..."
cd "$DEPLOY_DIR"
docker compose up -d
docker image prune -f

echo ""
echo "✅ 部署完成！"
echo "📝 查看日志：docker logs kb -f"
echo "🌐 访问地址：https://xie392.cn"
