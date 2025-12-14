# Admin Scripts Documentation

## Overview

Scripts untuk mengelola user admin di Warkop Kamoe application.

## Available Scripts

### 1. Create Admin User

Membuat user admin baru di database.

```bash
npm run create-admin
```

**Features:**

- Membaca kredensial dari `.env` file
- Meng-hash password dengan bcrypt
- Memeriksa apakah admin sudah ada
- Otomatis set `isVerified: true`
- Otomatis set `role: admin`

**Environment Variables (.env):**

```env
ADMIN_EMAIL=admin@warkopkamoe.com
ADMIN_PASSWORD=Admin123
ADMIN_NAME=Super Admin
```

**Output:**

```
✅ Admin user created successfully!

📋 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    admin@warkopkamoe.com
🔑 Password: Admin123
👤 Name:     Super Admin
🎯 Role:     admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 2. Reset Admin Password

Mereset password admin yang sudah ada.

```bash
npm run reset-admin
```

**Use Cases:**

- Lupa password admin
- Perlu update password ke nilai baru di `.env`
- Troubleshooting login issues

**Features:**

- Membaca kredensial dari `.env` file
- Meng-hash password baru dengan bcrypt
- Update password di database
- Memverifikasi admin (set `isVerified: true`)

**Output:**

```
✓ Found admin user: Super Admin (admin@warkopkamoe.com)
🔒 Updating password...
✅ Admin password updated successfully!
```

---

## Quick Start Guide

### First Time Setup

1. **Set kredensial admin di `.env`:**

   ```env
   ADMIN_EMAIL=admin@warkopkamoe.com
   ADMIN_PASSWORD=Admin123
   ADMIN_NAME=Super Admin
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create admin user:**

   ```bash
   npm run create-admin
   ```

4. **Login:**

   - Buka: http://localhost:3000/auth/login
   - Email: `admin@warkopkamoe.com`
   - Password: `Admin123`

5. **Access Admin Panel:**
   - Dashboard: http://localhost:3000/admin/dashboard
   - Users: http://localhost:3000/admin/users
   - Orders: http://localhost:3000/admin/orders
   - Warkops: http://localhost:3000/admin/warkops

---

## Troubleshooting

### ❌ Problem: "Admin user already exists"

**Solution:** User admin sudah ada. Jika perlu update password, gunakan:

```bash
npm run reset-admin
```

---

### ❌ Problem: "Invalid email or password" saat login

**Solutions:**

1. **Verify kredensial di `.env`:**

   ```bash
   cat .env | grep ADMIN
   ```

2. **Reset password admin:**

   ```bash
   npm run reset-admin
   ```

3. **Check database connection:**

   - Pastikan `MONGODB_URI` di `.env` benar
   - Pastikan MongoDB server running

4. **Clear browser cache/localStorage:**
   - Buka Developer Tools (F12)
   - Application > Local Storage > Clear All
   - Refresh page dan coba login lagi

---

### ❌ Problem: "Cannot connect to MongoDB"

**Solutions:**

1. **Check MongoDB URI:**

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```

2. **Test connection:**

   ```bash
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e.message))"
   ```

3. **Check network/firewall:**
   - MongoDB Atlas: Whitelist your IP
   - Local MongoDB: Check if service is running

---

## Security Best Practices

### ⚠️ Development

- Use simple password untuk development: `Admin123`
- Kredensial disimpan di `.env` (git-ignored)

### 🔒 Production

1. **Change admin password immediately after deployment:**

   ```bash
   # Update .env dengan password yang kuat
   ADMIN_PASSWORD=StrongP@ssw0rd!2024

   # Reset password
   npm run reset-admin
   ```

2. **Use strong password:**

   - Minimal 12 karakter
   - Kombinasi huruf besar/kecil, angka, simbol
   - Jangan gunakan kata dictionary
   - Example: `A7$mK#xP9@qL2!wZ`

3. **Enable 2FA (future enhancement)**

4. **Regular password rotation:**

   - Update password setiap 90 hari
   - Don't reuse old passwords

5. **Monitor admin activity:**
   - Check logs untuk suspicious login
   - Review admin actions regularly

---

## File Structure

```
scripts/
├── create-admin.js         # Script untuk create admin user
└── reset-admin-password.js # Script untuk reset password

.env
├── ADMIN_EMAIL             # Email admin (default: admin@warkopkamoe.com)
├── ADMIN_PASSWORD          # Password admin (default: Admin123)
└── ADMIN_NAME              # Nama admin (default: Super Admin)

package.json
└── scripts:
    ├── create-admin        # npm run create-admin
    └── reset-admin         # npm run reset-admin
```

---

## Script Details

### create-admin.js

**Dependencies:**

- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- dotenv: Environment variables

**Flow:**

1. Connect to MongoDB
2. Check if admin exists
3. If not exists:
   - Hash password
   - Create admin user
   - Save to database
4. Display credentials
5. Close connection

---

### reset-admin-password.js

**Dependencies:**

- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- dotenv: Environment variables

**Flow:**

1. Connect to MongoDB
2. Find admin by email
3. If exists:
   - Hash new password
   - Update user password
   - Set isVerified = true
   - Save to database
4. Display new credentials
5. Close connection

---

## Manual Database Operations

### MongoDB Compass / Atlas

**Find admin user:**

```javascript
db.users.findOne({ email: "admin@warkopkamoe.com" });
```

**Update admin role:**

```javascript
db.users.updateOne(
  { email: "admin@warkopkamoe.com" },
  { $set: { role: "admin", isVerified: true } }
);
```

**Delete admin user:**

```javascript
db.users.deleteOne({ email: "admin@warkopkamoe.com" });
```

---

## FAQ

**Q: Bisa membuat multiple admin?**
A: Ya, ubah `ADMIN_EMAIL` di `.env` dan jalankan `npm run create-admin` lagi.

**Q: Bisa mengubah role user biasa jadi admin?**
A: Ya, bisa via:

1. Admin panel: `/admin/users` > pilih user > ubah role ke "admin"
2. MongoDB: update field `role` jadi "admin"

**Q: Admin bisa dihapus?**
A: Admin tidak bisa delete dirinya sendiri via admin panel (self-protection). Harus via MongoDB directly.

**Q: Password minimal berapa karakter?**
A: Minimal 6 karakter (sesuai validasi di register). Tapi untuk admin production, gunakan minimal 12 karakter.

**Q: Script ini aman?**
A: Ya, password di-hash dengan bcrypt sebelum disimpan. Script hanya membaca dari `.env` yang di-gitignore.

---

## Support

Jika mengalami masalah:

1. Check terminal output untuk error message
2. Verify `.env` configuration
3. Test MongoDB connection
4. Check application logs
5. Review this documentation

---

**Last Updated:** December 14, 2025
**Version:** 1.0.0
