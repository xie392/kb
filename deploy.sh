#!/bin/bash
set -e

# 部署根目录（脚本所在目录）
DEPLOY_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$DEPLOY_DIR"

# 配置
REPO_DIR="$DEPLOY_DIR/repo"
KB_REPO="https://github.com/xie392/kb.git"
TIPKIT_REPO="https://github.com/xie392/tipkit.git"  # 如果 tipkit 是私库改这里或者提前配置好 git credential
BRANCH="master"

echo "📂 工作目录: $DEPLOY_DIR"
mkdir -p data

# 1. 检查/克隆 tipkit 依赖（workspace 依赖 ../tipkit）
if [ ! -d "$DEPLOY_DIR/tipkit/.git" ]; then
    rm -rf "$DEPLOY_DIR/tipkit"
    echo "🔍 未找到 tipkit 仓库，开始克隆..."
    git clone --depth 1 "$TIPKIT_REPO" "$DEPLOY_DIR/tipkit"
else
    echo "🔄 更新 tipkit..."
    cd "$DEPLOY_DIR/tipkit"
    git pull origin main
fi

# 2. 检查/克隆 kb 仓库
if [ ! -d "$REPO_DIR/.git" ]; then
    rm -rf "$REPO_DIR"
    echo "🔍 未找到 kb 仓库，开始克隆..."
    git clone --depth 1 -b "$BRANCH" "$KB_REPO" "$REPO_DIR"
else
    echo "🔄 更新 kb 代码..."
    cd "$REPO_DIR"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
fi

cd "$REPO_DIR"

# 3. 初始化 .env（仅首次）
cd "$DEPLOY_DIR"
if [ ! -f .env ]; then
    if [ -z "$ADMIN_BASE_PATH" ] || [ -z "$SITE_URL" ] || [ -z "$INIT_USERNAME" ] || [ -z "$INIT_PASSWORD" ]; then
        echo "❌ 首次部署需要设置环境变量：ADMIN_BASE_PATH SITE_URL INIT_USERNAME INIT_PASSWORD"
        echo "示例：ADMIN_BASE_PATH=/xxx SITE_URL=https://xie392.cn INIT_USERNAME=admin INIT_PASSWORD=xxx ./deploy.sh"
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

# 4. 构建镜像（使用 BuildKit 缓存）
echo "🔨 开始构建镜像..."
cd "$REPO_DIR"
DOCKER_BUILDKIT=1 docker build \
    --build-arg NEXT_PUBLIC_ADMIN_BASE_PATH="${ADMIN_BASE_PATH:-$(grep NEXT_PUBLIC_ADMIN_BASE_PATH "$DEPLOY_DIR/.env" | cut -d'"' -f2)}" \
    --build-arg NEXT_PUBLIC_SITE_URL="${SITE_URL:-$(grep NEXT_PUBLIC_SITE_URL "$DEPLOY_DIR/.env" | cut -d'"' -f2)}" \
    -t kb:latest .

# 5. 重启服务
echo "🚀 启动服务..."
cd "$DEPLOY_DIR"
docker compose up -d
docker image prune -f

echo ""
echo "✅ 部署完成！"
echo "📝 查看日志：docker logs kb -f"
echo "🌐 访问地址：https://xie392.cn"
