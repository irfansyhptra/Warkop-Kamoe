# Next.js with Docker - Simple Tutorial

Tutorial sederhana untuk menggunakan Docker dengan aplikasi Next.js menggunakan Docker Desktop.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) untuk Windows
- Git (untuk version control)

## 🚀 Quick Start

### 1. Build Docker Image

```bash
# Build image dengan nama nextjs-app
docker build -t nextjs-app .
```

### 2. Run Container

```bash
# Jalankan container dan expose ke port 3000
docker run -p 3000:3000 nextjs-app
```

### 3. Akses Aplikasi

Buka browser dan akses: http://localhost:3000

## 📂 Struktur File Docker

```
nextjs-docker/
├── Dockerfile              # File konfigurasi Docker
├── .dockerignore           # File yang diabaikan saat build
└── README.md              # Dokumentasi ini
```

## 🔧 Penjelasan File Docker

### 1. Dockerfile

File konfigurasi untuk membuat Docker image:

- **Base Image**: Menggunakan `node:20-alpine` - image Linux yang ringan dengan Node.js 20
- **Working Directory**: Set `/app` sebagai direktori kerja di dalam container
- **Copy Files**: Copy `package.json` dan source code ke container
- **Install Dependencies**: Menggunakan `npm ci` untuk install dependencies
- **Build**: Menjalankan `npm run build` untuk build aplikasi production
- **Start**: Menggunakan `npm start` untuk menjalankan Next.js server
- **Expose Port**: Membuka port 3000 untuk akses dari luar container

> **Note**: Next.js menggunakan port 3000 secara default dan memiliki built-in server untuk production.

### 2. .dockerignore

File ini mencegah file/folder yang tidak diperlukan masuk ke Docker context:

- `node_modules` - akan diinstall ulang di container
- `.next`, `out`, `build` - output build yang akan dibuat ulang
- `.env` files - environment variables
- IDE files, logs, temporary files
- Next.js specific files (`.next/`, `out/`, `.vercel`)

## 🛠️ Perintah Docker yang Berguna

### Manajemen Images

```bash
# Lihat semua images
docker images

# Hapus image
docker rmi nextjs-app

# Hapus semua unused images
docker image prune
```

### Manajemen Containers

```bash
# Lihat running containers
docker ps

# Lihat semua containers (termasuk yang sudah stop)
docker ps -a

# Stop container yang sedang berjalan
docker stop <container-id>

# Hapus container
docker rm <container-id>

# Jalankan container di background
docker run -d -p 3000:3000 --name nextjs-container nextjs-app
```

### Debug dan Monitoring

```bash
# Lihat logs container
docker logs nextjs-container

# Akses container untuk debugging
docker exec -it nextjs-container sh

# Check status container
docker inspect nextjs-container
```

## 🔍 Troubleshooting

### 1. Port sudah digunakan

```bash
# Windows: Cek port yang digunakan
netstat -ano | findstr :3000

# Kill process di port tertentu
taskkill /PID <PID> /F
```

### 2. Build gagal karena Node.js version

Jika muncul error terkait Node.js version, pastikan Dockerfile menggunakan `node:20-alpine` atau versi yang lebih baru.

### 3. Build gagal karena dependency

```bash
# Clear Docker cache
docker builder prune

# Build dengan no-cache
docker build --no-cache -t nextjs-app .
```

### 4. Container tidak bisa diakses

```bash
# Check container logs
docker logs nextjs-container

# Check container status
docker inspect nextjs-container
```

## 📚 Best Practices

### 1. Optimasi Image Size

- Menggunakan Alpine Linux base images
- Proper `.dockerignore` file untuk menghindari file yang tidak perlu

### 2. Security

- Regular update base images
- Tidak include file sensitive di image

## 🚀 Langkah-langkah Lengkap

### 1. Pastikan Docker Desktop Running

Buka Docker Desktop dan pastikan status running (ikon Docker di system tray berwarna hijau)

### 2. Buka Terminal/Command Prompt

```bash
# Masuk ke direktori project
cd nextjs-docker
```

### 3. Build Docker Image

```bash
# Build image (proses ini akan download dependencies dan build aplikasi)
docker build -t nextjs-app .
```

### 4. Run Container

```bash
# Jalankan container
docker run -p 3000:3000 nextjs-app

# Atau jalankan di background
docker run -d -p 3000:3000 --name my-nextjs-app nextjs-app
```

### 5. Test Aplikasi

Buka browser dan akses: http://localhost:3000

## 🌟 Perbedaan dengan React Vite

| Aspek                | Next.js             | React Vite                    |
| -------------------- | ------------------- | ----------------------------- |
| **Built-in Server**  | ✅ Ya (`npm start`) | ❌ Butuh `serve` package      |
| **SSR/SSG**          | ✅ Built-in         | ❌ Client-side only           |
| **API Routes**       | ✅ Built-in         | ❌ Butuh backend terpisah     |
| **Build Output**     | `.next/` folder     | `dist/` folder                |
| **Production Ready** | ✅ Langsung siap    | ⚠️ Butuh konfigurasi tambahan |

## 📖 Referensi

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Documentation](https://docs.docker.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)

---

**Happy Dockerizing with Next.js! 🐳⚡**

#
