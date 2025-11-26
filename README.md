# 🎮 Kodomo Weekend Navi (コドモ週末ナビ)

> **Cẩm nang đi chơi cuối tuần cùng con** - Ứng dụng tìm kiếm và đề xuất địa điểm vui chơi phù hợp cho trẻ em tại Hà Nội

[![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt và Chạy](#-cài-đặt-và-chạy)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [API Endpoints](#-api-endpoints)
- [Tài Khoản Test](#-tài-khoản-test)
- [Scripts Hữu Ích](#-scripts-hữu-ích)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Giới Thiệu

**Kodomo Weekend Navi** là một ứng dụng web giúp phụ huynh tìm kiếm và lựa chọn địa điểm vui chơi phù hợp cho con em mình vào cuối tuần. Ứng dụng cung cấp:

- 🔍 Tìm kiếm địa điểm theo nhiều tiêu chí (tuổi, thể loại, giá cả, thời tiết)
- 📍 15+ địa điểm thực tế tại Hà Nội với thông tin chi tiết
- 👶 Quản lý hồ sơ con cái và sở thích của từng bé
- ❤️ Lưu địa điểm yêu thích và lập lịch trình
- ⭐ Đọc và viết đánh giá từ cộng đồng
- 🎴 Tính năng swipe (giống Tinder) cho trẻ em chọn địa điểm

---

## ✨ Tính Năng

### 🔐 1. Xác Thực & Phân Quyền
- Đăng ký/Đăng nhập với JWT authentication
- Phân quyền User/Admin
- Validation đầy đủ (email, password 8+ ký tự)
- Thông báo lỗi bằng tiếng Nhật

### 🔎 2. Tìm Kiếm & Lọc
- Tìm kiếm theo tên địa điểm hoặc thể loại
- Bộ lọc nâng cao:
  - Độ tuổi (0-2, 3-5, 6-8, 9-12)
  - Khu vực (Hoàn Kiếm, Ba Đình, Cầu Giấy...)
  - Thể loại (Công viên, Bảo tàng, Khu vui chơi trong nhà...)
  - Giá (Miễn phí, <1000円, 1000-3000円...)
  - Điều kiện (Phù hợp ngày mưa, Có chỗ đỗ xe...)
- Sắp xếp: Gợi ý, Khoảng cách, Đánh giá, Mới nhất

### 📍 3. Thông Tin Địa Điểm
- Mô tả chi tiết bằng tiếng Nhật
- Bộ sưu tập ảnh từ Unsplash
- Giờ mở cửa, giá vé, cơ sở vật chất
- Bản đồ và chỉ đường (Google Maps integration)
- Đánh giá trung bình và số lượng review

### 👨‍👩‍👧‍👦 4. Quản Lý Con Cái
- Thêm/Sửa/Xóa hồ sơ con
- Thông tin: Tên, tuổi, avatar, ghi chú
- Tự động tính tuổi từ ngày sinh
- Mỗi con có danh sách yêu thích riêng

### 💝 5. Yêu Thích & Lịch Trình
- Lưu địa điểm yêu thích (cả người lớn và trẻ em)
- Tabs phân biệt favorites của từng người
- Thêm địa điểm vào lịch trình
- Chọn ngày, khung giờ (sáng/chiều/cả ngày), ghi chú

### ⭐ 6. Đánh Giá
- Xem reviews từ cộng đồng
- Viết đánh giá (rating 1-5 sao + comment)
- Hiển thị tên người review và thời gian
- Cập nhật rating trung bình real-time

### 🎴 7. Kids Swipe (Bonus)
- Trẻ em swipe trái (skip) / phải (thích) địa điểm
- Tự động lưu vào favorites của bé
- Giao diện thân thiện với trẻ em

### 🎨 8. UI/UX
- Design hiện đại, responsive (mobile-first)
- Bilingual: Tiếng Nhật + Tiếng Việt
- Dark badges, gradient cards
- Smooth animations và transitions
- Guest access cho tính năng public

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite 5.0
- **Routing:** React Router DOM 6.20
- **HTTP Client:** Axios 1.6
- **Icons:** React Icons 4.12
- **Styling:** Pure CSS (no framework)

### Backend
- **Runtime:** Node.js 16+
- **Framework:** Express 4.18
- **Database:** MySQL 8.0+
- **ORM:** mysql2 (native driver)
- **Authentication:** JWT (jsonwebtoken 9.0)
- **Password Hashing:** bcryptjs 2.4
- **Validation:** Joi 17.11
- **CORS:** cors 2.8
- **File Upload:** multer 1.4

### Database
- **RDBMS:** MySQL 8.0+
- **Character Set:** utf8mb4 (hỗ trợ tiếng Nhật)
- **Timezone:** JST (+09:00)

### Development Tools
- **Hot Reload:** Vite HMR (frontend) + Nodemon (backend)
- **Version Control:** Git & GitHub
- **Package Manager:** npm

---

## 💻 Yêu Cầu Hệ Thống

### Bắt Buộc
- **Node.js:** v16.0.0 trở lên ([Download](https://nodejs.org/))
- **MySQL:** v8.0 trở lên
- **npm:** v7.0.0+ (đi kèm Node.js)
- **Git:** Để clone repository

### Khuyến Nghị
- **RAM:** 4GB+
- **OS:** Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **Browser:** Chrome/Firefox/Edge (phiên bản mới nhất)
- **XAMPP/MAMP:** Để quản lý MySQL dễ dàng

---

## 🚀 Cài Đặt và Chạy

### Bước 1: Clone Repository

```bash
git clone https://github.com/ducquyen12312ew/ITSS1.git
cd ITSS1
```

### Bước 2: Cài Đặt MySQL

#### Windows (XAMPP)
1. Download XAMPP: https://www.apachefriends.org/
2. Cài đặt và mở **XAMPP Control Panel**
3. Click **Start** cho **MySQL**

#### macOS
```bash
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### Bước 3: Tạo Database

#### Option A: Sử dụng phpMyAdmin (Dễ nhất)
1. Truy cập: http://localhost/phpmyadmin
2. Click **New** (Tạo database mới)
3. Tên database: `kodomo_weekend_navi`
4. Collation: `utf8mb4_unicode_ci`
5. Click **Create**
6. Chọn database vừa tạo → Tab **Import**
7. Chọn file `backend/database/migration.sql` → **Go**
8. Tiếp tục Import file `backend/database/seed.sql` → **Go**

#### Option B: Sử dụng MySQL CLI
```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE kodomo_weekend_navi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kodomo_weekend_navi;

# Import schema
SOURCE /path/to/ITSS1/backend/database/migration.sql;

# Import data
SOURCE /path/to/ITSS1/backend/database/seed.sql;

# Thoát
EXIT;
```

#### Option C: Sử dụng Script Tự Động (Nhanh nhất)
```bash
cd backend
npm install
npm run db:reset
```

### Bước 4: Cài Đặt Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Khởi động server
npm start
```

**Kết quả mong đợi:**
```
✅ Server running on http://localhost:3000
✅ Database connected successfully
✅ Press Ctrl+C to stop
```

**Test API:**
```bash
# Mở trình duyệt hoặc dùng curl
curl http://localhost:3000/api/spots/search

# Hoặc truy cập:
http://localhost:3000/api/spots/search
```

### Bước 5: Cài Đặt Frontend

**Mở terminal mới** (giữ backend chạy):

```bash
# Từ thư mục gốc ITSS1
cd frontend

# Cài đặt dependencies
npm install

# Khởi động dev server
npm run dev
```

**Kết quả mong đợi:**
```
  VITE v5.0.8  ready in 450 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Bước 6: Truy Cập Ứng Dụng

Mở trình duyệt và truy cập:
```
http://localhost:3001
```

🎉 **Hoàn tất!** Ứng dụng đã sẵn sàng sử dụng.

---

## 📁 Cấu Trúc Dự Án

```
ITSS1/
│
├── backend/                      # Backend API (Node.js + Express)
│   ├── database/
│   │   ├── migration.sql         # Schema database (CREATE TABLE)
│   │   └── seed.sql              # Dữ liệu mẫu (15 địa điểm Hà Nội)
│   ├── src/
│   │   ├── config/
│   │   │   └── config.js         # Cấu hình (DB, JWT, CORS...)
│   │   ├── controllers/          # Business logic
│   │   │   ├── authController.js       # Đăng ký, đăng nhập
│   │   │   ├── spotsController.js      # Tìm kiếm, lọc địa điểm
│   │   │   ├── reviewsController.js    # Đánh giá
│   │   │   ├── favoritesController.js  # Yêu thích
│   │   │   ├── schedulesController.js  # Lịch trình
│   │   │   ├── childrenController.js   # Quản lý con
│   │   │   └── kidsSwipeController.js  # Swipe của trẻ em
│   │   ├── database/
│   │   │   ├── db.js             # MySQL connection pool
│   │   │   ├── migrate.js        # Script chạy migration
│   │   │   ├── seed.js           # Script import data
│   │   │   └── reset.js          # Script reset database
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication middleware
│   │   ├── routes/               # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── spotsRoutes.js
│   │   │   ├── reviewsRoutes.js
│   │   │   └── ... (các routes khác)
│   │   └── server.js             # Entry point
│   ├── .env.example              # Template environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/                     # Frontend SPA (React + Vite)
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── SpotCard.jsx      # Component hiển thị thẻ địa điểm
│   │   │   ├── SpotCard.css
│   │   │   ├── Tabbar.jsx        # Bottom navigation
│   │   │   ├── Tabbar.css
│   │   │   └── ProtectedRoute.jsx # Route guard
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx          # Trang chủ
│   │   │   ├── Search.jsx        # Tìm kiếm & lọc
│   │   │   ├── SpotDetail.jsx    # Chi tiết địa điểm
│   │   │   ├── Login.jsx         # Đăng nhập
│   │   │   ├── Register.jsx      # Đăng ký
│   │   │   ├── Profile.jsx       # Hồ sơ người dùng
│   │   │   ├── ChildrenProfile.jsx # Quản lý con
│   │   │   ├── Favorites.jsx     # Yêu thích
│   │   │   ├── Schedule.jsx      # Lịch trình
│   │   │   ├── KidsSwipe.jsx     # Swipe cho trẻ em
│   │   │   └── ... (+ CSS files)
│   │   ├── services/
│   │   │   └── api.js            # Axios instance + interceptors
│   │   ├── styles/
│   │   │   └── index.css         # Global styles
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── vite.config.js            # Vite configuration (proxy)
│   ├── .gitignore
│   └── package.json
│
├── figma/                        # Static HTML prototypes (legacy)
│   ├── home.html
│   ├── search.html
│   ├── spot.html
│   └── ... (các file HTML/CSS/JS tĩnh)
│
├── TEST_GUIDE.md                 # Hướng dẫn test chi tiết (55+ test cases)
├── README.md                     # File này
├── LICENSE
└── .gitignore
```

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/login` | Đăng nhập | ❌ |
| POST | `/logout` | Đăng xuất | ✅ |
| GET | `/profile` | Lấy thông tin user | ✅ |
| PUT | `/profile` | Cập nhật thông tin | ✅ |

### Spots (`/api/spots`)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/search` | Tìm kiếm & lọc địa điểm | ❌ |
| GET | `/:id` | Chi tiết địa điểm | ❌ |
| POST | `/` | Tạo địa điểm mới (Admin) | ✅ |
| PUT | `/:id` | Cập nhật địa điểm (Admin) | ✅ |
| DELETE | `/:id` | Xóa địa điểm (Admin) | ✅ |

### Reviews (`/api/reviews`)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/spots/:spotId` | Lấy reviews của địa điểm | ❌ |
| POST | `/` | Viết review | ✅ |
| PUT | `/:id` | Sửa review | ✅ |
| DELETE | `/:id` | Xóa review | ✅ |

### Favorites (`/api/favorites`)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/` | Lấy danh sách yêu thích | ✅ |
| POST | `/` | Thêm yêu thích | ✅ |
| DELETE | `/:spotId` | Xóa yêu thích | ✅ |

### Children (`/api/children`)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/` | Lấy danh sách con | ✅ |
| POST | `/` | Thêm con | ✅ |
| PUT | `/:id` | Cập nhật thông tin con | ✅ |
| DELETE | `/:id` | Xóa con | ✅ |

### Schedules (`/api/schedules`)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/` | Lấy lịch trình | ✅ |
| POST | `/` | Thêm lịch trình | ✅ |
| PUT | `/:id` | Cập nhật lịch trình | ✅ |
| DELETE | `/:id` | Xóa lịch trình | ✅ |

### Kids Swipe (`/api/kids-swipe`)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/:childId/swipe` | Lưu swipe (LIKE/SKIP) | ✅ |
| GET | `/:childId/favorites` | Yêu thích của con | ✅ |
| DELETE | `/:childId/swipe/:spotId` | Xóa swipe | ✅ |

**Chi tiết đầy đủ:** Xem file `backend/API_ENDPOINTS.md`

---

## 👥 Tài Khoản Test

Database đã có sẵn 5 tài khoản để test:

| Email | Password | Role | Mô tả |
|-------|----------|------|-------|
| `buibaomoyu@gmail.com` | `password123` | **ADMIN** | Tài khoản admin, có 2 con |
| `tanaka.yuki@example.com` | `password123` | USER | User Nhật, có 2 con |
| `nguyenvan@example.com` | `password123` | USER | User Việt, có 1 con |
| `tranthihue@example.com` | `password123` | USER | User Việt, có 1 con |
| `satoyuki@example.com` | `password123` | USER | User Nhật, có 1 con |

**Dữ liệu có sẵn:**
- 15 địa điểm thực tế tại Hà Nội
- 7 hồ sơ trẻ em
- 16 reviews
- 14 favorites
- 20 kid swipes
- 6 schedules

---

## 🔧 Scripts Hữu Ích

### Backend Scripts

```bash
cd backend

# Development (auto-restart khi code thay đổi)
npm run dev

# Production
npm start

# Reset database (xóa tất cả, tạo lại từ đầu)
npm run db:reset

# Chỉ chạy migration (tạo bảng)
npm run migrate

# Chỉ import data (cần có bảng trước)
npm run seed
```

### Frontend Scripts

```bash
cd frontend

# Development server (hot reload)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## ❓ Troubleshooting

### 1. Lỗi "Cannot connect to database"

**Nguyên nhân:** MySQL chưa chạy hoặc cấu hình sai

**Giải pháp:**
```bash
# Kiểm tra MySQL đang chạy
# Windows (XAMPP): Mở XAMPP Control Panel → Start MySQL
# macOS:
brew services list
brew services start mysql

# Linux:
sudo systemctl status mysql
sudo systemctl start mysql

# Kiểm tra port 3306
netstat -an | grep 3306
```

### 2. Lỗi "Port 3000 already in use"

**Giải pháp:**

```bash
# Windows - Tìm và kill process
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Hoặc đổi port trong backend/src/config/config.js
port: 3001  # Thay đổi từ 3000
```

### 3. Lỗi "npm install failed"

**Giải pháp:**

```bash
# Xóa cache và cài lại
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Nếu vẫn lỗi, thử với --legacy-peer-deps
npm install --legacy-peer-deps
```

### 4. Lỗi "Access denied for user 'root'@'localhost'"

**Giải pháp:**

```bash
# Reset password MySQL
mysql -u root

# Trong MySQL prompt:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;

# Hoặc tạo file .env trong backend/
DB_USER=root
DB_PASSWORD=your_password
```

### 5. Frontend không kết nối Backend

**Kiểm tra:**
1. Backend đang chạy: `http://localhost:3000/api/spots/search`
2. Frontend đang chạy: `http://localhost:3001`
3. Vite proxy config đúng trong `frontend/vite.config.js`:
```javascript
server: {
  port: 3001,
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### 6. Lỗi tiếng Nhật hiển thị �������

**Giải pháp:**
- Đảm bảo database charset là `utf8mb4`
- Kiểm tra trong `backend/src/config/config.js`:
```javascript
db: {
  charset: 'utf8mb4',
  timezone: '+09:00'
}
```

### 7. Lỗi "JWT token invalid" liên tục

**Giải pháp:**
```bash
# Xóa localStorage trong browser
# F12 → Console → chạy:
localStorage.clear()
location.reload()

# Hoặc logout và login lại
```

### 8. Ảnh không hiển thị

**Nguyên nhân:** Unsplash API rate limit hoặc mạng chậm

**Giải pháp:**
- Chờ vài giây để ảnh load
- Ảnh có placeholder tự động
- Kiểm tra DevTools → Network tab

---

## 📚 Tài Liệu Thêm

- **API Documentation:** `backend/API_ENDPOINTS.md`
- **Database Schema:** `backend/database/DATABASE_SCHEMA.md`
- **Test Guide:** `TEST_GUIDE.md` (55+ test cases chi tiết)
- **Setup Guide:** `backend/DATABASE_SETUP.md`

---

## 🤝 Đóng Góp

Dự án này được phát triển bởi nhóm ITSS1 cho môn học tại trường.

**Thành viên:**
- Bùi Đức Bảo - Leader/Fullstack Developer
- [Thêm tên thành viên khác...]

---

## 📄 License

[ISC License](LICENSE)

---

## 📞 Liên Hệ

**Email:** buibaomoyu@gmail.com  
**GitHub:** [@ducquyen12312ew](https://github.com/ducquyen12312ew)  
**Repository:** [ITSS1](https://github.com/ducquyen12312ew/ITSS1)

---

## 🎉 Acknowledgments

- **Unsplash** - Ảnh miễn phí chất lượng cao
- **React Icons** - Icon library
- **Vite** - Build tool siêu nhanh
- **Express** - Minimal web framework
- **MySQL** - Reliable database

---

<div align="center">

Made with ❤️ by ITSS1 Team

**⭐ Star repo nếu thấy hữu ích! ⭐**

</div>
