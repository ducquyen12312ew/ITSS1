# 🎮 Kodomo Weekend Navi - Backend API

> Backend API cho ứng dụng "Cẩm nang đi chơi cuối tuần cùng con" - Hỗ trợ gia đình tìm kiếm địa điểm vui chơi phù hợp cho trẻ em vào cuối tuần.

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình Database](#cấu-hình-database)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API Endpoints](#api-endpoints)
- [Cấu trúc Database](#cấu-trúc-database)
- [Scripts hữu ích](#scripts-hữu-ích)

## 🔧 Yêu cầu hệ thống

- **Node.js**: >= 16.0.0
- **MySQL**: >= 8.0
- **npm** hoặc **yarn**

## 📦 Cài đặt

### 1. Clone repository

```bash
cd backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file .env

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=kodomo_weekend_navi

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

## 🗄️ Cấu hình Database

### Phương án 1: Sử dụng MySQL Command Line

```bash
# 1. Đăng nhập MySQL
mysql -u root -p

# 2. Tạo database và import migration
source /path/to/backend/database/migration.sql

# 3. Import seed data
source /path/to/backend/database/seed.sql
```

### Phương án 2: Sử dụng Node.js Scripts (Khuyến nghị)

```bash
# Tạo database và tables
npm run migrate

# Import dữ liệu mẫu
npm run seed

# Hoặc reset toàn bộ (drop + migrate + seed)
npm run db:reset
```

### Kiểm tra kết nối database

Sau khi setup, bạn có thể kiểm tra:

```bash
mysql -u root -p kodomo_weekend_navi

mysql> SHOW TABLES;
mysql> SELECT COUNT(*) FROM spots;
mysql> SELECT * FROM users LIMIT 5;
```

## 🚀 Chạy ứng dụng

### Development mode (với nodemon)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

### Kiểm tra server

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

## 📚 API Endpoints

### Base URL: `http://localhost:3000/api`

#### 🏥 Health & Info

| Method | Endpoint   | Mô tả            |
|--------|------------|------------------|
| GET    | `/health`  | Health check     |
| GET    | `/api`     | API information  |

#### 👤 Users (Người dùng)

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| POST   | `/api/users/register`     | Đăng ký tài khoản     | ❌   |
| POST   | `/api/users/login`        | Đăng nhập             | ❌   |
| GET    | `/api/users/profile`      | Xem profile           | ✅   |
| PUT    | `/api/users/profile`      | Cập nhật profile      | ✅   |

#### 📍 Spots (Địa điểm)

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| GET    | `/api/spots`              | Lấy danh sách địa điểm | ❌   |
| GET    | `/api/spots/:id`          | Chi tiết địa điểm     | ❌   |
| POST   | `/api/spots`              | Tạo địa điểm mới      | 🔐 Admin |
| PUT    | `/api/spots/:id`          | Cập nhật địa điểm     | 🔐 Admin |
| DELETE | `/api/spots/:id`          | Xóa địa điểm          | 🔐 Admin |

#### ⭐ Reviews (Đánh giá)

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| GET    | `/api/reviews`            | Danh sách đánh giá    | ❌   |
| POST   | `/api/reviews`            | Tạo đánh giá          | ✅   |
| PUT    | `/api/reviews/:id`        | Cập nhật đánh giá     | ✅   |
| DELETE | `/api/reviews/:id`        | Xóa đánh giá          | ✅   |

#### ❤️ Favorites (Yêu thích)

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| GET    | `/api/favorites`          | Danh sách yêu thích   | ✅   |
| POST   | `/api/favorites`          | Thêm yêu thích        | ✅   |
| DELETE | `/api/favorites/:id`      | Xóa yêu thích         | ✅   |

#### 📅 Schedules (Lịch trình)

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| GET    | `/api/schedules`          | Danh sách lịch trình  | ✅   |
| POST   | `/api/schedules`          | Tạo lịch trình        | ✅   |
| PUT    | `/api/schedules/:id`      | Cập nhật lịch trình   | ✅   |
| DELETE | `/api/schedules/:id`      | Xóa lịch trình        | ✅   |

#### 👶 Children (Hồ sơ trẻ em)

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| GET    | `/api/children`           | Danh sách trẻ         | ✅   |
| POST   | `/api/children`           | Thêm hồ sơ trẻ        | ✅   |
| PUT    | `/api/children/:id`       | Cập nhật hồ sơ        | ✅   |
| DELETE | `/api/children/:id`       | Xóa hồ sơ             | ✅   |

#### 🎯 Recommendations (Gợi ý)

| Method | Endpoint                     | Mô tả                    | Auth |
|--------|------------------------------|--------------------------|------|
| GET    | `/api/recommendations`       | Lấy gợi ý phù hợp        | ✅   |
| POST   | `/api/recommendations/generate` | Tạo gợi ý mới         | ✅   |

#### 🔐 Admin

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| GET    | `/api/admin/dashboard`    | Dashboard KPI         | 🔐 Admin |
| GET    | `/api/admin/users`        | Quản lý users         | 🔐 Admin |
| GET    | `/api/admin/reviews`      | Quản lý reviews       | 🔐 Admin |

## 🗄️ Cấu trúc Database

Xem chi tiết trong file: [database/ERD.md](database/ERD.md)

### Các bảng chính:

1. **users** - Người dùng (5 users mẫu)
2. **children** - Hồ sơ trẻ em (5 children mẫu)
3. **child_preferences** - Sở thích trẻ
4. **spots** - Địa điểm (10 spots mẫu tại Tokyo)
5. **spot_images** - Ảnh địa điểm
6. **spot_facilities** - Tiện nghi
7. **spot_tags** - Tags
8. **reviews** - Đánh giá (13 reviews mẫu)
9. **review_images** - Ảnh đánh giá
10. **review_facilities** - Đánh giá tiện nghi
11. **favorites** - Yêu thích
12. **schedules** - Lịch trình
13. **kidswipe_history** - Lịch sử swipe
14. **recommendations** - Gợi ý
15. **kpis_metrics** - KPI metrics
16. **admin_activity_logs** - Admin logs
17. **weather_conditions** - Thời tiết

### Dữ liệu mẫu:

#### Test Accounts:

**Admin:**
- Email: `admin@kodomo.com`
- Password: `password123`
- Role: ADMIN

**User:**
- Email: `tanaka.yuki@example.com`
- Password: `password123`
- Role: USER

**Spots mẫu (Tokyo):**
- Ueno Zoo (上野動物園)
- Tokyo Skytree (東京スカイツリー)
- National Museum of Nature and Science
- Yoyogi Park (代々木公園)
- KidZania Tokyo
- Odaiba Seaside Park
- Sumida Aquarium
- Ghibli Museum
- ASOBono Indoor Playground
- Showa Kinen Park

## 📝 Scripts hữu ích

```bash
# Development
npm run dev              # Chạy server với nodemon (auto-reload)
npm start                # Chạy server production

# Database
npm run migrate          # Chạy migration (tạo tables)
npm run seed             # Import dữ liệu mẫu
npm run db:reset         # Reset toàn bộ database (drop + migrate + seed)

# Testing
curl http://localhost:3000/health              # Health check
curl http://localhost:3000/api                 # API info
```

## 📂 Cấu trúc thư mục

```
backend/
├── database/
│   ├── migration.sql      # SQL migration (tạo tables)
│   ├── seed.sql           # Dữ liệu mẫu
│   └── ERD.md             # Sơ đồ database
├── src/
│   ├── config/
│   │   └── config.js      # Configuration
│   ├── database/
│   │   ├── db.js          # Database connection
│   │   ├── migrate.js     # Migration script
│   │   ├── seed.js        # Seed script
│   │   └── reset.js       # Reset script
│   ├── controllers/       # (sẽ tạo sau)
│   ├── routes/            # (sẽ tạo sau)
│   ├── models/            # (sẽ tạo sau)
│   ├── middleware/        # (sẽ tạo sau)
│   └── server.js          # Entry point
├── uploads/               # File uploads
├── .env                   # Environment variables
├── .env.example           # Example env file
├── .gitignore
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Lỗi kết nối MySQL

```bash
# Kiểm tra MySQL đang chạy
sudo service mysql status

# Start MySQL
sudo service mysql start

# Kiểm tra user và password
mysql -u root -p
```

### Lỗi "ER_NOT_SUPPORTED_AUTH_MODE"

```sql
-- Chạy trong MySQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Reset database

```bash
npm run db:reset
```

## 📖 Tài liệu tham khảo

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [JWT Documentation](https://jwt.io/)

## 👥 Team

ITSS1 Team - 2025

## 📄 License

ISC License

---

**🎉 Happy Coding!**
