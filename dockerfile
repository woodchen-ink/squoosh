# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖，包括开发依赖
RUN npm ci

# 复制源代码
COPY . .

# 运行构建
RUN npm run build

# 运行阶段
FROM node:22-alpine

WORKDIR /usr/src/app

# 只复制生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 从构建阶段复制构建后的文件
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

CMD ["npm", "run", "start"]
