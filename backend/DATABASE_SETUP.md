# 🚀 Hướng dẫn Setup Database - Kodomo Weekend Navi

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn cài đặt và cấu hình database MySQL cho dự án.

## ⚡ Quick Start (Nhanh nhất)

```bash
# 1. Cài đặt dependencies
cd backend
npm install

# 2. Tạo file .env từ .env.example
cp .env.example .env

# 3. Chỉnh sửa thông tin database trong .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=kodomo_weekend_navi

# 4. Chạy lệnh reset database (tạo + seed data)
npm run db:reset
```

**✅ Xong! Database đã sẵn sàng với 10 địa điểm mẫu tại Tokyo.**

---

## 📚 Chi tiết từng bước

### Bước 1: Cài đặt MySQL

#### Trên Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### Trên MacOS:
```bash
brew install mysql
brew services start mysql
```

#### Trên Windows:
- Download MySQL từ: https://dev.mysql.com/downloads/mysql/
- Cài đặt theo wizard

### Bước 2: Kiểm tra MySQL đang chạy

```bash
# Ubuntu/Debian
sudo service mysql status
sudo service mysql start

# MacOS
brew services list
brew services start mysql

# Đăng nhập MySQL
mysql -u root -p
```

### Bước 3: Tạo database bằng MySQL CLI (Tuỳ chọn)

```sql
-- Đăng nhập MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE kodomo_weekend_navi 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Kiểm tra
SHOW DATABASES;

-- Thoát
EXIT;
```

### Bước 4: Cấu hình .env

Tạo file `.env` từ `.env.example`:

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL - QUAN TRỌNG: Sửa đúng thông tin của bạn
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=kodomo_weekend_navi

# JWT
JWT_SECRET=kodomo_secret_key_2025
JWT_EXPIRES_IN=7d
```

### Bước 5: Chạy Migration và Seed

#### Phương án A: Sử dụng npm scripts (Khuyến nghị)

```bash
# Tạo tables
npm run migrate

# Import dữ liệu mẫu
npm run seed

# Hoặc reset toàn bộ (xóa + tạo + import)
npm run db:reset
```

#### Phương án B: Import trực tiếp SQL file

```bash
# Import migration
mysql -u root -p kodomo_weekend_navi < database/migration.sql

# Import seed data
mysql -u root -p kodomo_weekend_navi < database/seed.sql
```

### Bước 6: Kiểm tra database

```bash
# Đăng nhập database
mysql -u root -p kodomo_weekend_navi

# Kiểm tra tables
SHOW TABLES;

# Kiểm tra dữ liệu
SELECT COUNT(*) FROM spots;
SELECT * FROM spots LIMIT 5;
SELECT * FROM users;

# Thoát
EXIT;
```

Kết quả mong đợi:
```
+------------------------------+
| Tables_in_kodomo_weekend_navi|
+------------------------------+
| admin_logs                   |
| child_preferences            |
| children                     |
| favorites                    |
| kid_swipe                    |
| reviews                      |
| schedules                    |
| spot_images                  |
| spot_tags                    |
| spots                        |
| users                        |
| weather_cache                |
+------------------------------+
12 rows in set
```

---

## 🗄️ Cấu trúc Database

### 📊 Thống kê dữ liệu mẫu:

- **4 Users** (1 Admin + 3 Parents)
- **4 Children** (Hồ sơ trẻ em từ 3-7 tuổi)
- **10 Spots** (Địa điểm tại Tokyo)
- **10 Reviews** (Đánh giá 4-5 sao)
- **7 Favorites** (Yêu thích)
- **4 Schedules** (Lịch trình)
- **10 Spot Images** (Mỗi spot 1 ảnh chính)
- **27 Spot Tags** (animals, crafts, outdoor...)
- **9 Child Preferences** (LIKE/DISLIKE tags)
- **7 Kid Swipes** (Lịch sử swipe)

### 🔑 Test Accounts:

#### Admin Account:
```
Email: admin@kodomo.com
Password: password123
Role: ADMIN
```

#### User Accounts:
```
Email: tanaka.yuki@example.com
Password: password123
Role: USER
Children: Taro (6 tuổi), Hanako (5 tuổi)

Email: sato.kenji@example.com
Password: password123
Role: USER
Children: Kenta (7 tuổi)

Email: suzuki.mai@example.com
Password: password123
Role: USER
Children: Misaki (6 tuổi)
```

### 📍 10 Địa điểm mẫu (Tokyo):

1. **Ueno Zoo** - Vườn thú nổi tiếng với panda (ZOO, 1000-3000 JPY)
2. **National Museum of Nature and Science** - Bảo tàng khoa học (MUSEUM, 1000-3000 JPY)
3. **Tokyo Skytree** - Tháp quan sát 634m (THEME_PARK, 3000-5000 JPY)
4. **Odaiba Seaside Park** - Bãi biển công viên (PARK, FREE)
5. **KidZania Tokyo** - Thành phố nghề nghiệp (INDOOR_PLAY, 3000-5000 JPY)
6. **Kasai Rinkai Aquarium** - Thủy cung với bể cá ngừ (AQUARIUM, 1000-3000 JPY)
7. **Yoyogi Park** - Công viên rộng lớn (PARK, FREE)
8. **teamLab Borderless** - Bảo tàng digital art (MUSEUM, 3000-5000 JPY)
9. **Asobono** - Khu vui chơi Tokyo Dome City (INDOOR_PLAY, 1000-3000 JPY)
10. **Inokashira Park Zoo** - Vườn thú nhỏ (ZOO, UNDER_1000 JPY)

---

## 🔧 Các lệnh Database hữu ích

### Xem cấu trúc table:

```sql
-- Xem structure của table spots
DESCRIBE spots;

