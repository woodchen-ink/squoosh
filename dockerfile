# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖，包括开发依赖
RUN npm install

# 复制源代码
COPY . .

# 运行构建
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建后的文件到 Nginx 的默认静态文件目录
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
