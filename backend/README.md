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

> **Base URL:** `http://localhost:3000`

### 🏥 System Health

| Method | Endpoint   | Description      | Auth |
|--------|------------|------------------|------|
| GET    | `/health`  | Health check     | ❌   |
| GET    | `/api`     | API information  | ❌   |

### 🔐 Authentication

| Method | Endpoint               | Description       | Auth |
|--------|------------------------|-------------------|------|
| POST   | `/api/auth/register`   | Đăng ký tài khoản | ❌   |
| POST   | `/api/auth/login`      | Đăng nhập         | ❌   |
| POST   | `/api/auth/logout`     | Đăng xuất         | ✅   |
| GET    | `/api/auth/profile`    | Xem profile       | ✅   |

### 📍 Spots (Địa điểm)

| Method | Endpoint                  | Description                                    | Auth |
|--------|---------------------------|------------------------------------------------|------|
| GET    | `/api/spots/search`       | Tìm kiếm + filter địa điểm (keyword, category, age, price, facilities) | ❌   |
| GET    | `/api/spots/suggestions`  | Autocomplete suggestions                       | ❌   |
| GET    | `/api/spots/:id`          | Chi tiết địa điểm (info, images, tags, reviews) | ❌   |
| GET    | `/api/spots/:id/reviews`  | Danh sách reviews của spot                     | ❌   |

### ⭐ Reviews (Đánh giá)

| Method | Endpoint                       | Description                           | Auth |
|--------|--------------------------------|---------------------------------------|------|
| POST   | `/api/reviews`                 | Tạo review (rating 1-5, comment max 140 chars) | ✅   |
| GET    | `/api/reviews/user/:userId`    | Tất cả reviews của user               | ✅   |
| GET    | `/api/reviews/:reviewId`       | Chi tiết review                       | ❌   |
| PUT    | `/api/reviews/:reviewId`       | Cập nhật review                       | ✅   |
| DELETE | `/api/reviews/:reviewId`       | Xóa review (support soft delete)      | ✅   |
| POST   | `/api/reviews/:reviewId/report`| Báo cáo review (spam/inappropriate)   | ✅   |

### ❤️ Favorites (Yêu thích)

| Method | Endpoint                       | Description                           | Auth |
|--------|--------------------------------|---------------------------------------|------|
| GET    | `/api/favorites`               | Danh sách favorites + spot info       | ✅   |
| GET    | `/api/favorites/collections`   | Danh sách collection tags             | ✅   |
| GET    | `/api/favorites/check/:spotId` | Kiểm tra spot có được yêu thích chưa  | ✅   |
| POST   | `/api/favorites`               | Thêm spot vào favorites               | ✅   |
| PUT    | `/api/favorites/:id`           | Cập nhật collection_tag               | ✅   |
| DELETE | `/api/favorites/:id`           | Xóa favorite by favorite_id           | ✅   |
| DELETE | `/api/favorites/spot/:spotId`  | Xóa favorite by spot_id (toggle)      | ✅   |

### 📅 Schedules (Lịch trình cuối tuần)

| Method | Endpoint                              | Description                                | Auth |
|--------|---------------------------------------|--------------------------------------------|------|
| GET    | `/api/schedules`                      | Danh sách lịch trình (filter: status, date) | ✅   |
| GET    | `/api/schedules/calendar/:year/:month`| Lịch theo tháng (calendar view)           | ✅   |
| GET    | `/api/schedules/:scheduleId`          | Chi tiết lịch trình + spot info            | ✅   |
| POST   | `/api/schedules`                      | Thêm lịch trình (spot, date, time_slot)   | ✅   |
| PUT    | `/api/schedules/:scheduleId`          | Cập nhật lịch trình                        | ✅   |
| DELETE | `/api/schedules/:scheduleId`          | Xóa/hủy lịch trình (support soft delete)  | ✅   |

### 👶 Children (Hồ sơ trẻ em)

| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| GET    | `/api/children`       | Danh sách trẻ của user   | ✅   |
| GET    | `/api/children/:id`   | Chi tiết trẻ             | ✅   |
| POST   | `/api/children`       | Thêm hồ sơ trẻ mới       | ✅   |
| PUT    | `/api/children/:id`   | Cập nhật hồ sơ           | ✅   |
| DELETE | `/api/children/:id`   | Xóa hồ sơ                | ✅   |

