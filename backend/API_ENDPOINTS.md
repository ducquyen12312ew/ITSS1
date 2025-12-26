# 📚 API ENDPOINTS - KODOMO WEEKEND NAVI

> **Base URL:** `http://localhost:3000`
> 
> **Authentication:** JWT Bearer Token trong header `Authorization: Bearer <token>`

---

## 📑 Table of Contents

1. [System Health](#1-system-health)
2. [Authentication](#2-authentication)
3. [Spots](#3-spots-địa-điểm)
4. [Reviews](#4-reviews-đánh-giá)
5. [Favorites](#5-favorites-yêu-thích)
6. [Schedules](#6-schedules-lịch-trình)
7. [Children](#7-children-hồ-sơ-trẻ-em)
8. [Kids Swipe](#8-kids-swipe-tính-năng-swipe)
9. [Admin](#9-admin-dashboard--management) 🔐
10. [Smart Recommendations](#10-smart-recommendations-gợi-ý-thông-minh)
11. [Spot Management](#11-spot-management-quản-lý-địa-điểm) 🔐
12. [Review Management](#12-review-management-quản-lý-đánh-giá) 🔐
13. [User Management](#13-user-management-quản-lý-người-dùng) 🔐

---

## 1. System Health

### GET `/health`
**Kiểm tra server health**

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

### GET `/api`
**Thông tin API**

**Response:**
```json
{
  "name": "Kodomo Weekend Navi API",
  "version": "1.0.0",
  "description": "Backend API for family weekend spots",
  "endpoints": { ... }
}
```

---

## 2. Authentication

### POST `/api/auth/register`
**Đăng ký tài khoản mới**

**Request Body:**
```json
{
  "firstName": "Nguyen",
  "lastName": "Van A",
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "agreement": true,
  "role": "USER"  // optional, default: USER
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user_id": 5,
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

### POST `/api/auth/login`
**Đăng nhập**

**Request Body:**
```json
{
  "email": "buibaomoyu@gmail.com",
  "password": "B@o140804"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 2,
      "email": "buibaomoyu@gmail.com",
      "first_name": "Nguyễn",
      "last_name": "Bảo Minh",
      "role": "USER"
    }
  }
}
```

---

### POST `/api/auth/logout`
**Đăng xuất** 🔐

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Đã đăng xuất"
}
```

---

### GET `/api/auth/profile`
**Xem thông tin profile** 🔐

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user_id": 2,
    "email": "buibaomoyu@gmail.com",
    "first_name": "Nguyễn",
    "last_name": "Bảo Minh",
    "role": "USER",
    "created_at": "2025-11-01T10:00:00.000Z"
  }
}
```

---

## 3. Spots (Địa điểm)

### GET `/api/spots/search`
**Tìm kiếm địa điểm với filters**

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `keyword` | string | Tìm kiếm theo tên/mô tả | `zoo` |
| `category` | enum | PARK, MUSEUM, ZOO, AQUARIUM, THEME_PARK, INDOOR_PLAY | `ZOO` |
| `min_age` | int | Độ tuổi tối thiểu | `2` |
| `max_age` | int | Độ tuổi tối đa | `10` |
| `price_range` | enum | FREE, UNDER_1000, 1000_3000, 3000_5000, OVER_5000 | `1000_3000` |
| `is_indoor` | boolean | Trong nhà (true) / ngoài trời (false) | `false` |
| `weather` | enum | ALL_WEATHER, SUNNY_ONLY, RAIN_OK | `RAIN_OK` |
| `facilities` | array | parking, nursing_room, stroller, cafe | `parking,nursing_room` |
| `min_rating` | float | Rating tối thiểu (0-5) | `4.0` |
| `lat` | float | Latitude (dùng với distance) | `35.7152` |
| `lng` | float | Longitude (dùng với distance) | `139.7737` |
| `distance` | int | Bán kính (km) | `10` |
| `sort` | enum | recommended, distance, rating, age_match | `rating` |
| `child_id` | int | ID trẻ (dùng cho age_match) | `1` |
| `limit` | int | Số kết quả (default: 20) | `10` |
| `offset` | int | Bỏ qua (default: 0) | `0` |

**Example Request:**
```
GET /api/spots/search?keyword=zoo&category=ZOO&min_age=2&max_age=10&sort=rating&limit=10
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "spot_id": 1,
        "name": "Ueno Zoo",
        "description": "Tokyo's oldest zoo...",
        "category": "ZOO",
        "min_age": 2,
        "max_age": 12,
        "price_range": "1000_3000",
        "is_indoor": false,
        "address": "Taito-ku, Tokyo",
        "latitude": 35.7152,
        "longitude": 139.7737,
        "distance_km": 2.5,
        "average_rating": 4.5,
        "review_count": 15,
        "main_image": "https://...",
        "tags": ["outdoor", "animals", "educational"]
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 10,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

### GET `/api/spots/suggestions`
**Autocomplete suggestions**

**Query Parameters:**
- `keyword` (required): Từ khóa tìm kiếm

**Example:**
```
GET /api/spots/suggestions?keyword=ue
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "spot_id": 1,
        "name": "Ueno Zoo",
        "category": "ZOO",
        "address": "Taito-ku, Tokyo",
        "main_image": "https://..."
      }
    ]
  }
}
```

---

### GET `/api/spots/:id`
**Chi tiết địa điểm**

**Example:**
```
GET /api/spots/1
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "spot_id": 1,
    "name": "Ueno Zoo",
    "description": "Tokyo's oldest zoo featuring pandas...",
    "category": "ZOO",
    "min_age": 2,
    "max_age": 12,
    "price_range": "1000_3000",
    "is_indoor": false,
    "address": "Taito-ku, Tokyo",
    "latitude": 35.7152,
    "longitude": 139.7737,
    "google_maps_url": "https://maps.google.com/?q=35.7152,139.7737",
    "operating_hours": {
      "monday": "9:30-17:00",
      "tuesday": "9:30-17:00",
      "wednesday": "Closed"
    },
    "weather_suitable": "RAIN_OK",
    "estimated_visit_duration": 180,
    "facilities": {
      "parking": true,
      "nursing_room": true,
      "stroller": true,
      "cafe": false
    },
    "average_rating": 4.5,
    "review_count": 15,
    "images": [
      {
        "image_id": 1,
        "image_url": "https://...",
        "is_main": true
      }
    ],
    "tags": ["outdoor", "animals", "age_2-5", "educational"]
  }
}
```

---

### GET `/api/spots/:id/reviews`
**Danh sách reviews của spot**

**Query Parameters:**
- `limit` (default: 10): Số reviews mỗi trang
- `offset` (default: 0): Vị trí bắt đầu
- `sort` (default: newest): newest, oldest, highest_rating, lowest_rating, most_helpful

**Example:**
```
GET /api/spots/1/reviews?limit=10&sort=newest
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "review_id": 1,
        "rating": 5,
        "comment": "Amazing zoo! Kids loved the pandas.",
        "image_url": "https://...",
        "facilities_check": {
          "clean": true,
          "kid_toilet": true,
          "stroller_friendly": true
        },
        "created_at": "2025-11-10T14:30:00.000Z",
        "user_id": 2,
        "user_name": "Nguyễn Bảo Minh",
        "user_email": "buibaomoyu@gmail.com"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

## 4. Reviews (Đánh giá)

### POST `/api/reviews` 🔐
**Tạo review mới**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "spot_id": 1,
  "rating": 5,
  "comment": "Great zoo for kids!",
  "facilities_check": {
    "clean": true,
    "kid_toilet": true,
    "stroller_friendly": true,
    "nursing_room": false
  },
  "image_url": "https://..."
}
```

**Validation:**
- `spot_id`: Required
- `rating`: Required, 1-5
- `comment`: Optional, max 140 chars
- `facilities_check`: Optional JSON
- `image_url`: Optional

**Response 200:**
```json
{
  "success": true,
  "message": "Đã tạo review thành công",
  "data": {
    "review_id": 16,
    "spot_id": 1,
    "rating": 5,
    "comment": "Great zoo for kids!",
    "created_at": "2025-11-18T10:30:00.000Z",
    "spot_name": "Ueno Zoo",
    "category": "ZOO"
  }
}
```

---

### GET `/api/reviews/user/:userId` 🔐
**Tất cả reviews của user**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
GET /api/reviews/user/2
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "review_id": 1,
        "spot_id": 1,
        "rating": 5,
        "comment": "Amazing!",
        "created_at": "2025-11-10T14:30:00.000Z",
        "spot_name": "Ueno Zoo",
        "category": "ZOO",
        "main_image": "https://..."
      }
    ],
    "total": 3
  }
}
```

---

### GET `/api/reviews/:reviewId`
**Chi tiết review**

**Example:**
```
GET /api/reviews/1
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "review_id": 1,
    "spot_id": 1,
    "user_id": 2,
    "rating": 5,
    "comment": "Amazing zoo!",
    "image_url": "https://...",
    "facilities_check": {
      "clean": true,
      "kid_toilet": true
    },
    "created_at": "2025-11-10T14:30:00.000Z",
    "spot_name": "Ueno Zoo",
    "category": "ZOO",
    "user_name": "Nguyễn Bảo Minh"
  }
}
```

---

### PUT `/api/reviews/:reviewId` 🔐
**Cập nhật review**

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "rating": 4,
  "comment": "Updated comment",
  "facilities_check": {
    "clean": true
  },
  "image_url": "https://new-image.jpg"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã cập nhật review",
  "data": { ... }
}
```

---

### DELETE `/api/reviews/:reviewId` 🔐
**Xóa review**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `soft_delete=true`: Ẩn review (set `is_hidden=TRUE`) thay vì xóa hoàn toàn

**Example:**
```
DELETE /api/reviews/1?soft_delete=true
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã ẩn review"
}
```

---

### POST `/api/reviews/:reviewId/report` 🔐
**Báo cáo review (spam/inappropriate)**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "spam",
  "details": "This is advertising content"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã gửi báo cáo. Admin sẽ xem xét."
}
```

---

## 5. Favorites (Yêu thích)

### GET `/api/favorites` 🔐
**Danh sách favorites**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `collection_tag`: Filter theo tag (e.g., "summer", "rainy_day")
- `limit`, `offset`: Phân trang

**Example:**
```
GET /api/favorites?collection_tag=summer&limit=10
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "favorite_id": 1,
        "spot_id": 1,
        "collection_tag": "summer",
        "created_at": "2025-11-01T10:00:00.000Z",
        "spot_name": "Ueno Zoo",
        "category": "ZOO",
        "address": "Taito-ku, Tokyo",
        "price_range": "1000_3000",
        "average_rating": 4.5,
        "main_image": "https://..."
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### GET `/api/favorites/collections` 🔐
**Danh sách collection tags**

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "collection_tag": "summer",
        "count": 3
      },
      {
        "collection_tag": "rainy_day",
        "count": 2
      }
    ]
  }
}
```

---

### GET `/api/favorites/check/:spotId` 🔐
**Kiểm tra spot có được yêu thích chưa**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
GET /api/favorites/check/1
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "is_favorite": true,
    "favorite_id": 1,
    "collection_tag": "summer"
  }
}
```

