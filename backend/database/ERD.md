# 🗄️ Database ERD - Kodomo Weekend Navi

> Cẩm nang đi chơi cuối tuần cùng con - Database Schema Documentation

---

## 📊 Database Overview

| Property | Value |
|----------|-------|
| **Database Name** | `kodomo_weekend_navi` |
| **Character Set** | `utf8mb4` |
| **Collation** | `utf8mb4_unicode_ci` |
| **Total Tables** | 17 |
| **Total Views** | 2 |
| **Total Triggers** | 3 |
| **Engine** | InnoDB |

---

## 🎨 Visual ERD Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          KODOMO WEEKEND NAVI                            │
│                        Database Architecture                            │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────┐
│     USERS      │◄─────────────────┐
│ ============== │                  │
│ •user_id (PK)  │                  │
│  email (UQ)    │                  │
│  password_hash │                  │
│  first_name    │                  │
│  last_name     │                  │
│  role (ENUM)   │                  │
│  status        │                  │
│  location_lat  │                  │
│  location_lng  │                  │
└────────┬───────┘                  │
         │                          │
         │ 1:N                      │ 1:N (Admin creates)
         │                          │
         ▼                          │
┌────────────────┐          ┌───────────────┐
│   CHILDREN     │          │    SPOTS      │◄──────┐
│ ============== │          │ ============= │       │
│ •child_id (PK) │          │ •spot_id (PK) │       │
│  user_id (FK)  │          │  name         │       │
│  name          │          │  description  │       │
│  birth_date    │◄─────┐   │  category     │       │
│  age           │      │   │  min_age      │       │
│  avatar_url    │      │   │  max_age      │       │
│  notes         │      │   │  price_range  │       │
└────────┬───────┘      │   │  is_indoor    │       │
         │              │   │  address      │       │
         │ 1:N          │   │  latitude     │       │
         │              │   │  longitude    │       │
         ▼              │   │  avg_rating   │       │
┌─────────────────┐    │   │  total_reviews│       │
│CHILD_PREFERENCES│    │   │  status       │       │
│ =============== │    │   └───────┬───────┘       │
│ •preference_id  │    │           │               │
│  child_id (FK)  │    │           │ 1:N           │
│  type (ENUM)    │    │           │               │
│  tag_name       │    │    ┌──────┴──────┐        │
└─────────────────┘    │    │             │        │
                       │    ▼             ▼        │
┌─────────────────┐    │ ┌─────────┐ ┌──────────┐ │
│KIDSWIPE_HISTORY │────┤ │SPOT_IMG │ │SPOT_TAGS │ │
│ =============== │    │ │=========│ │==========│ │
│ •swipe_id (PK)  │    │ │•img_id  │ │•tag_id   │ │
│  user_id (FK)   │    │ │ spot_id │ │ spot_id  │ │
│  child_id (FK)  │    │ │ url     │ │ tag_name │ │
│  spot_id (FK)   │    │ │ is_main │ └──────────┘ │
│  action (ENUM)  │    │ └─────────┘              │
└─────────────────┘    │         ▲                │
                       │         │                │
┌─────────────────┐    │         │ 1:N            │
│RECOMMENDATIONS  │────┘    ┌────┴──────┐         │
│ =============== │         │SPOT_FACIL │         │
│ •recommend_id   │         │===========│         │
│  user_id (FK)   │         │•facil_id  │         │
│  child_id (FK)  │         │ spot_id   │         │
│  spot_id (FK)   │         │ name      │         │
│  score          │         │ available │         │
│  factors (JSON) │         └───────────┘         │
│  expires_at     │                               │
└─────────────────┘                               │
         │                                        │
         │                                        │
         │                    ┌───────────────────┘
         │                    │
         │                    ▼
         │           ┌────────────────┐
         └──────────►│    REVIEWS     │
                     │ ============== │
                     │ •review_id (PK)│
                     │  spot_id (FK)  │
                     │  user_id (FK)  │
                     │  rating (1-5)  │
                     │  comment       │
                     │  is_hidden     │
                     └────────┬───────┘
                              │
                              │ 1:N
                       ┌──────┴────────┐
                       │               │
                       ▼               ▼
              ┌──────────────┐ ┌──────────────┐
              │ REVIEW_IMGS  │ │ REVIEW_FACIL │
              │ ============ │ │ ============ │
              │ •img_id      │ │ •facil_id    │
              │  review_id   │ │  review_id   │
              │  url         │ │  name        │
              └──────────────┘ └──────────────┘

