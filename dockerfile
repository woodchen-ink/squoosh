# 构建阶段
FROM node:22-alpine-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --only=production --ignore-scripts

COPY . .
RUN npm run build

# 运行阶段
FROM node:22-alpine-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000

CMD ["npm", "run", "start"]