---

### POST `/api/favorites` 🔐
**Thêm spot vào favorites**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "spot_id": 1,
  "collection_tag": "summer"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã thêm vào yêu thích",
  "data": {
    "favorite_id": 8,
    "spot_id": 1,
    "collection_tag": "summer"
  }
}
```

---

### PUT `/api/favorites/:id` 🔐
**Cập nhật collection_tag**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "collection_tag": "winter"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã cập nhật collection_tag"
}
```

---

### DELETE `/api/favorites/:id` 🔐
**Xóa favorite by favorite_id**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
DELETE /api/favorites/1
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã xóa khỏi yêu thích"
}
```

---

### DELETE `/api/favorites/spot/:spotId` 🔐
**Xóa favorite by spot_id (Toggle button)**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
DELETE /api/favorites/spot/1
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã xóa khỏi yêu thích"
}
```

---

## 6. Schedules (Lịch trình)

### GET `/api/schedules` 🔐
**Danh sách lịch trình**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: PLANNED, COMPLETED, CANCELLED
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD
- `limit`, `offset`: Phân trang

**Example:**
```
GET /api/schedules?status=PLANNED&from_date=2025-11-15&to_date=2025-11-30
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "schedule_id": 1,
        "spot_id": 1,
        "scheduled_date": "2025-11-20",
        "time_slot": "AM",
        "status": "PLANNED",
        "notes": "Visit pandas",
        "created_at": "2025-11-12T10:00:00.000Z",
        "spot_name": "Ueno Zoo",
        "category": "ZOO",
        "address": "Taito-ku, Tokyo",
        "main_image": "https://...",
        "tags": ["outdoor", "animals"]
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 50,
      "offset": 0
    }
  }
}
```