┌────────────────┐          ┌────────────────┐
│   FAVORITES    │          │   SCHEDULES    │
│ ============== │          │ ============== │
│ •favorite_id   │          │ •schedule_id   │
│  user_id (FK)  │          │  user_id (FK)  │
│  spot_id (FK)  │          │  spot_id (FK)  │
│  collection    │          │  date          │
│  saved_at      │          │  time_slot     │
└────────────────┘          │  status (ENUM) │
                            │  notes         │
                            └────────────────┘

┌─────────────────┐         ┌──────────────────┐
│  KPIs_METRICS   │         │ADMIN_ACTIVITY_LOG│
│ =============== │         │ ================ │
│ •metric_id (PK) │         │ •log_id (PK)     │
│  date           │         │  admin_id (FK)   │
│  metric_name    │         │  action (ENUM)   │
│  value          │         │  target_type     │
│  time_period    │         │  target_id       │
└─────────────────┘         │  details (JSON)  │
                            └──────────────────┘

┌──────────────────┐
│WEATHER_CONDITIONS│
│ ================ │
│ •weather_id (PK) │
│  date            │
│  location        │
│  condition (ENUM)│
│  temperature     │
└──────────────────┘
```

---

## 🔗 Relationship Summary

### Core Entities

| Parent | Relationship | Child | Type |
|--------|--------------|-------|------|
| **users** | `1:N` | children | Parent-Child |
| **users** | `1:N` | reviews | User Reviews |
| **users** | `1:N` | favorites | User Favorites |
| **users** | `1:N` | schedules | User Plans |
| **users** | `1:N` | kidswipe_history | Swipe Actions |
| **users** | `1:N` | recommendations | Personalized |
| **children** | `1:N` | child_preferences | Likes/Dislikes |
| **children** | `1:N` | kidswipe_history | Kid's Choice |
| **spots** | `1:N` | spot_images | Photos |
| **spots** | `1:N` | spot_facilities | Amenities |
| **spots** | `1:N` | spot_tags | Tags |
| **spots** | `1:N` | reviews | User Reviews |
| **spots** | `1:N` | favorites | Bookmarks |
| **spots** | `1:N` | schedules | Plans |
| **reviews** | `1:N` | review_images | Review Photos |
| **reviews** | `1:N` | review_facilities | Facility Checks |

---

## 📚 17 Tables Chi Tiết

### 👤 **1. USERS** - Quản lý người dùng (Cha mẹ)

**Mục đích:** Lưu thông tin tài khoản, vị trí, phân quyền

**Columns chính:**
- `user_id` (PK) - ID duy nhất
- `email` (UNIQUE) - Đăng nhập
- `password_hash` - Mật khẩu đã mã hóa bcrypt
- `role` - USER hoặc ADMIN
- `status` - ACTIVE hoặc BANNED
- `location_lat/lng` - Vị trí hiện tại (để gợi ý địa điểm gần)

**Use cases:**
- Đăng ký/đăng nhập
- Lưu vị trí để recommend địa điểm gần
- Phân quyền admin/user

---

### 👶 **2. CHILDREN** - Hồ sơ trẻ em

**Mục đích:** Mỗi user có thể có nhiều con, lưu thông tin để gợi ý phù hợp

**Columns chính:**
- `child_id` (PK)
- `user_id` (FK → users)
- `name`, `birth_date`
- `age` - Tự động tính từ birth_date
- `notes` - Ghi chú sức khỏe/đặc biệt

**Use cases:**
- Gợi ý địa điểm phù hợp với độ tuổi
- Filter spots theo age range
- Kids swipe feature

---

### ❤️ **3. CHILD_PREFERENCES** - Sở thích của trẻ

**Mục đích:** Lưu những gì trẻ THÍCH và KHÔNG THÍCH

**Columns chính:**
- `child_id` (FK → children)
- `preference_type` - LIKE hoặc DISLIKE
- `tag_name` - animals, sports, crafts, water...

**Use cases:**
- Recommendation algorithm
- Kids swipe (swipe right = LIKE, left = DISLIKE)
- Filter spots

---

### 📍 **4. SPOTS** - Địa điểm vui chơi

**Mục đích:** Core table - lưu toàn bộ thông tin địa điểm

**Columns chính:**
- `spot_id` (PK)
- `name`, `description`
- `category` - MUSEUM, PARK, ZOO, AQUARIUM, INDOOR_PLAY...
- `min_age`, `max_age` - Phù hợp với độ tuổi
- `price_range` - FREE, UNDER_1000, 1000_3000...
- `is_indoor` - Trong nhà/ngoài trời
- `latitude`, `longitude` - Vị trí GPS
- `weather_suitable` - Phù hợp thời tiết nào
- `average_rating`, `total_reviews` - Tự động update từ reviews
- `operating_hours` (JSON) - Giờ mở cửa từng ngày

**Use cases:**
- List/detail địa điểm
- Search, filter (age, price, indoor, weather)
- Calculate distance
- Recommendation

---

### 🖼️ **5. SPOT_IMAGES** - Ảnh địa điểm

**Mục đích:** Mỗi spot có nhiều ảnh

**Columns:**
- `spot_id` (FK)
- `image_url`
- `is_main` - Ảnh đại diện
- `display_order` - Thứ tự hiển thị

---

### 🏢 **6. SPOT_FACILITIES** - Tiện nghi

**Mục đích:** Liệt kê tiện nghi có tại địa điểm

**Examples:** PARKING, NURSING_ROOM, STROLLER_ACCESSIBLE, RESTROOM, CAFE...

**Quan trọng cho:** Cha mẹ có em bé

---

### 🏷️ **7. SPOT_TAGS** - Tags phân loại

**Mục đích:** Tags để filter và match với preferences

**Examples:** 雨の日OK, 無料, 室内, 駅近, 動物, 工作...

---

### ⭐ **8. REVIEWS** - Đánh giá của user

**Mục đích:** User đánh giá sau khi đi

**Columns chính:**
- `spot_id`, `user_id` (FK)
- `rating` - 1-5 sao
- `comment` - Max 140 ký tự (giống Twitter)
- `is_hidden` - Admin có thể ẩn review vi phạm

**Triggers:**
- Auto update `spots.average_rating` khi thêm/sửa/xóa review

---

### 📸 **9-10. REVIEW_IMAGES & REVIEW_FACILITIES**

- Review có thể kèm ảnh
- Review có thể check các facilities đã dùng (CLEAN, SAFE, KID_FRIENDLY...)

---

### ❤️ **11. FAVORITES** - Yêu thích

**Mục đích:** User save địa điểm để xem lại

**Features:**
- `collection_tag` - Phân loại (Indoor, Free, Near...)
- Unique (user_id, spot_id) - Không duplicate

---

### 📅 **12. SCHEDULES** - Lịch trình

**Mục đích:** User lên kế hoạch đi chơi

**Columns chính:**
- `scheduled_date` - Ngày dự kiến
- `time_slot` - AM, PM, FULL_DAY
- `status` - PLANNED, COMPLETED, CANCELLED
- `reminder_enabled` - Nhắc nhở

**Use cases:**
- Calendar view
- Track đã đi chưa
- Notifications

---

### 👶💚 **13. KIDSWIPE_HISTORY** - Lịch sử Kids Swipe

**Mục đích:** Tính năng cho trẻ swipe chọn địa điểm (như Tinder)

**Columns:**
- `child_id`, `spot_id`
- `action` - LIKE hoặc SKIP

**Use cases:**
- Học sở thích của trẻ
- Improve recommendations
- Analytics

---

### 🎯 **14. RECOMMENDATIONS** - Cache gợi ý

**Mục đích:** Cache kết quả recommendation (optimize performance)

**Columns:**
- `score` - Điểm phù hợp (0-100)
- `factors` (JSON) - Lý do: {"distance": "5km", "age_match": true, "weather": "good"}
- `expires_at` - TTL để refresh

**Recommendation Algorithm xét:**
1. **Distance** - Gần nhà
2. **Age match** - Phù hợp độ tuổi
3. **Weather** - Thời tiết hôm nay
4. **Preferences** - Sở thích trẻ
5. **Rating** - Đánh giá cao
6. **Price** - Miễn phí/giá rẻ ưu tiên

---

### 📊 **15. KPIs_METRICS** - Tracking metrics

**Mục đích:** Analytics, dashboard admin

**Metrics examples:**
- Average Decision Time
- Route Activation Rate
- Monthly Repeat Rate
- User Retention

---

### 🔒 **16. ADMIN_ACTIVITY_LOGS** - Admin audit trail

**Mục đích:** Theo dõi hành động admin

**Actions:** CREATE_SPOT, EDIT_SPOT, DELETE_SPOT, HIDE_REVIEW, BAN_USER...

---

### 🌦️ **17. WEATHER_CONDITIONS** - Weather cache

**Mục đích:** Cache weather từ API, tránh gọi nhiều lần

**Use cases:**
- Filter spots phù hợp thời tiết
- Recommendations
- Reduce API costs

---

## 🔄 Database Features

### 🔥 Triggers (3 triggers)

1. **update_spot_rating_after_insert** - Auto calculate rating khi có review mới
2. **update_spot_rating_after_update** - Re-calculate khi review bị sửa
3. **update_spot_rating_after_delete** - Re-calculate khi xóa review

### 👁️ Views (2 views)

1. **view_top_rated_spots** - Top spots có rating cao
2. **view_popular_spots** - Spots được save nhiều nhất

---

## ⚡ Performance Optimization

### Indexes quan trọng:

1. **users.idx_email** - Login nhanh
2. **spots.idx_location** - Tìm địa điểm gần (latitude, longitude)
3. **spots.FULLTEXT(name, description)** - Search text
4. **spots.idx_category** - Filter category
5. **reviews.idx_spot_id** - List reviews
6. **schedules.idx_user_date** - Calendar view

---

## 🎯 Business Logic Examples

### Tìm địa điểm phù hợp cho trẻ:

```sql
SELECT s.*,
  -- Tính khoảng cách
  (6371 * acos(cos(radians(user_lat)) * cos(radians(s.latitude)) 
    * cos(radians(s.longitude) - radians(user_lng)) 
    + sin(radians(user_lat)) * sin(radians(s.latitude)))) AS distance,
  -- Điểm phù hợp tuổi
  CASE WHEN child_age BETWEEN s.min_age AND s.max_age THEN 20 ELSE 0 END AS age_score,
  -- Điểm rating
  s.average_rating * 4 AS rating_score