-- Xem indexes
SHOW INDEX FROM spots;

-- Xem triggers
SHOW TRIGGERS;
```

### Query dữ liệu mẫu:

```sql
-- Top rated spots
SELECT name, average_rating, total_reviews 
FROM spots 
ORDER BY average_rating DESC 
LIMIT 5;

-- Spots có nhiều reviews nhất
SELECT s.name, COUNT(r.review_id) as review_count
FROM spots s
LEFT JOIN reviews r ON s.spot_id = r.spot_id
GROUP BY s.spot_id
ORDER BY review_count DESC;

-- Users có nhiều favorites nhất
SELECT u.first_name, u.last_name, COUNT(f.favorite_id) as fav_count
FROM users u
LEFT JOIN favorites f ON u.user_id = f.user_id
GROUP BY u.user_id
ORDER BY fav_count DESC;
```

### Backup database:

```bash
# Backup toàn bộ
mysqldump -u root -p kodomo_weekend_navi > backup_$(date +%Y%m%d).sql

# Restore từ backup
mysql -u root -p kodomo_weekend_navi < backup_20251111.sql
```

---

## 🐛 Troubleshooting

### ❌ Lỗi: "Access denied for user 'root'@'localhost'"

**Giải pháp:**
```bash
# Reset MySQL root password
sudo mysql

mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
mysql> FLUSH PRIVILEGES;
mysql> EXIT;
```

### ❌ Lỗi: "ER_NOT_SUPPORTED_AUTH_MODE"

**Giải pháp:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### ❌ Lỗi: "Can't connect to MySQL server"

**Giải pháp:**
```bash
# Ubuntu/Debian
sudo service mysql start
sudo service mysql status

# MacOS
brew services start mysql
brew services list
```

### ❌ Lỗi: "Database already exists"

**Giải pháp:**
```bash
# Xóa và tạo lại
mysql -u root -p

mysql> DROP DATABASE kodomo_weekend_navi;
mysql> CREATE DATABASE kodomo_weekend_navi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql> EXIT;

# Sau đó chạy lại migration
npm run migrate
npm run seed
```

### ❌ Tables bị thiếu hoặc lỗi cấu trúc

**Giải pháp:**
```bash
# Reset toàn bộ database
npm run db:reset
```

---

## 📊 Kiểm tra sau khi setup

### Test 1: Kiểm tra số lượng records

```sql
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM children) as children,
    (SELECT COUNT(*) FROM spots) as spots,
    (SELECT COUNT(*) FROM reviews) as reviews,
    (SELECT COUNT(*) FROM favorites) as favorites,
    (SELECT COUNT(*) FROM schedules) as schedules,
    (SELECT COUNT(*) FROM spot_tags) as tags,
    (SELECT COUNT(*) FROM kid_swipe) as swipes;
```

Kết quả mong đợi:
```
+-------+----------+-------+---------+-----------+-----------+------+--------+
| users | children | spots | reviews | favorites | schedules | tags | swipes |
+-------+----------+-------+---------+-----------+-----------+------+--------+
|     4 |        4 |    10 |      10 |         7 |         4 |   27 |      7 |
+-------+----------+-------+---------+-----------+-----------+------+--------+
```

### Test 2: Kiểm tra foreign keys

```sql
-- Kiểm tra reviews liên kết đúng với spots
SELECT r.review_id, s.name, r.rating, r.comment
FROM reviews r
JOIN spots s ON r.spot_id = s.spot_id
LIMIT 5;
```

### Test 3: Kiểm tra Kids Swipe workflow

```sql
-- Xem preferences hiện tại của Taro (child_id = 1)
SELECT * FROM child_preferences WHERE child_id = 1;

-- Xem spots phù hợp với Taro (có tag 'animals')
SELECT s.name, GROUP_CONCAT(st.tag_name) as tags
FROM spots s
JOIN spot_tags st ON s.spot_id = st.spot_id
WHERE st.tag_name IN ('animals', 'outdoor')
GROUP BY s.spot_id;

-- Xem lịch sử swipe
SELECT c.name, ks.tag_name, ks.action, ks.created_at
FROM kid_swipe ks
JOIN children c ON ks.child_id = c.child_id
ORDER BY ks.created_at DESC
LIMIT 10;
```

---

## 🎯 Next Steps

Sau khi setup database thành công:

1. ✅ Chạy server: `npm run dev`
2. ✅ Test API: `curl http://localhost:3000/health`
3. ✅ Xem database schema: `backend/database/DATABASE_SCHEMA.md`
4. ✅ Test Auth API: POST `/api/auth/login` với account có sẵn
5. ✅ Bắt đầu develop API endpoints tiếp theo

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:

1. MySQL có đang chạy không: `sudo service mysql status`
2. Thông tin `.env` có đúng không
3. User MySQL có quyền CREATE DATABASE không
4. Port 3306 có bị block không

---

**✨ Chúc bạn setup thành công!**