### 🎮 Kids Swipe (Tính năng swipe cho trẻ)

| Method | Endpoint                                  | Description                              | Auth |
|--------|-------------------------------------------|------------------------------------------|------|
| POST   | `/api/kids-swipe/:childId/swipe`          | Child swipe spot (LIKE/SKIP)             | ✅   |
| GET    | `/api/kids-swipe/:childId/preferences`    | Tags mà child thích (learned preferences)| ✅   |
| GET    | `/api/kids-swipe/:childId/recommendations`| Gợi ý spots dựa trên preferences         | ✅   |
| GET    | `/api/kids-swipe/:childId/spots`          | Danh sách spots chưa swipe               | ✅   |

### 🎯 Smart Recommendations (Gợi ý thông minh)

**Tự động gợi ý spots tối ưu dựa trên: khoảng cách, thời tiết, hồ sơ trẻ, lịch sử favorites**

| Method | Endpoint                                | Description                                   | Auth       |
|--------|-----------------------------------------|-----------------------------------------------|------------|
| GET    | `/api/recommendations`                  | Gợi ý thông minh (distance + weather + child profile + favorites) | ✅ Optional |
| GET    | `/api/recommendations/weather-alternatives` | Gợi ý thay thế khi thời tiết xấu (indoor/rain-friendly) | ✅ Optional |

**Query Parameters cho `/api/recommendations`:**
- `child_id` - Lọc theo child (age + preferences)
- `lat`, `lng` - Vị trí hiện tại (required)
- `distance` - Khoảng cách tối đa (km, default: 20)
- `weather` - RAIN, SUNNY, HOT (ưu tiên indoor/outdoor)
- `rain_ok` - true/false (chỉ indoor/rain-friendly)
- `open_now` - true/false (đang mở cửa)
- `limit`, `offset` - Pagination

**Scoring Algorithm:**
- Distance score (30 pts): Càng gần càng cao điểm
- Rating score (25 pts): Đánh giá cao = điểm cao
- Popularity (15 pts): Nhiều reviews = điểm cao
- Preference match (20 pts): Tags trùng với sở thích child
- Favorite bonus (10 pts): Đã yêu thích trước đó

### 🔐 Admin (Dashboard & Management)

**Dashboard KPIs theo thời gian thực - Chỉ dành cho Admin**

| Method | Endpoint              | Description                                      | Auth       |
|--------|-----------------------|--------------------------------------------------|------------|
| GET    | `/api/admin/dashboard`| Dashboard KPIs (totals, ratings, growth, trends) | 🔐 Admin   |
| GET    | `/api/admin/users`    | Danh sách users với stats                        | 🔐 Admin   |
| GET    | `/api/admin/spots`    | Danh sách spots (PUBLIC/DRAFT/ARCHIVED)          | 🔐 Admin   |

**Query Parameters cho `/api/admin/dashboard`:**
- `period` - 7, 30, 90 (days) - default: 30

**Dashboard KPIs bao gồm:**
- **Totals**: Users, Spots, Reviews, Favorites, Schedules, Children
- **Ratings**: Average rating, distribution (1-5 stars)
- **Growth**: New users, reviews, favorites, schedules trong period
- **Activity**: Active users, activity rate, avg engagement per user
- **Popular Spots**: Top 10 spots theo favorites + reviews
- **Categories**: Distribution theo category
- **Daily Trend**: Activity 7 ngày gần nhất

---

� **Chi tiết đầy đủ:** Xem file [`API_ENDPOINTS.md`](API_ENDPOINTS.md) để biết request/response examples, query parameters, và validation rules.

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
- Email: `buibaomoyu@gmail.com` (Password: `(Bao_password)`) - Has 2 children: Minh, An
- Email: `tanaka.yuki@example.com` (Password: `password123`) - Has 2 children: Taro, Hanako
- Email: `sato.kenji@example.com` (Password: `password123`) - Has 1 child: Kenta
- Email: `suzuki.mai@example.com` (Password: `password123`) - Has 1 child: Misaki

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
