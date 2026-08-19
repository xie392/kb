# base 镜像走 DaoCloud 加速（国内 docker.io 拉取慢/不稳定）
# 本地构建想用原镜像：docker build --build-arg NODE_IMAGE=node:22-slim ...
ARG NODE_IMAGE=docker.m.daocloud.io/library/node:22-slim
FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
# 国内服务器构建加速：apt 走阿里云镜像，npm 走淘宝镜像
# 本地构建想关掉：docker build --build-arg APT_MIRROR= --build-arg NPM_MIRROR= ...
ARG APT_MIRROR=mirrors.aliyun.com
ARG NPM_MIRROR=https://registry.npmmirror.com
ENV npm_config_registry=${NPM_MIRROR} \
    COREPACK_NPM_REGISTRY=${NPM_MIRROR}
RUN if [ -n "$APT_MIRROR" ]; then \
        find /etc/apt -type f \( -name '*.list' -o -name '*.sources' \) \
            -exec sed -i "s|deb.debian.org|$APT_MIRROR|g" {} +; \
    fi \
    && apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_ADMIN_BASE_PATH
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ADMIN_BASE_PATH=$NEXT_PUBLIC_ADMIN_BASE_PATH \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN pnpm exec prisma generate
ARG DATABASE_URL=file:/tmp/ci.db
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm exec prisma migrate deploy
RUN pnpm build

# 移除 devDependencies（typescript/@types 等），只保留运行时必需的生产依赖
RUN pnpm prune --prod

FROM ${NODE_IMAGE} AS runner
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH" NODE_ENV=production PORT=3000
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
COPY --from=build /app ./

# 删除构建缓存，减小镜像体积
RUN rm -rf .next/cache node_modules/.cache

RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3000
# 启动时：应用迁移 → 创建默认管理员(幂等) → 启动服务
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run db:seed && pnpm start"]
