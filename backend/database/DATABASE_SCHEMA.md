# 🗄️ Database Schema Documentation - Kodomo Weekend Navi v3

> **Phiên bản:** 3.0 (Simplified - 12 tables)  
> **Ngày cập nhật:** 12/11/2025  
> **Database:** MySQL 8.0+  
> **Character Set:** utf8mb4_unicode_ci

---


## 📊 Danh sách 12 bảng

### 🔐 **Authentication & Users**
1. **users** - Thông tin người dùng và admin
2. **children** - Hồ sơ trẻ em của user
3. **child_preferences** - Sở thích tags của trẻ (từ Kids Swipe)

### 📍 **Spots & Content**
4. **spots** - Địa điểm vui chơi
5. **spot_images** - Ảnh địa điểm (nhiều ảnh/spot)
6. **spot_tags** - Tags linh hoạt cho spots

### 💬 **User Interactions**
7. **reviews** - Đánh giá địa điểm (1 ảnh + JSON facilities)
8. **favorites** - Yêu thích địa điểm
9. **schedules** - Lịch trình đi chơi

### 🎯 **Features**
10. **kid_swipe** - Lịch sử swipe tags của trẻ
11. **weather_cache** - Cache thông tin thời tiết
12. **admin_logs** - Audit trail và metrics

---

## 📐 Sơ đồ ERD (Entity Relationship Diagram)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────────┐
│   users     │1      n │   children   │1      n │  child_preferences  │
│─────────────│◄────────│──────────────│◄────────│─────────────────────│
│ user_id (PK)│         │ child_id (PK)│         │ preference_id (PK)  │
│ email       │         │ user_id (FK) │         │ child_id (FK)       │
│ password    │         │ name         │         │ tag_name            │
│ role        │         │ birth_date   │         │ preference_type     │
└─────────────┘         └──────────────┘         └─────────────────────┘
       │                       │
       │                       │1
       │                       ▼
       │                ┌──────────────┐
       │                │  kid_swipe   │
       │                │──────────────│
       │                │ swipe_id (PK)│
       │                │ child_id (FK)│
       │                │ tag_name     │
       │                │ action       │
       │                └──────────────┘
       │
       │1
       │
       ▼n
┌──────────────┐1      n┌──────────────┐1      n┌──────────────┐
│   spots      │◄────────│ spot_images  │        │  spot_tags   │
│──────────────│         │──────────────│        │──────────────│
│ spot_id (PK) │         │ image_id (PK)│        │ tag_id (PK)  │
│ name         │         │ spot_id (FK) │        │ spot_id (FK) │
│ category     │         │ image_url    │        │ tag_name     │
│ facilities   │(JSON)   │ is_main      │        └──────────────┘
│ rating       │         └──────────────┘                │
└──────────────┘                                         │
       │                                                 │
       │1                                                │
       │                                                 │
       ▼n                                                │
┌──────────────┐                                         │
│   reviews    │                                         │
│──────────────│                                         │
│ review_id    │                                         │
│ spot_id (FK) │                                         │
│ user_id (FK) │                  Tags matching         │
│ image_url    │(1 img)            for recommendations  │
│ facilities   │(JSON)                    │              │
└──────────────┘                          ▼              │
       │                        ┌─────────────────────┐  │
       │1                       │ Recommendation      │  │
       │                        │ Algorithm           │◄─┘
       ▼n                       │ (Application Layer) │
┌──────────────┐                └─────────────────────┘
│  favorites   │
│──────────────│
│ user_id (FK) │
│ spot_id (FK) │
└──────────────┘
       │
       │1
       ▼n
┌──────────────┐
│  schedules   │
│──────────────│
│ schedule_id  │
│ user_id (FK) │
│ spot_id (FK) │
│ date         │
└──────────────┘

┌──────────────┐        ┌──────────────┐
│weather_cache │        │ admin_logs   │
│──────────────│        │──────────────│
│ date         │        │ log_id (PK)  │
│ location     │        │ admin_id(FK) │
│ weather      │        │ action       │
└──────────────┘        │ details(JSON)│
                        └──────────────┘
