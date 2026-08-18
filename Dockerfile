FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN apt-get update \
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

FROM node:22-slim AS runner
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
