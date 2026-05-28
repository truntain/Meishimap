# Sử dụng Node.js bản 20 LTS
FROM node:20-alpine

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code và build Next.js
COPY . .
RUN npm run build

EXPOSE 3000

# Chạy ứng dụng Next.js
CMD ["npm", "run", "start"]