---

### GET `/api/schedules/calendar/:year/:month` 🔐
**Lịch trình theo tháng (calendar view)**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
GET /api/schedules/calendar/2025/11
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 11,
    "schedules": {
      "2025-11-20": [
        {
          "schedule_id": 1,
          "spot_id": 1,
          "time_slot": "AM",
          "status": "PLANNED",
          "spot_name": "Ueno Zoo",
          "category": "ZOO",
          "main_image": "https://..."
        }
      ],
      "2025-11-21": [
        {
          "schedule_id": 2,
          "spot_id": 3,
          "time_slot": "FULL_DAY",
          "status": "PLANNED",
          "spot_name": "Tokyo Skytree",
          "category": "OBSERVATION_DECK",
          "main_image": "https://..."
        }
      ]
    },
    "total_schedules": 2
  }
}
```

---

### GET `/api/schedules/:scheduleId` 🔐
**Chi tiết lịch trình**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
GET /api/schedules/1
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "schedule_id": 1,
    "user_id": 2,
    "spot_id": 1,
    "scheduled_date": "2025-11-20",
    "time_slot": "AM",
    "status": "PLANNED",
    "notes": "Visit pandas",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z",
    "spot_name": "Ueno Zoo",
    "spot_description": "Tokyo's oldest zoo...",
    "category": "ZOO",
    "address": "Taito-ku, Tokyo",
    "facilities": { "parking": true },
    "main_image": "https://..."
  }
}
```