```

---

## 🔍 Chi tiết từng bảng

### 1. **users** - Người dùng

**Mục đích:** Quản lý tài khoản người dùng và admin

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `user_id` | INT | PK, AUTO_INCREMENT | ID người dùng |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu đã hash (bcrypt) |
| `first_name` | VARCHAR(100) | NOT NULL | Tên |
| `last_name` | VARCHAR(100) | NOT NULL | Họ |
| `role` | ENUM | 'USER', 'ADMIN' | Vai trò |
| `status` | ENUM | 'ACTIVE', 'INACTIVE', 'BANNED' | Trạng thái |
| `agreement` | BOOLEAN | DEFAULT FALSE | Đồng ý điều khoản |
| `location_lat` | DECIMAL(10,8) | NULL | Vĩ độ vị trí |
| `location_lng` | DECIMAL(11,8) | NULL | Kinh độ vị trí |
| `location_name` | VARCHAR(255) | NULL | Tên khu vực |
| `last_login_at` | TIMESTAMP | NULL | Lần đăng nhập cuối |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | ON UPDATE | Ngày cập nhật |

**Indexes:**
- `idx_email` (email)
- `idx_status` (status)
- `idx_role` (role)
- `idx_location` (location_lat, location_lng)

**Sample Data:**
```sql
-- Admin
email: admin@kodomo.com
password: password123
role: ADMIN

-- Users
email: tanaka.yuki@example.com
password: password123
role: USER
```

---

### 2. **children** - Hồ sơ trẻ em

**Mục đích:** Lưu thông tin con của user

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `child_id` | INT | PK, AUTO_INCREMENT | ID trẻ |
| `user_id` | INT | FK → users(user_id), ON DELETE CASCADE | ID cha/mẹ |
| `name` | VARCHAR(100) | NOT NULL | Tên trẻ |
| `birth_date` | DATE | NOT NULL | Ngày sinh |
| `avatar_url` | VARCHAR(255) | NULL | Ảnh đại diện |
| `notes` | TEXT | NULL | Ghi chú (dị ứng, sở thích) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | ON UPDATE | Ngày cập nhật |

**Indexes:**
- `idx_user_id` (user_id)

**Business Logic:**
- Một user có thể có nhiều children
- Khi xóa user → tự động xóa children (CASCADE)
- Tuổi trẻ = YEAR(NOW()) - YEAR(birth_date)

---

### 3. **child_preferences** - Sở thích trẻ

**Mục đích:** Lưu tags LIKE/DISLIKE của trẻ từ Kids Swipe feature

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `preference_id` | INT | PK, AUTO_INCREMENT | ID preference |
| `child_id` | INT | FK → children, ON DELETE CASCADE | ID trẻ |
| `preference_type` | ENUM | 'LIKE', 'DISLIKE' | Loại sở thích |
| `tag_name` | VARCHAR(50) | NOT NULL | Tên tag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_child_id` (child_id)
- `idx_tag_name` (tag_name)
- `unique_child_tag` (child_id, tag_name) - UNIQUE

**Business Logic:**
- Một trẻ chỉ có 1 preference cho 1 tag (LIKE hoặc DISLIKE)
- Dùng cho recommendation algorithm
- Tags: animals, crafts, outdoor, indoor, sports, water, educational...

**Example:**
```sql
-- Taro (6 tuổi) thích:
child_id: 1, tag: 'animals', type: 'LIKE'
child_id: 1, tag: 'outdoor', type: 'LIKE'
child_id: 1, tag: 'indoor', type: 'DISLIKE'
```

---

### 4. **spots** - Địa điểm vui chơi

