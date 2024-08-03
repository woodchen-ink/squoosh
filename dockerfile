FROM nginx:alpine

# 设置时区和语言环境
ENV TZ=Asia/Shanghai \
    LANG=zh_CN.UTF-8 \
    LANGUAGE=zh_CN:zh \
    LC_ALL=zh_CN.UTF-8

# 安装需要的包
RUN apk add --no-cache tzdata

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建后的文件到 Nginx 的默认静态文件目录
COPY build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
