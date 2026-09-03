#!/bin/bash
set -e

# 部署根目录（脚本所在目录是 repo，上级是部署根目录）
DEPLOY_DIR=$(cd "$(dirname "$0")/.." && pwd)
REPO_DIR="$DEPLOY_DIR/repo"

echo "📂 工作目录: $DEPLOY_DIR"
cd "$DEPLOY_DIR"
mkdir -p data

# 源码已经由 workflow 解压到 $REPO_DIR 了，直接进入构建

# 初始化 .env（仅首次）
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

# 加载 .env，保证构建参数（NEXT_PUBLIC_*）一定能取到值，不受引号写法影响
set -a
. ./.env
set +a

# 构建镜像（使用 BuildKit 缓存）
echo "🔨 开始构建镜像..."
# 小内存服务器构建前临时创建 2G swap，防止 OOM
SWAP_FILE="/swapfile"
NEED_CLOSE_SWAP=0
if [ ! -f "$SWAP_FILE" ] && [ $(free -g | awk '/^Mem:/{print $2}') -lt 4 ]; then
    echo "⚠️  检测到服务器内存小于4G，创建临时2G swap防止构建OOM..."
    fallocate -l 2G $SWAP_FILE || dd if=/dev/zero of=$SWAP_FILE bs=1M count=2048
    chmod 600 $SWAP_FILE
    mkswap $SWAP_FILE
    swapon $SWAP_FILE
    NEED_CLOSE_SWAP=1
fi

cd "$REPO_DIR"
DOCKER_BUILDKIT=1 docker build \
    --build-arg NEXT_PUBLIC_ADMIN_BASE_PATH="${NEXT_PUBLIC_ADMIN_BASE_PATH}" \
    --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
    -t kb:latest .

# 构建完关闭临时swap
if [ $NEED_CLOSE_SWAP -eq 1 ]; then
    swapoff $SWAP_FILE
    rm -f $SWAP_FILE
    echo "✅ 已清理临时swap"
fi

# 重启服务
echo "🚀 启动服务..."
cd "$DEPLOY_DIR"
docker compose up -d
docker image prune -f

echo ""
echo "✅ 部署完成！"
echo "📝 查看日志：docker logs kb -f"
echo "🌐 访问地址：https://xie392.cn"
