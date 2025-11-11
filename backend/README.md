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

#### � Authentication (Đã hoàn thành ✅)

| Method | Endpoint                  | Mô tả                 | Auth |
|--------|---------------------------|-----------------------|------|
| POST   | `/api/auth/register`      | Đăng ký tài khoản     | ❌   |
| POST   | `/api/auth/login`         | Đăng nhập             | ❌   |
| POST   | `/api/auth/logout`        | Đăng xuất             | ✅   |
| GET    | `/api/auth/profile`       | Xem profile           | ✅   |

#### 📍 Spots (Địa điểm) - TODO

| Method | Endpoint                  | Mô tả                 | Auth | Status |
|--------|---------------------------|-----------------------|------|--------|
| GET    | `/api/spots`              | Lấy danh sách địa điểm với search & filter | ❌   | ⏳ TODO |
| GET    | `/api/spots/search`       | Tìm kiếm theo keyword (tên/category) | ❌   | ⏳ TODO |
| GET    | `/api/spots/:id`          | Chi tiết địa điểm     | ❌   | ⏳ TODO |
| POST   | `/api/spots`              | Tạo địa điểm mới      | 🔐 Admin | ⏳ TODO |
| PUT    | `/api/spots/:id`          | Cập nhật địa điểm     | 🔐 Admin | ⏳ TODO |
| DELETE | `/api/spots/:id`          | Xóa địa điểm          | 🔐 Admin | ⏳ TODO |

**Query Parameters cho GET `/api/spots`:**
- `keyword` - Tìm kiếm theo tên hoặc mô tả
- `category` - Lọc theo loại (PARK, MUSEUM, ZOO, AQUARIUM, THEME_PARK, INDOOR_PLAY)
- `min_age`, `max_age` - Lọc theo độ tuổi
- `price_range` - Lọc theo giá (FREE, UNDER_1000, 1000_3000, 3000_5000, OVER_5000)
- `is_indoor` - Lọc trong nhà/ngoài trời (true/false)
- `weather` - Lọc theo thời tiết (ALL_WEATHER, SUNNY_ONLY, RAIN_OK)
- `facilities` - Lọc theo tiện nghi (parking, nursing_room, stroller, cafe)
- `min_rating` - Lọc theo đánh giá tối thiểu
- `lat`, `lng`, `distance` - Lọc theo khoảng cách (km)
- `sort` - Sắp xếp: `recommended` (default), `distance`, `rating`, `age_match`
- `child_id` - Dùng cho age_match sorting
- `limit`, `offset` - Phân trang

#### 👶 Kids Swipe Feature - TODO

| Method | Endpoint                     | Mô tả                    | Auth | Status |
|--------|------------------------------|--------------------------|------|--------|
| POST   | `/api/kids/:childId/swipe`   | Swipe tag (LIKE/SKIP)    | ✅   | ⏳ TODO |
| GET    | `/api/kids/:childId/preferences` | Lấy sở thích         | ✅   | ⏳ TODO |
| GET    | `/api/kids/:childId/recommendations` | Gợi ý spots      | ✅   | ⏳ TODO |

#### ⭐ Reviews (Đánh giá) - TODO

| Method | Endpoint                  | Mô tả                 | Auth | Status |
|--------|---------------------------|-----------------------|------|--------|
| GET    | `/api/spots/:id/reviews`  | Danh sách đánh giá    | ❌   | ⏳ TODO |
| POST   | `/api/reviews`            | Tạo đánh giá          | ✅   | ⏳ TODO |
| PUT    | `/api/reviews/:id`        | Cập nhật đánh giá     | ✅   | ⏳ TODO |
| DELETE | `/api/reviews/:id`        | Xóa đánh giá          | ✅   | ⏳ TODO |

#### ❤️ Favorites (Yêu thích) - TODO

| Method | Endpoint                  | Mô tả                 | Auth | Status |
|--------|---------------------------|-----------------------|------|--------|
| GET    | `/api/favorites`          | Danh sách yêu thích   | ✅   | ⏳ TODO |
| POST   | `/api/favorites`          | Thêm yêu thích        | ✅   | ⏳ TODO |
| DELETE | `/api/favorites/:id`      | Xóa yêu thích         | ✅   | ⏳ TODO |

