# 使用Node.js官方镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制项目文件到容器中
COPY . .

# 安装项目依赖
RUN npm install

# 构建应用
RUN npm run build

# 暴露端口5000
EXPOSE 5000

# 容器启动时运行的命令
CMD ["npm", "run", "dev"]