---

### POST `/api/schedules` 🔐
**Thêm lịch trình mới**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "spot_id": 1,
  "scheduled_date": "2025-11-25",
  "time_slot": "AM",
  "notes": "Morning visit"
}
```

**Validation:**
- `spot_id`: Required
- `scheduled_date`: Required, không được là quá khứ
- `time_slot`: AM, PM, FULL_DAY (default: FULL_DAY)
- `notes`: Optional

**Response 200:**
```json
{
  "success": true,
  "message": "Đã thêm lịch trình thành công",
  "data": {
    "schedule_id": 5,
    "spot_id": 1,
    "scheduled_date": "2025-11-25",
    "time_slot": "AM",
    "status": "PLANNED",
    "notes": "Morning visit"
  }
}
```

---

### PUT `/api/schedules/:scheduleId` 🔐
**Cập nhật lịch trình**

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "scheduled_date": "2025-11-26",
  "time_slot": "PM",
  "notes": "Changed to afternoon",
  "status": "COMPLETED"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã cập nhật lịch trình",
  "data": { ... }
}
```

---

### DELETE `/api/schedules/:scheduleId` 🔐
**Xóa/hủy lịch trình**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `soft_delete=true`: Đổi status thành CANCELLED thay vì xóa

**Example:**
```
DELETE /api/schedules/1?soft_delete=true
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã hủy lịch trình"
}
```

---

## 7. Children (Hồ sơ trẻ em)

### GET `/api/children` 🔐
**Danh sách trẻ của user**

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "children": [
      {
        "child_id": 1,
        "name": "Minh",
        "birth_date": "2020-05-15",
        "age": 5,
        "gender": "MALE",
        "interests": "animals, outdoor",
        "dislikes": "crowded places",
        "special_needs": null
      }
    ]
  }
}
```

---

### GET `/api/children/:id` 🔐
**Chi tiết trẻ**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
GET /api/children/1
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "child_id": 1,
    "name": "Minh",
    "birth_date": "2020-05-15",
    "age": 5,
    "gender": "MALE",
    "interests": "animals, outdoor",
    "dislikes": "crowded places",
    "special_needs": null,
    "created_at": "2025-11-01T10:00:00.000Z"
  }
}
```

---

### POST `/api/children` 🔐
**Thêm hồ sơ trẻ mới**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "An",
  "birth_date": "2022-08-20",
  "gender": "FEMALE",
  "interests": "crafts, indoor play",
  "dislikes": "loud noises",
  "special_needs": null
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã thêm hồ sơ trẻ",
  "data": {
    "child_id": 5,
    "name": "An",
    "birth_date": "2022-08-20",
    "age": 3
  }
}
```

---

### PUT `/api/children/:id` 🔐
**Cập nhật hồ sơ**

**Headers:** `Authorization: Bearer <token>`

**Request Body (all optional):**
```json
{
  "name": "Minh Updated",
  "interests": "animals, science",
  "dislikes": "hot weather"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã cập nhật hồ sơ"
}
```

---

### DELETE `/api/children/:id` 🔐
**Xóa hồ sơ**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
DELETE /api/children/1
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã xóa hồ sơ trẻ"
}
```

---

## 8. Kids Swipe (Tính năng swipe)

### POST `/api/kids-swipe/:childId/swipe` 🔐
**Child swipe spot**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "spot_id": 1,
  "action": "LIKE"
}
```

**Validation:**
- `action`: LIKE hoặc SKIP

**Response 200:**
```json
{
  "success": true,
  "message": "Đã lưu swipe",
  "data": {
    "child_id": 1,
    "spot_id": 1,
    "action": "LIKE",
    "tags_learned": ["outdoor", "animals"]
  }
}
```

---

### GET `/api/kids-swipe/:childId/preferences` 🔐
**Tags mà child thích**

**Headers:** `Authorization: Bearer <token>`

**Example:**
```
GET /api/kids-swipe/1/preferences
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "child_id": 1,
    "child_name": "Minh",
    "preferences": [
      {
        "tag_name": "outdoor",
        "like_count": 5,
        "skip_count": 0,
        "preference_score": 5.0
      },
      {
        "tag_name": "animals",
        "like_count": 4,
        "skip_count": 1,
        "preference_score": 3.0
      }
    ]
  }
}
```

---

### GET `/api/kids-swipe/:childId/recommendations` 🔐
**Gợi ý spots dựa trên preferences**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit`, `offset`: Phân trang
- `min_match`: Số tags tối thiểu khớp (default: 1)
- `lat`, `lng`, `distance`: Filter theo location