#### 📅 Schedules (Lịch trình) - TODO

| Method | Endpoint                  | Mô tả                 | Auth | Status |
|--------|---------------------------|-----------------------|------|--------|
| GET    | `/api/schedules`          | Danh sách lịch trình  | ✅   | ⏳ TODO |
| POST   | `/api/schedules`          | Tạo lịch trình        | ✅   | ⏳ TODO |
| PUT    | `/api/schedules/:id`      | Cập nhật lịch trình   | ✅   | ⏳ TODO |
| DELETE | `/api/schedules/:id`      | Xóa lịch trình        | ✅   | ⏳ TODO |

#### 👶 Children (Hồ sơ trẻ em) - TODO

| Method | Endpoint                  | Mô tả                 | Auth | Status |
|--------|---------------------------|-----------------------|------|--------|
| GET    | `/api/children`           | Danh sách trẻ         | ✅   | ⏳ TODO |
| POST   | `/api/children`           | Thêm hồ sơ trẻ        | ✅   | ⏳ TODO |
| PUT    | `/api/children/:id`       | Cập nhật hồ sơ        | ✅   | ⏳ TODO |
| DELETE | `/api/children/:id`       | Xóa hồ sơ             | ✅   | ⏳ TODO |

#### 🔐 Admin - TODO

| Method | Endpoint                  | Mô tả                 | Auth | Status |
|--------|---------------------------|-----------------------|------|--------|
| GET    | `/api/admin/dashboard`    | Dashboard KPI         | 🔐 Admin | ⏳ TODO |
| GET    | `/api/admin/users`        | Quản lý users         | 🔐 Admin | ⏳ TODO |
| GET    | `/api/admin/spots`        | Quản lý spots         | 🔐 Admin | ⏳ TODO |

## 🗄️ Cấu trúc Database

Xem chi tiết trong file: [database/DATABASE_SCHEMA.md](database/DATABASE_SCHEMA.md)

### 12 bảng chính (Đơn giản hóa từ 17 bảng):

**Authentication & Users:**
1. **users** - Người dùng (4 users mẫu: 1 admin + 3 parents)
2. **children** - Hồ sơ trẻ em (4 children mẫu)
3. **child_preferences** - Sở thích tags của trẻ (từ Kids Swipe)

**Spots & Content:**
4. **spots** - Địa điểm (10 spots mẫu tại Tokyo, facilities dạng JSON)
5. **spot_images** - Ảnh địa điểm
6. **spot_tags** - Tags linh hoạt (animals, crafts, outdoor...)

**User Interactions:**
7. **reviews** - Đánh giá (10 reviews, 1 ảnh + facilities JSON)
8. **favorites** - Yêu thích (7 favorites)
9. **schedules** - Lịch trình (4 schedules)

**Features:**
10. **kid_swipe** - Lịch sử swipe tags của trẻ (Kids Swipe feature)
11. **weather_cache** - Cache thời tiết
12. **admin_logs** - Audit trail + metrics

### Dữ liệu mẫu:

#### Test Accounts:

**Admin:**
- Email: `admin@kodomo.com`
- Password: `password123`
- Role: ADMIN

**User Accounts:**
- Email: `tanaka.yuki@example.com` (Password: `password123`)
- Email: `sato.kenji@example.com` (Password: `password123`)
- Email: `suzuki.mai@example.com` (Password: `password123`)

**Spots mẫu (10 địa điểm Tokyo):**
- Ueno Zoo - Vườn thú nổi tiếng
- National Museum of Nature and Science - Bảo tàng khoa học
- Tokyo Skytree - Tháp quan sát 634m
- Odaiba Seaside Park - Công viên bãi biển
- KidZania Tokyo - Thành phố nghề nghiệp
- Kasai Rinkai Aquarium - Thủy cung
- Yoyogi Park - Công viên miễn phí
- teamLab Borderless - Bảo tàng digital art
- Asobono - Khu vui chơi trong nhà
- Inokashira Park Zoo - Vườn thú nhỏ

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
