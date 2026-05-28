# Sử dụng Node.js bản 20 LTS
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code và build project
COPY . .
RUN npm run build

# Stage 2: Chạy ứng dụng (giúp giảm dung lượng image)
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Chạy lệnh start:prod như định nghĩa trong package.json
CMD ["npm", "run", "start:prod"]