**Example:**
```
GET /api/kids-swipe/1/recommendations?limit=10&min_match=2
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "spot_id": 10,
        "name": "Inokashira Park Zoo",
        "category": "ZOO",
        "match_score": 8.5,
        "matched_tags": ["outdoor", "animals"],
        "address": "Musashino, Tokyo",
        "main_image": "https://..."
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### GET `/api/kids-swipe/:childId/spots` 🔐
**Danh sách spots chưa swipe**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit`, `offset`: Phân trang
- `category`: Filter theo category
- `lat`, `lng`, `distance`: Filter theo location

**Example:**
```
GET /api/kids-swipe/1/spots?limit=20&category=ZOO
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "spot_id": 3,
        "name": "Tokyo Skytree",
        "category": "OBSERVATION_DECK",
        "tags": ["indoor", "sightseeing"],
        "main_image": "https://..."
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

## 9. Admin (Dashboard & Management)

### GET `/api/admin/dashboard`
**Dashboard KPIs theo thời gian thực** 🔐 Admin Only

**Query Parameters:**
- `period` - 7, 30, 90 (days) - Default: 30

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "days": 30,
      "start_date": "2025-10-19",
      "end_date": "2025-11-18"
    },
    "totals": {
      "users": 4,
      "spots": 10,
      "reviews": 10,
      "favorites": 7,
      "schedules": 4,
      "children": 6
    },
    "ratings": {
      "average": 4.5,
      "total_reviews": 10,
      "distribution": [
        {"rating": 5, "count": 6, "percentage": 60.0},
        {"rating": 4, "count": 3, "percentage": 30.0}
      ]
    },
    "growth": {
      "new_users": 2,
      "new_reviews": 5,
      "new_favorites": 4,
      "new_schedules": 3
    },
    "activity": {
      "active_users": 3,
      "activity_rate": 75.0,
      "avg_favorites_per_user": 1.75,
      "avg_schedules_per_user": 1.0,
      "avg_reviews_per_user": 2.5
    },
    "popular_spots": [
      {
        "spot_id": 1,
        "name": "Ueno Zoo",
        "category": "ZOO",
        "average_rating": 4.5,
        "review_count": 2,
        "favorite_count": 3,
        "new_favorites": 2,
        "new_reviews": 1,
        "popularity_score": 4
      }
    ],
    "categories": [
      {"category": "ZOO", "count": 2},
      {"category": "PARK", "count": 3}
    ],
    "daily_trend": [
      {"date": "2025-11-12", "activities": 5},
      {"date": "2025-11-13", "activities": 8}
    ]
  }
}
```

---

### GET `/api/admin/users`
**Danh sách tất cả users với stats** 🔐 Admin Only

