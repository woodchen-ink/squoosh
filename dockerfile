FROM nginx:alpine

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建后的文件到 Nginx 的默认静态文件目录
COPY build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