**Mục đích:** Lưu thông tin địa điểm

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `spot_id` | INT | PK, AUTO_INCREMENT | ID địa điểm |
| `name` | VARCHAR(255) | NOT NULL | Tên địa điểm |
| `description` | TEXT | NULL | Mô tả chi tiết |
| `category` | ENUM | 'PARK', 'MUSEUM', 'ZOO', 'AQUARIUM', 'THEME_PARK', 'INDOOR_PLAY', 'OTHER' | Loại địa điểm |
| `min_age` | INT | DEFAULT 0 | Độ tuổi tối thiểu |
| `max_age` | INT | DEFAULT 18 | Độ tuổi tối đa |
| `price_range` | ENUM | 'FREE', 'UNDER_1000', '1000_3000', '3000_5000', 'OVER_5000' | Mức giá (JPY) |
| `is_indoor` | BOOLEAN | DEFAULT FALSE | Trong nhà/ngoài trời |
| `address` | VARCHAR(255) | NULL | Địa chỉ |
| `latitude` | DECIMAL(10,8) | NULL | Vĩ độ |
| `longitude` | DECIMAL(11,8) | NULL | Kinh độ |
| `google_maps_url` | VARCHAR(255) | NULL | Link Google Maps |
| `operating_hours` | JSON | NULL | Giờ mở cửa theo ngày |
| `is_open_today` | BOOLEAN | DEFAULT TRUE | Có mở cửa hôm nay |
| `weather_suitable` | ENUM | 'ALL_WEATHER', 'SUNNY_ONLY', 'RAIN_OK' | Thời tiết phù hợp |
| `estimated_visit_duration` | INT | NULL | Thời gian tham quan (phút) |
| `facilities` | JSON | NULL | Tiện nghi |
| `status` | ENUM | 'PUBLIC', 'PRIVATE', 'DRAFT' | Trạng thái |
| `average_rating` | DECIMAL(3,2) | DEFAULT 0 | Điểm trung bình (1-5) |
| `review_count` | INT | DEFAULT 0 | Số lượng reviews |
| `view_count` | INT | DEFAULT 0 | Lượt xem |
| `favorite_count` | INT | DEFAULT 0 | Lượt yêu thích |
| `created_by_admin_id` | INT | FK → users, ON DELETE SET NULL | Admin tạo |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | ON UPDATE | Ngày cập nhật |

**Indexes:**
- `idx_category` (category)
- `idx_location` (latitude, longitude)
- `idx_rating` (average_rating)
- `idx_status` (status)

**JSON Fields:**

**operating_hours:**
```json
{
  "monday": "9:30-17:00",
  "tuesday": "9:30-17:00",
  "wednesday": "Closed",
  "thursday": "9:30-17:00",
  "friday": "9:30-17:00",
  "saturday": "9:30-17:00",
  "sunday": "9:30-17:00"
}
```

**facilities:**
```json
{
  "parking": true,
  "nursing_room": true,
  "stroller": true,
  "restroom": true,
  "cafe": true
}
```

**Business Logic:**
- `average_rating` và `review_count` tự động update bằng TRIGGER khi thêm/xóa/sửa reviews
- `favorite_count` tự động tăng/giảm khi thêm/xóa favorites

---

### 5. **spot_images** - Ảnh địa điểm

**Mục đích:** Lưu nhiều ảnh cho mỗi địa điểm

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `image_id` | INT | PK, AUTO_INCREMENT | ID ảnh |
| `spot_id` | INT | FK → spots, ON DELETE CASCADE | ID địa điểm |
| `image_url` | VARCHAR(255) | NOT NULL | URL ảnh |
| `is_main` | BOOLEAN | DEFAULT FALSE | Ảnh đại diện |
| `display_order` | INT | DEFAULT 0 | Thứ tự hiển thị |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_spot_id` (spot_id)
- `idx_main` (is_main)

**Business Logic:**
- Mỗi spot nên có 1 ảnh `is_main = TRUE`
- Ảnh sắp xếp theo `display_order`

---

### 6. **spot_tags** - Tags địa điểm

**Mục đích:** Gắn tags linh hoạt cho spots (dùng cho recommendation)

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `tag_id` | INT | PK, AUTO_INCREMENT | ID tag |
| `spot_id` | INT | FK → spots, ON DELETE CASCADE | ID địa điểm |
| `tag_name` | VARCHAR(50) | NOT NULL | Tên tag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_spot_id` (spot_id)
- `idx_tag_name` (tag_name)
- `unique_spot_tag` (spot_id, tag_name) - UNIQUE

**Common Tags:**
- animals, crafts, outdoor, indoor, sports, water
- educational, roleplay, art, digital, picnic
- free, cheap, rain_ok, sightseeing

**Recommendation Logic:**
```
1. Lấy child_preferences của trẻ (LIKE tags)
2. Tìm spots có spot_tags match với LIKE tags
3. Loại spots có tags trong DISLIKE
4. Sắp xếp theo số lượng tags match
```

---

### 7. **reviews** - Đánh giá

**Mục đích:** User đánh giá địa điểm (đơn giản hóa với 1 ảnh + JSON)

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `review_id` | INT | PK, AUTO_INCREMENT | ID review |
| `spot_id` | INT | FK → spots, ON DELETE CASCADE | ID địa điểm |
| `user_id` | INT | FK → users, ON DELETE CASCADE | ID người đánh giá |
| `rating` | INT | NOT NULL, CHECK (1-5) | Điểm đánh giá |
| `comment` | TEXT | NULL | Nhận xét |
| `image_url` | VARCHAR(255) | NULL | 1 ảnh (đơn giản hóa) |
| `facilities_check` | JSON | NULL | Đánh giá tiện nghi |
| `report_count` | INT | DEFAULT 0 | Số lượt báo cáo |
| `is_hidden` | BOOLEAN | DEFAULT FALSE | Ẩn review (admin) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | ON UPDATE | Ngày cập nhật |

