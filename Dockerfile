# ---- 构建基础镜像 ----
# better-sqlite3 是原生模块，预编译二进制不可用时需本地编译（node-gyp），
# 依赖 python3/make/g++，故使用 Debian 系 node:22-slim（glibc），不要换成 alpine
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable && corepack prepare pnpm@10.32.1 --activate

# ---- 构建阶段 ----
FROM base AS build
WORKDIR /app

# 先复制依赖清单，利用 Docker 层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# 构建期注入变量：后台路径为构建期变量，缺失会导致构建失败
ARG NEXT_PUBLIC_ADMIN_BASE_PATH
ENV NEXT_PUBLIC_ADMIN_BASE_PATH=$NEXT_PUBLIC_ADMIN_BASE_PATH
# @prisma/client 的 postinstall 被 pnpm 的 allowBuilds 白名单阻止，需显式生成 client 类型
RUN pnpm exec prisma generate
# 构建阶段先建好数据库 schema（防止 SSG 页面查询时报表不存在），CI 中传临时路径即可
ARG DATABASE_URL=file:/tmp/ci.db
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm exec prisma migrate deploy
RUN pnpm build

# ---- 运行阶段（无编译工具链，镜像更小） ----
FROM node:22-slim AS runner
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH" NODE_ENV=production PORT=3000
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
COPY --from=build /app ./

EXPOSE 3000
# 每次启动先应用数据库迁移（幂等），再启动服务
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm start"]
