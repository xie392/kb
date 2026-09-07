#!/bin/bash
set -e

DEPLOY_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$DEPLOY_DIR"
mkdir -p data

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
GITHUB_REPOSITORY="xie392/kb"
EOF
    chmod 600 .env
    echo "✅ 已创建 .env，初始账号: ${INIT_USERNAME}"
else
    echo "ℹ️ .env 已存在"
fi
chmod 600 .env

# 确保 GITHUB_REPOSITORY 在 .env 中存在（兼容旧部署）
if ! grep -q "^GITHUB_REPOSITORY=" .env; then
    echo 'GITHUB_REPOSITORY="xie392/kb"' >> .env
fi

# 加载 .env
set -a
. ./.env
set +a

export GITHUB_REPOSITORY IMAGE_TAG

echo "🔍 拉取镜像: m.daocloud.io/ghcr.io/${GITHUB_REPOSITORY}:${IMAGE_TAG:-latest}"
docker compose pull kb

echo "🚀 启动服务..."
docker compose up -d --remove-orphans
docker image prune -f

echo ""
echo "✅ 部署完成！"
echo "📝 查看日志：docker logs kb -f"
echo "🌐 访问地址：https://xie392.cn"
