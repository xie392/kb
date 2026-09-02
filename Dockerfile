# syntax=docker/dockerfile:1.7
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
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    if [ -n "$APT_MIRROR" ]; then \
        find /etc/apt -type f \( -name '*.list' -o -name '*.sources' \) \
            -exec sed -i "s|deb.debian.org|$APT_MIRROR|g" {} +; \
    fi \
    && apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS build
WORKDIR /app

# 先复制依赖配置文件，这层不常变，优先缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

# 利用 BuildKit 缓存挂载 pnpm store，只在 lock 文件变化时重新安装依赖
RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile --prefer-offline --network-concurrency=10

# 再复制源代码（常变层，依赖层缓存可复用）
COPY . .

ARG NEXT_PUBLIC_ADMIN_BASE_PATH
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ADMIN_BASE_PATH=$NEXT_PUBLIC_ADMIN_BASE_PATH \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Next.js 构建缓存挂载，增量构建不用每次全量编译
RUN --mount=type=cache,target=/app/.next/cache,sharing=locked \
    pnpm build

# 移除 devDependencies（typescript/@types 等），只保留运行时必需的生产依赖
RUN pnpm prune --prod

FROM ${NODE_IMAGE} AS runner
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH" NODE_ENV=production PORT=3000
ARG APT_MIRROR=mirrors.aliyun.com
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    if [ -n "$APT_MIRROR" ]; then \
        find /etc/apt -type f \( -name '*.list' -o -name '*.sources' \) \
            -exec sed -i "s|deb.debian.org|$APT_MIRROR|g" {} +; \
    fi \
    && apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
COPY --from=build /app ./

# 删除构建缓存，减小镜像体积
RUN rm -rf .next/cache node_modules/.cache

RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3000
# 启动时：应用迁移 → 创建默认管理员(幂等) → 启动服务
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run db:seed && pnpm start"]