**Query Parameters:**
- `limit` - Default: 50
- `offset` - Default: 0
- `sort` - created_at, favorites, reviews (Default: created_at)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": 2,
        "email": "buibaomoyu@gmail.com",
        "first_name": "Nguyễn",
        "last_name": "Bảo Minh",
        "role": "USER",
        "created_at": "2025-01-15T10:00:00.000Z",
        "last_login": "2025-11-18T08:30:00.000Z",
        "children_count": 2,
        "favorites_count": 3,
        "schedules_count": 2,
        "reviews_count": 5
      }
    ],
    "pagination": {
      "total": 4,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

### GET `/api/admin/spots`
**Danh sách tất cả spots (PUBLIC/DRAFT/ARCHIVED)** 🔐 Admin Only

**Query Parameters:**
- `limit` - Default: 50
- `offset` - Default: 0
- `status` - PUBLIC, DRAFT, ARCHIVED (optional filter)

**Response:**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "spot_id": 1,
        "name": "Ueno Zoo",
        "category": "ZOO",
        "status": "PUBLIC",
        "address": "Taito-ku, Tokyo",
        "average_rating": 4.5,
        "created_at": "2025-01-01T00:00:00.000Z",
        "main_image": "https://...",
        "review_count": 2,
        "favorite_count": 3,
        "schedule_count": 2,
        "facilities": {},
        "operating_hours": {}
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

## 10. Smart Recommendations (Gợi ý thông minh)

### GET `/api/recommendations`
**Gợi ý thông minh dựa trên location, weather, child profile, favorites** � Optional Auth

**Query Parameters:**
- `lat`, `lng` - **Required** - Vị trí hiện tại
- `child_id` - Optional - Filter theo child (age + preferences)
- `distance` - Default: 20 (km)
- `weather` - RAIN, SUNNY, HOT
- `rain_ok` - true/false (chỉ indoor/rain-friendly)
- `open_now` - true/false (đang mở cửa)
- `limit`, `offset` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "spot_id": 1,
        "name": "Ueno Zoo",
        "distance": 3.2,
        "recommendation_score": 87.5,
        "preference_match_score": 3,
        "is_favorite": true,
        "average_rating": 4.5,
        "tags": ["outdoor", "animals"]
      }
    ],
    "metadata": {
      "location": {"lat": 35.6812, "lng": 139.7671},
      "filters_applied": ["distance <= 20km", "age: 5"]
    },
    "pagination": {
      "total": 8,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

**Scoring Algorithm:**
- Distance (30 pts) - Càng gần càng cao
- Rating (25 pts) - Đánh giá cao
- Popularity (15 pts) - Nhiều reviews
- Preference match (20 pts) - Tags trùng sở thích
- Favorite bonus (10 pts) - Đã yêu thích

---

### GET `/api/recommendations/weather-alternatives`
**Gợi ý thay thế khi thời tiết xấu (indoor/rain-friendly)** 🔓 Optional Auth

**Query Parameters:**
- `lat`, `lng` - **Required**
- `distance` - Default: 30 (km)
- `limit` - Default: 10

**Response:**
```json
{
  "success": true,
  "message": "Gợi ý thay thế cho thời tiết xấu (indoor/rain-friendly)",
  "data": {
    "alternatives": [
      {
        "spot_id": 5,
        "name": "KidZania Tokyo",
        "is_indoor": true,
        "weather_suitable": "ALL_WEATHER",
        "distance": 8.5,
        "average_rating": 4.8
      }
    ],
    "total": 4
  }
}
```

---

## �📝 Notes

### Authentication
- Tất cả endpoints có 🔐 yêu cầu JWT token trong header
- 🔐 Admin Only: Chỉ user có role = 'ADMIN'
- 🔓 Optional Auth: Không bắt buộc token, nhưng có token sẽ tốt hơn
- Token có thời hạn 7 ngày (xem config)
- Token format: `Authorization: Bearer <token>`

### Error Responses
Tất cả errors trả về format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

### Pagination
Default pagination cho tất cả list endpoints:
- `limit`: 10-50 (default varies by endpoint)
- `offset`: 0 (default)
- Response có `pagination` object với `total`, `has_more`

### Soft Delete
Nhiều endpoints hỗ trợ soft delete:
- Reviews: `?soft_delete=true` → `is_hidden=TRUE`
- Schedules: `?soft_delete=true` → `status=CANCELLED`

---

---

## 11. Spot Management (Quản lý địa điểm)

> **� Admin Only** - Thêm/chỉnh sửa địa điểm đơn giản

### POST `/api/admin/spot-management`
**Tạo địa điểm mới**

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "TeamLab Planets Tokyo",
  "google_maps_url": "https://maps.app.goo.gl/abc123",
  "image_url": "https://example.com/teamlab.jpg",
  "standards_checked": true,
  "status": "DRAFT"
}
```

**Validation:**
- `name`: Required, không chứa ký tự đặc biệt (!@#$%^&*+=[]{};\':"|,.<>/?~`)
- `standards_checked`: Required, phải là `true`
- `status`: 'DRAFT' hoặc 'PUBLIC' (default: DRAFT)
- `google_maps_url`: Optional
- `image_url`: Optional

**Response (201):**
```json
{
  "success": true,
  "message": "Đã lưu nháp thành công",
  "data": {
    "spot": {
      "spot_id": 11,
      "name": "TeamLab Planets Tokyo",
      "google_maps_url": "https://maps.app.goo.gl/abc123",
      "status": "DRAFT",
      "images": ["https://example.com/teamlab.jpg"],
      "created_by_admin_id": 1,
      "created_at": "2025-11-18T02:30:00.000Z"
    }
  }
}
```

**Errors:**
- `400` - Tên thiếu hoặc chứa ký tự đặc biệt
- `400` - Chưa check "tiêu chuẩn đăng bài"
- `401` - Không có token
- `403` - Không phải admin

---

### PUT `/api/admin/spot-management/:spotId`
**Chỉnh sửa địa điểm**

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:** Same as POST

**Response (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật địa điểm thành công",
  "data": {
    "spot": {
      "spot_id": 11,
      "name": "TeamLab Planets Tokyo Updated",
      "images": [
        "https://example.com/teamlab.jpg",
        "https://example.com/teamlab-new.jpg"
      ]
    }
  }
}
```

**Errors:**
- `404` - Không tìm thấy spot
- Còn lại giống POST

---

### GET `/api/admin/spot-management/:spotId/preview`
**Xem trước địa điểm**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "spot_id": 11,
      "name": "TeamLab Planets Tokyo",
      "status": "DRAFT",
      "google_maps_url": "https://maps.app.goo.gl/abc123",
      "images": [
        {
          "image_url": "https://example.com/teamlab.jpg",
          "display_order": 1
        }
      ],
      "tags": [],
      "facilities": {},
      "operating_hours": {}
    },
    "preview_mode": true,
    "can_publish": true
  }
}
```

**Errors:**
- `404` - Không tìm thấy spot

---

