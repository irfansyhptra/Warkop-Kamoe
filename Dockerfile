# Dockerfile untuk Next.js Application

# Menggunakan Node.js 20 Alpine sebagai base image
FROM node:20-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy semua source code ke container
COPY . .

# Build aplikasi untuk production
RUN npm run build

# Expose port 3000 (default Next.js port)
EXPOSE 3000

# Jalankan aplikasi Next.js
CMD ["npm", "start"]