FROM spots s
WHERE s.status = 'PUBLIC'
  AND s.is_indoor = (CASE WHEN weather='RAINY' THEN TRUE ELSE s.is_indoor END)
ORDER BY (age_score + rating_score - distance) DESC
LIMIT 20;
```

### Spots phổ biến tuần này:

```sql
SELECT s.name, COUNT(sch.schedule_id) as scheduled_count
FROM spots s
INNER JOIN schedules sch ON s.spot_id = sch.spot_id
WHERE sch.scheduled_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
GROUP BY s.spot_id
ORDER BY scheduled_count DESC;
```

---

## 🚀 Roadmap

### Phase 2:
- [ ] Soft delete cho critical tables
- [ ] Read replicas cho scalability
- [ ] Partitioning cho large tables

### Phase 3:
- [ ] ElasticSearch cho advanced search
- [ ] Redis cache layer
- [ ] Real-time notifications

---

## 📖 Giải thích các khái niệm

| Term | Giải thích |
|------|------------|
| **Spot** | Địa điểm vui chơi (zoo, museum, park, aquarium...) |
| **KidSwipe** | Tính năng cho trẻ swipe left/right chọn địa điểm (như Tinder) |
| **Recommendation** | Gợi ý địa điểm phù hợp dựa trên AI/algorithm |
| **Schedule** | Lịch trình đã lên kế hoạch |
| **Favorite** | Địa điểm yêu thích (bookmark) |
| **Review** | Đánh giá sau khi đã đi |
| **Facilities** | Tiện nghi (parking, restroom, nursing room...) |

---

**Version:** 2.0  
**Last Updated:** November 11, 2025  
**Author:** ITSS1 Team