### POST `/api/admin/spot-management/:spotId/publish`
**Publish spot (DRAFT → PUBLIC)**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đã publish địa điểm \"TeamLab Planets Tokyo\" thành công",
  "data": {
    "spot_id": 11,
    "status": "PUBLIC"
  }
}
```

**Errors:**
- `404` - Không tìm thấy spot
- `400` - Spot không ở trạng thái DRAFT

---

### DELETE `/api/admin/spot-management/:spotId/images/:imageId`
**Xóa hình ảnh của spot**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Note:** `imageId` là `image_id` từ table `spot_images`

**Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa hình ảnh thành công"
}
```

**Errors:**
- `404` - Không tìm thấy hình ảnh

---

## 12. Review Management (Quản lý đánh giá)

> **🔐 Admin Only** - Quản lý tập trung tất cả reviews, phát hiện nội dung không phù hợp

### GET `/api/admin/review-management`
**Danh sách tất cả reviews với filtering**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `rating`: 1-5 (filter by rating)
- `status`: 'public' | 'hidden' | 'all' (default: all)
- `spot_id`: Filter by spot
- `user_id`: Filter by user
- `has_image`: true/false (có ảnh đính kèm)
- `date_from`, `date_to`: Date range (YYYY-MM-DD)
- `sort`: 'latest' | 'oldest' | 'rating_high' | 'rating_low' (default: latest)
- `limit`, `offset`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "review_id": 1,
        "spot_id": 1,
        "spot_name": "Ueno Zoo",
        "spot_category": "ZOO",
        "user_id": 2,
        "user_name": "Bùi Bảo Mơ",
        "user_email": "buibaomoyu@gmail.com",
        "rating": 5,
        "comment": "Amazing experience!",
        "image_url": "https://example.com/review.jpg",
        "is_hidden": false,
        "report_count": 0,
        "created_at": "2025-11-12T08:24:43.000Z"
      }
    ],
    "statistics": {
      "total_reviews": 12,
      "public_reviews": 10,
      "hidden_reviews": 2,
      "reviews_with_image": 5,
      "reported_reviews": 1,
      "average_rating": 4.5,
      "rating_distribution": {
        "5": 6,
        "4": 3,
        "3": 2,
        "2": 1,
        "1": 0
      }
    },
    "pagination": {
      "total": 12,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

**Errors:**
- `401` - Unauthorized (token không hợp lệ)
- `403` - Forbidden (không phải admin)
- `500` - Server error

---

### GET `/api/admin/review-management/:reviewId`
**Chi tiết review với full info**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "review": {
      "review_id": 1,
      "spot_id": 1,
      "spot_name": "Ueno Zoo",
      "spot_category": "ZOO",
      "spot_address": "Tokyo, Ueno",
      "user_id": 2,
      "user_name": "Bùi Bảo Mơ",
      "user_email": "buibaomoyu@gmail.com",
      "user_total_reviews": 5,
      "rating": 5,
      "comment": "Amazing experience!",
      "image_url": "https://example.com/review.jpg",
      "is_hidden": false,
      "report_count": 0,
      "created_at": "2025-11-12T08:24:43.000Z",
      "updated_at": "2025-11-12T08:24:43.000Z"
    },
    "user_other_reviews": [
      {
        "review_id": 2,
        "spot_name": "Tokyo Tower",
        "rating": 4,
        "created_at": "2025-10-01T10:00:00.000Z"
      }
    ],
    "report_history": null
  }
}
```

**Errors:**
- `404` - Không tìm thấy review
- `401` - Unauthorized
- `403` - Forbidden

---

### PATCH `/api/admin/review-management/:reviewId/toggle-status`
**Toggle public/hidden status**

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "is_hidden": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đã ẩn review",
  "data": {
    "review_id": 1,
    "is_hidden": true,
    "status": "hidden"
  }
}
```

**Example: Unhide review**
```json
{
  "is_hidden": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã hiện review",
  "data": {
    "review_id": 1,
    "is_hidden": false,
    "status": "public"
  }
}
```

**Errors:**
- `404` - Không tìm thấy review
- `400` - is_hidden phải là boolean

---

### POST `/api/admin/review-management/:reviewId/reset-reports`
**Reset report count**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đã reset report count",
  "data": {
    "review_id": 1,
    "report_count": 0
  }
}
```

**Use Case:** Admin đã kiểm tra review bị report và xác nhận nội dung hợp lệ

**Errors:**
- `404` - Không tìm thấy review

---

### DELETE `/api/admin/review-management/:reviewId`
**Xóa review (hard delete)**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa review thành công",
  "data": {
    "review_id": 1,
    "spot_id": 1
  }
}
```

**Side Effects:**
- ⚠️ Hard delete (không thể undo)
- ✅ Tự động update spot statistics (review_count, average_rating)

**Use Case:** Xóa review vi phạm nghiêm trọng (spam, hate speech, inappropriate content)

**Errors:**
- `404` - Không tìm thấy review

---

**�📖 Xem thêm:**
- [README.md](README.md) - Overview & setup
- [DATABASE_SCHEMA.md](database/DATABASE_SCHEMA.md) - Database structure