**Indexes:**
- `idx_spot_id` (spot_id)
- `idx_user_id` (user_id)
- `idx_rating` (rating)
- `idx_created` (created_at)

**JSON Field - facilities_check:**
```json
{
  "clean": true,
  "safe": true,
  "kid_friendly": true,
  "educational": false
}
```

**TRIGGERS:**
- `after_review_insert` → Update spot rating
- `after_review_update` → Update spot rating
- `after_review_delete` → Update spot rating

---

### 8. **favorites** - Yêu thích

**Mục đích:** User bookmark địa điểm

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `favorite_id` | INT | PK, AUTO_INCREMENT | ID favorite |
| `user_id` | INT | FK → users, ON DELETE CASCADE | ID user |
| `spot_id` | INT | FK → spots, ON DELETE CASCADE | ID địa điểm |
| `collection_tag` | VARCHAR(100) | NULL | Tag phân loại |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_user_id` (user_id)
- `idx_spot_id` (spot_id)
- `unique_user_spot` (user_id, spot_id) - UNIQUE

**Business Logic:**
- User không thể favorite trùng spot
- `collection_tag` dùng để nhóm favorites (VD: "Animals", "Indoor", "Free")

---

### 9. **schedules** - Lịch trình

**Mục đích:** User lên lịch đi chơi

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `schedule_id` | INT | PK, AUTO_INCREMENT | ID schedule |
| `user_id` | INT | FK → users, ON DELETE CASCADE | ID user |
| `spot_id` | INT | FK → spots, ON DELETE CASCADE | ID địa điểm |
| `scheduled_date` | DATE | NOT NULL | Ngày dự định đi |
| `time_slot` | ENUM | 'AM', 'PM', 'FULL_DAY' | Khung giờ |
| `status` | ENUM | 'PLANNED', 'COMPLETED', 'CANCELLED' | Trạng thái |
| `notes` | TEXT | NULL | Ghi chú |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | ON UPDATE | Ngày cập nhật |

**Indexes:**
- `idx_user_id` (user_id)
- `idx_spot_id` (spot_id)
- `idx_date` (scheduled_date)

---

### 10. **kid_swipe** - Lịch sử Kids Swipe

**Mục đích:** Lưu lịch sử trẻ swipe tags (LIKE/SKIP)

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `swipe_id` | INT | PK, AUTO_INCREMENT | ID swipe |
| `child_id` | INT | FK → children, ON DELETE CASCADE | ID trẻ |
| `tag_name` | VARCHAR(50) | NOT NULL | Tên tag |
| `action` | ENUM | 'LIKE', 'SKIP' | Hành động |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày swipe |

**Indexes:**
- `idx_child_id` (child_id)
- `idx_tag_name` (tag_name)
- `idx_created` (created_at)

**Business Logic:**
- Lưu tất cả swipes (không unique, có thể swipe tag nhiều lần)
- Dùng để phân tích hành vi và cập nhật `child_preferences`
- Workflow: kid_swipe → update child_preferences → recommendation

---

### 11. **weather_cache** - Cache thời tiết

**Mục đích:** Cache thông tin thời tiết để giảm API calls

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `weather_id` | INT | PK, AUTO_INCREMENT | ID weather |
| `date` | DATE | NOT NULL | Ngày |
| `location` | VARCHAR(100) | NOT NULL | Khu vực |
| `weather_condition` | ENUM | 'SUNNY', 'CLOUDY', 'RAINY', 'SNOWY' | Thời tiết |
| `temperature` | DECIMAL(4,1) | NULL | Nhiệt độ (°C) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cache |

**Indexes:**
- `idx_date` (date)
- `idx_location` (location)
- `unique_date_location` (date, location) - UNIQUE

**Business Logic:**
- Cache 1 ngày
- Dùng để filter spots theo `weather_suitable`

---

### 12. **admin_logs** - Admin Activity Logs

**Mục đích:** Audit trail và metrics

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|-------|
| `log_id` | INT | PK, AUTO_INCREMENT | ID log |
| `admin_id` | INT | FK → users, ON DELETE SET NULL | ID admin |
| `action` | VARCHAR(100) | NOT NULL | Hành động |
| `target_table` | VARCHAR(50) | NULL | Bảng bị tác động |
| `target_id` | INT | NULL | ID record |
| `details` | JSON | NULL | Chi tiết thay đổi |
| `ip_address` | VARCHAR(45) | NULL | IP address |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian |

**Indexes:**
- `idx_admin_id` (admin_id)
- `idx_action` (action)
- `idx_created` (created_at)

**JSON Field - details:**
```json
{
  "old_value": {...},
  "new_value": {...},
  "reason": "User banned for spam"
}
```

**Common Actions:**
- CREATE_SPOT, UPDATE_SPOT, DELETE_SPOT
- BAN_USER, UNBAN_USER
- HIDE_REVIEW, DELETE_REVIEW

---

## 🔗 Mối quan hệ (Relationships)

### One-to-Many (1:N)

```
users 1─────N children
users 1─────N reviews
users 1─────N favorites
users 1─────N schedules
users 1─────N admin_logs (admin_id)

