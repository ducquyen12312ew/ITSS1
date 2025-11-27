# 🚀 Hướng dẫn Deploy Kodomo Weekend Navi lên Vercel

## 📋 Yêu cầu trước khi deploy

1. ✅ Tài khoản GitHub
2. ✅ Tài khoản Vercel (đăng ký miễn phí tại [vercel.com](https://vercel.com))
3. ✅ Database MySQL online (khuyến nghị: [PlanetScale](https://planetscale.com/) hoặc [Railway](https://railway.app/))

---

## 🗄️ Bước 1: Chuẩn bị Database Online

### Tùy chọn A: PlanetScale (Khuyến nghị - Free tier tốt)

1. Truy cập [planetscale.com](https://planetscale.com/) và đăng ký
2. Tạo database mới:
   - Click "New database"
   - Nhập tên: `kodomo-weekend-navi`
   - Chọn region gần Việt Nam (Singapore/Tokyo)
3. Lấy connection string:
   - Vào tab "Connect"
   - Chọn "Node.js"
   - Copy connection string
4. Chạy migration:
   ```bash
   # Cài MySQL client nếu chưa có
   npm install -g mysql
   
   # Import schema
   mysql -h [HOST] -u [USER] -p[PASSWORD] [DATABASE] < backend/database/migration.sql
   mysql -h [HOST] -u [USER] -p[PASSWORD] [DATABASE] < backend/database/seed.sql
   ```

### Tùy chọn B: Railway (Dễ dùng, tích hợp tốt)

1. Truy cập [railway.app](https://railway.app/)
2. Đăng nhập bằng GitHub
3. "New Project" → "Provision MySQL"
4. Copy các thông tin: HOST, PORT, USER, PASSWORD, DATABASE
5. Sử dụng Railway CLI hoặc phpMyAdmin online để import SQL

---

## 📦 Bước 2: Push code lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
cd /c/xampp1/htdocs/ITSS1
git init

# Add remote repository
git remote add origin https://github.com/ducquyen12312ew/ITSS1.git

# Tạo .gitignore nếu chưa có (đã có rồi)

# Add và commit tất cả files
git add .
git commit -m "Ready for Vercel deployment - Full stack Kodomo Weekend Navi"

# Push lên GitHub
git push -u origin quyendesigner
```

---

## 🌐 Bước 3: Deploy lên Vercel

### 3.1. Import Project

1. Truy cập [vercel.com](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import repository GitHub của bạn: `ducquyen12312ew/ITSS1`
4. Chọn branch: `quyendesigner`

### 3.2. Cấu hình Project

**Framework Preset:** Vite (sẽ tự detect)

**Root Directory:** Leave as default (`.`)

**Build & Output Settings:**
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`
- Install Command: `npm install`

### 3.3. Cấu hình Environment Variables

Vào tab "Environment Variables" và thêm:

```env
# Node Environment
NODE_ENV=production

# Database (từ PlanetScale hoặc Railway)
DB_HOST=your-database-host.com
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=kodomo_weekend_navi

# JWT Secret (tạo mới, dùng: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here

# CORS (sẽ cập nhật sau khi có URL Vercel)
CORS_ORIGIN=https://your-app.vercel.app

# Port
PORT=3000
```

### 3.4. Deploy

1. Click "Deploy"
2. Đợi quá trình build (2-5 phút)
3. Vercel sẽ tự động generate URL: `https://your-project.vercel.app`

---

## 🔧 Bước 4: Cấu hình sau khi deploy

### 4.1. Cập nhật CORS_ORIGIN

1. Copy URL Vercel của bạn (ví dụ: `https://itss1-abc123.vercel.app`)
2. Vào Vercel Dashboard → Project → Settings → Environment Variables
3. Cập nhật `CORS_ORIGIN` = URL Vercel của bạn
4. Redeploy project

### 4.2. Cập nhật API URL trong Frontend

Nếu backend và frontend deploy riêng, cập nhật file `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend.vercel.app/api'
  : 'http://localhost:3000/api';
```

### 4.3. Kiểm tra Database Connection

1. Mở browser console
2. Truy cập `https://your-app.vercel.app/api/health`
3. Kiểm tra response có `status: "OK"`

---

## 📱 Bước 5: Test ứng dụng

1. **Frontend:** `https://your-app.vercel.app`
2. **Backend API:** `https://your-app.vercel.app/api`
3. **Health Check:** `https://your-app.vercel.app/api/health`

### Test các chức năng:
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập
- ✅ Tìm kiếm địa điểm
- ✅ Thêm yêu thích
- ✅ Tạo lịch trình
- ✅ Kids Swipe

---

## 🔄 Cập nhật sau này

Mỗi khi push code mới lên GitHub branch `quyendesigner`:

```bash
git add .
git commit -m "Update: your changes"
git push
```

Vercel sẽ **tự động deploy** lại!

---

## ⚠️ Lưu ý quan trọng

1. **Database:** Đảm bảo database online luôn chạy
2. **CORS:** Phải cấu hình đúng origin để frontend gọi được API
3. **JWT_SECRET:** Dùng secret khác cho production, không dùng default
4. **Environment Variables:** Không commit file `.env` lên GitHub
5. **Connection Limit:** Database free thường giới hạn connections, cần tối ưu

---

## 🆘 Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra DB_HOST, DB_USER, DB_PASSWORD
- Kiểm tra database có cho phép remote access
- Kiểm tra firewall/whitelist IP

### Lỗi: "CORS error"
- Cập nhật CORS_ORIGIN trong Environment Variables
- Redeploy sau khi update

### Lỗi: "Build failed"
- Kiểm tra `npm install` có lỗi không
- Kiểm tra version Node.js (khuyến nghị 18.x)

### Frontend không gọi được API
- Kiểm tra API_BASE_URL trong `api.js`
- Kiểm tra Network tab trong browser DevTools

---

## 📚 Tài liệu tham khảo

- [Vercel Documentation](https://vercel.com/docs)
- [PlanetScale Docs](https://planetscale.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

## 🎉 Hoàn thành!

Ứng dụng của bạn đã sẵn sàng trên internet với URL công khai!

**Chia sẻ link:** `https://your-app.vercel.app`