## 13. User Management (Quản lý người dùng)

> **��� Admin Only** - Quản lý tập trung toàn bộ người dùng trong hệ thống

### GET `/api/admin/user-management`
**Danh sách người dùng với filtering**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `search`: Tìm kiếm theo name hoặc email
- `role`: 'USER' | 'ADMIN' | 'all' (default: all)
- `status`: 'ACTIVE' | 'BANNED' | 'all' (default: all)
- `email_domain`: Filter theo email domain (gmail.com, yahoo.com)
- `date_from`, `date_to`: Date range đăng ký (YYYY-MM-DD)
- `sort`: 'latest' | 'oldest' | 'name' | 'last_login' (default: latest)
- `limit`, `offset`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": 2,
        "name": "Bùi Bảo Mơ",
        "email": "buibaomoyu@gmail.com",
        "role": "USER",
        "status": "ACTIVE",
        "is_banned": false,
        "created_at": "2024-10-01T09:00:00.000Z",
        "last_login_at": "2025-01-15T08:30:00.000Z",
        "activity": {
          "total_reviews": 5,
          "total_favorites": 12,
          "total_schedules": 8,
          "total_children": 2
        }
      }
    ],
    "statistics": {
      "total_users": 50,
      "admin_count": 2,
      "user_count": 48,
      "banned_count": 3,
      "active_count": 47,
      "new_users_7days": 5,
      "new_users_30days": 15
    },
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

### GET `/api/admin/user-management/:userId`
**Chi tiết user với full activity**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 2,
      "name": "Bùi Bảo Mơ",
      "email": "buibaomoyu@gmail.com",
      "role": "USER",
      "status": "ACTIVE",
      "is_banned": false,
      "created_at": "2024-10-01T09:00:00.000Z",
      "last_login_at": "2025-01-15T08:30:00.000Z",
      "updated_at": "2025-01-15T08:30:00.000Z"
    },
    "children": [
      {
        "child_id": 1,
        "name": "Minh",
        "date_of_birth": "2018-05-15",
        "gender": "MALE"
      }
    ],
    "recent_reviews": [
      {
        "review_id": 1,
        "spot_id": 1,
        "spot_name": "Ueno Zoo",
        "rating": 5,
        "comment": "Great place!",
        "is_hidden": false,
        "report_count": 0,
        "created_at": "2025-01-10T10:00:00.000Z"
      }
    ],
    "recent_favorites": [],
    "recent_schedules": [],
    "statistics": {
      "total_reviews": 5,
      "total_favorites": 12,
      "total_schedules": 8,
      "total_children": 2,
      "average_rating": "4.6"
    }
  }
}
```

---

### PATCH `/api/admin/user-management/:userId/toggle-ban`
**Cấm hoặc kích hoạt lại tài khoản**

**Body:**
```json
{
  "is_banned": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "アカウントがBANされました",
  "data": {
    "user_id": 2,
    "is_banned": true,
    "status": "BANNED"
  }
}
```

**Example: UNBAN**
```json
{
  "is_banned": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "アカウントがUNBANされました",
  "data": {
    "user_id": 2,
    "is_banned": false,
    "status": "ACTIVE"
  }
}
```

**Errors:**
- `400` - is_banned phải là boolean
- `403` - Không thể ban tài khoản Admin
- `404` - Không tìm thấy user

---

### PATCH `/api/admin/user-management/:userId/change-role`
**Thay đổi quyền USER ↔ ADMIN**

**Body:**
```json
{
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đã thay đổi role thành ADMIN",
  "data": {
    "user_id": 2,
    "role": "ADMIN"
  }
}
```

**Errors:**
- `400` - Role phải là USER hoặc ADMIN
- `404` - Không tìm thấy user

---

### DELETE `/api/admin/user-management/:userId`
**Xóa user (hard delete)**

**Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa user thành công",
  "data": {
    "user_id": 2
  }
}
```

**Side Effects:**
- ⚠️ Hard delete (không thể undo)
- ✅ CASCADE delete: children, reviews, favorites, schedules

**Errors:**
- `403` - Không thể xóa tài khoản Admin
- `404` - Không tìm thấy user

---

**��� Xem thêm:**
- [README.md](README.md) - Overview & setup
- [DATABASE_SCHEMA.md](database/DATABASE_SCHEMA.md) - Database structure
- [REVIEW_MANAGEMENT_API_TESTING.md](REVIEW_MANAGEMENT_API_TESTING.md) - Review management testing guide       
- [SPOT_MANAGEMENT_API_TESTING.md](SPOT_MANAGEMENT_API_TESTING.md) - Spot management testing guide
- [SCHEDULES_API_TESTING.md](SCHEDULES_API_TESTING.md) - Schedules testing guide

---

**��� Happy Coding!**