children 1──────N child_preferences
children 1──────N kid_swipe

spots 1─────N spot_images
spots 1─────N spot_tags
spots 1─────N reviews
spots 1─────N favorites
spots 1─────N schedules
```

### Many-to-Many (M:N) - Through Junction Tables

```
users M─────favorites─────N spots
users M─────schedules─────N spots
children M──child_preferences──N tags (implicit)
spots M─────spot_tags─────N tags (implicit)
```

---

## 🎯 Use Cases chính

### 1. Kids Swipe Feature
```sql
-- Trẻ swipe LIKE tag 'animals'
INSERT INTO kid_swipe (child_id, tag_name, action) 
VALUES (1, 'animals', 'LIKE');

-- Update preferences
INSERT INTO child_preferences (child_id, tag_name, preference_type)
VALUES (1, 'animals', 'LIKE')
ON DUPLICATE KEY UPDATE preference_type = 'LIKE';
```

### 2. Recommendation Algorithm
```sql
-- Lấy spots phù hợp cho trẻ
SELECT DISTINCT s.*, COUNT(st.tag_id) as match_count
FROM spots s
JOIN spot_tags st ON s.spot_id = st.spot_id
JOIN child_preferences cp ON st.tag_name = cp.tag_name
WHERE cp.child_id = 1 
  AND cp.preference_type = 'LIKE'
  AND s.status = 'PUBLIC'
  AND s.spot_id NOT IN (
    SELECT s2.spot_id FROM spots s2
    JOIN spot_tags st2 ON s2.spot_id = st2.spot_id
    JOIN child_preferences cp2 ON st2.tag_name = cp2.tag_name
    WHERE cp2.child_id = 1 AND cp2.preference_type = 'DISLIKE'
  )
GROUP BY s.spot_id
ORDER BY match_count DESC, s.average_rating DESC
LIMIT 10;
```

### 3. Auto-update Rating
```sql
-- Trigger tự động chạy khi insert review
-- Không cần manual update
INSERT INTO reviews (spot_id, user_id, rating, comment)
VALUES (1, 2, 5, 'Great place!');

-- average_rating và review_count tự động update
```

---

## 📊 Thống kê Database

### Sample Data (Seed)

| Table | Records | Mô tả |
|-------|---------|-------|
| users | 4 | 1 admin + 3 parents |
| children | 4 | Trẻ em từ 3-7 tuổi |
| child_preferences | 9 | LIKE/DISLIKE tags |
| spots | 10 | Địa điểm Tokyo |
| spot_images | 10 | Mỗi spot 1 ảnh chính |
| spot_tags | 27 | 2-3 tags/spot |
| reviews | 10 | Đánh giá 4-5 sao |
| favorites | 7 | Yêu thích |
| schedules | 4 | Lịch trình |
| kid_swipe | 7 | Lịch sử swipe |
| weather_cache | 3 | 3 ngày Tokyo |
| admin_logs | 0 | Trống |

---

## 🚀 Migration & Seed

### Chạy Migration
```bash
cd backend
mysql -u root -p < database/migration.sql
```

### Chạy Seed
```bash
mysql -u root -p kodomo_weekend_navi < database/seed.sql
```

### Hoặc dùng npm scripts
```bash
npm run db:reset  # Drop + Create + Seed
```

---

**📅 Last Updated:** 12/11/2025  
**👤 Maintainer:** ITSS1 Team
