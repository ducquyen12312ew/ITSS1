# 📊 API SUMMARY - KODOMO WEEKEND NAVI

> **Tổng hợp tất cả API endpoints đã implement**
> 
> **Base URL:** `http://localhost:3000`
> **Version:** 1.0.0
> **Last Updated:** 2025-11-18

---

## 🎯 API Statistics

| Category | Endpoints | Auth Required | Status |
|----------|-----------|---------------|--------|
| System Health | 2 | ❌ | ✅ Complete |
| Authentication | 4 | Mixed | ✅ Complete |
| Spots | 4 | ❌ Public | ✅ Complete |
| Reviews | 7 | ✅ | ✅ Complete |
| Favorites | 7 | ✅ | ✅ Complete |
| Schedules | 6 | ✅ | ✅ Complete |
| Children | 5 | ✅ | ✅ Complete |
| Kids Swipe | 4 | ✅ | ✅ Complete |
| Smart Recommendations | 2 | 🔓 Optional | ✅ Complete |
| Admin Dashboard | 3 | 🔐 Admin | ✅ Complete |
| Spot Management | 5 | 🔐 Admin | ✅ Complete |
| Review Management | 5 | 🔐 Admin | ✅ Complete |
| User Management | 5 | 🔐 Admin | ✅ Complete |
| **TOTAL** | **59** | - | **100%** |

---

## 📋 Complete Endpoint List

### 1️⃣ System Health (2 endpoints)
```
GET  /health                    ❌ Public
GET  /api                       ❌ Public
```

---

### 2️⃣ Authentication (4 endpoints)
```
POST /api/auth/register         ❌ Public
POST /api/auth/login            ❌ Public
POST /api/auth/logout           ✅ Auth Required
GET  /api/auth/profile          ✅ Auth Required
```

**Test Account:**
- Admin: `admin@kodomo.com` / `password123`
- User: `buibaomoyu@gmail.com` / `B@o140804`

---

### 3️⃣ Spots - Địa điểm (4 endpoints)
```
GET  /api/spots/search          ❌ Public (keyword, category, age, price, facilities, location)
GET  /api/spots/suggestions     ❌ Public (autocomplete)
GET  /api/spots/:id             ❌ Public (chi tiết + images + tags + reviews)
GET  /api/spots/:id/reviews     ❌ Public (danh sách reviews)
```

**Key Features:**
- Advanced filters: category, age, price, indoor/outdoor, weather, facilities
- Distance calculation (Haversine formula)
- Sort: recommended, distance, rating, name
- Pagination support

---

### 4️⃣ Reviews - Đánh giá (7 endpoints)
```
POST   /api/reviews                    ✅ Create review (rating 1-5, comment max 140 chars)
GET    /api/reviews/user/:userId       ✅ User's all reviews
GET    /api/reviews/:reviewId          ❌ Public (chi tiết review)
PUT    /api/reviews/:reviewId          ✅ Update review
DELETE /api/reviews/:reviewId          ✅ Delete (support soft_delete)
POST   /api/reviews/:reviewId/report   ✅ Report review (spam/inappropriate)
GET    /api/spots/:id/reviews          ❌ Public (spot's reviews)
```

**Features:**
- Rating 1-5 stars (required)
- Comment max 140 chars (optional)
- Facilities check JSON
- Image support
- Soft delete option
- Report system

---

### 5️⃣ Favorites - Yêu thích (7 endpoints)
```
GET    /api/favorites                  ✅ List favorites + spot info
GET    /api/favorites/collections      ✅ List collection tags
GET    /api/favorites/check/:spotId    ✅ Check if spot is favorited
POST   /api/favorites                  ✅ Add to favorites
PUT    /api/favorites/:id              ✅ Update collection_tag
DELETE /api/favorites/:id              ✅ Delete by favorite_id
DELETE /api/favorites/spot/:spotId     ✅ Delete by spot_id (toggle)
```

**Features:**
- Collection tags for organization
- Toggle favorite on/off
- Includes full spot details
- Favorite count tracking

---

### 6️⃣ Schedules - Lịch trình cuối tuần (6 endpoints)
```
GET    /api/schedules                       ✅ List schedules (filters: status, date range)
GET    /api/schedules/calendar/:year/:month ✅ Calendar view (grouped by date)
GET    /api/schedules/:scheduleId           ✅ Schedule detail + spot info
POST   /api/schedules                       ✅ Add schedule (spot, date, time_slot)
PUT    /api/schedules/:scheduleId           ✅ Update schedule
DELETE /api/schedules/:scheduleId           ✅ Delete/Cancel (support soft_delete)
```

**Features:**
- Time slots: AM, PM, FULL_DAY
- Status: PLANNED, COMPLETED, CANCELLED
- Calendar view grouped by date
- Validation: no past dates, no duplicates
- Soft delete = CANCELLED status

---

### 7️⃣ Children - Hồ sơ trẻ em (5 endpoints)
```
GET    /api/children           ✅ List children of user
GET    /api/children/:id       ✅ Child detail
POST   /api/children           ✅ Add child profile
PUT    /api/children/:id       ✅ Update profile
DELETE /api/children/:id       ✅ Delete profile
```

**Features:**
- Store: name, birth_date, gender, notes
- Calculate age automatically
- Link to user account
- Used for age-based filtering

---

### 8️⃣ Kids Swipe - Tính năng swipe (4 endpoints)
```
POST /api/kids-swipe/:childId/swipe           ✅ Swipe LIKE/SKIP
GET  /api/kids-swipe/:childId/preferences     ✅ View child's liked tags
GET  /api/kids-swipe/:childId/recommendations ✅ Recommend spots based on preferences
GET  /api/kids-swipe/:childId/spots           ✅ Get spots not yet swiped
```

**Features:**
- LIKE → Save tags to preferences + Add to favorites
- SKIP → Don't show again
- Machine learning: Learn child preferences from tags
- Smart recommendations based on tag matching

---

### 9️⃣ Smart Recommendations - Gợi ý thông minh (2 endpoints)
```
GET /api/recommendations                    🔓 Optional Auth
GET /api/recommendations/weather-alternatives 🔓 Optional Auth
```

**Features:**
- **Multi-factor scoring (100 pts):**
  - Distance (30 pts): Closer = higher
  - Rating (25 pts): High rating = higher
  - Popularity (15 pts): More reviews = higher
  - Preference match (20 pts): Tags match child preferences
  - Favorite bonus (10 pts): Already favorited
  
- **Weather-based filtering:**
  - RAIN → Indoor/rain-friendly spots
  - HOT → Indoor with AC
  - SUNNY → All spots OK
  
- **Location-based:** Distance calculation with Haversine formula
- **Child profile integration:** Age + preferences from swipe history
- **Operating hours check:** Filter open spots

---

### 🔟 Admin Dashboard (3 endpoints)
```
GET /api/admin/dashboard    🔐 Admin Only (KPIs, trends, analytics)
GET /api/admin/users        🔐 Admin Only (All users + stats)
GET /api/admin/spots        🔐 Admin Only (All spots + stats)
```

**Dashboard KPIs:**
- **Totals:** Users, Spots, Reviews, Favorites, Schedules, Children
- **Ratings:** Average rating + distribution (1-5 stars)
- **Growth:** New users/reviews/favorites/schedules in period
- **Activity:** Active users, activity rate, engagement metrics
- **Popular Spots:** Top 10 by favorites + reviews
- **Categories:** Distribution by category
- **Daily Trend:** Activity last 7 days

**Filters:**
- `period`: 7, 30, 90 days (default: 30)
- Real-time data from database

---

### 1️⃣1️⃣ Spot Management (5 endpoints)
```
POST   /api/admin/spot-management                    🔐 Admin Only (Create spot)
PUT    /api/admin/spot-management/:spotId            🔐 Admin Only (Update spot)
GET    /api/admin/spot-management/:spotId/preview    🔐 Admin Only (Preview)
POST   /api/admin/spot-management/:spotId/publish    🔐 Admin Only (Publish DRAFT→PUBLIC)
DELETE /api/admin/spot-management/:spotId/images/:imageId  🔐 Admin Only (Delete image)
```

**Features:**
- **Simple spot creation:** Name + Google Maps URL + Image (optional)
- **DRAFT mode:** Save as draft before publishing
- **Preview:** View before publish
- **Validation:** 
  - Name required, no special chars (!@#$%^&*+=[]{};\':"|,.<>/?~`)
  - Must check "standards_checked" checkbox
- **Status workflow:** DRAFT → Preview → PUBLIC

---

### 1️⃣2️⃣ Review Management (5 endpoints)
```
GET    /api/admin/review-management                           🔐 Admin Only (List reviews)
GET    /api/admin/review-management/:reviewId                 🔐 Admin Only (Detail)
PATCH  /api/admin/review-management/:reviewId/toggle-status  🔐 Admin Only (Hide/Unhide)
POST   /api/admin/review-management/:reviewId/reset-reports  🔐 Admin Only (Reset reports)
DELETE /api/admin/review-management/:reviewId                🔐 Admin Only (Delete review)
```

**Features:**
- **Advanced filtering:** rating, status, spot_id, user_id, has_image, date range
- **Statistics:** total, public/hidden, with_image, reported, rating distribution
- **Toggle status:** Public ↔ Hidden
- **Reset reports:** Clear report_count after verification
- **Hard delete:** Remove inappropriate reviews permanently

---

### 1️⃣3️⃣ User Management (5 endpoints)
```
GET    /api/admin/user-management                      🔐 Admin Only (List users)
GET    /api/admin/user-management/:userId              🔐 Admin Only (Detail)
PATCH  /api/admin/user-management/:userId/toggle-ban   🔐 Admin Only (BAN/UNBAN)
PATCH  /api/admin/user-management/:userId/change-role  🔐 Admin Only (Change role)
DELETE /api/admin/user-management/:userId              🔐 Admin Only (Delete user)
```

**Features:**
- **Search & filter:** name, email, role, status, email_domain, date range
- **Statistics:** total, admin/user count, banned/active, new users (7d, 30d)
- **User detail:** Basic info + children + recent activity (reviews, favorites, schedules)
- **BAN/UNBAN:** Toggle account status (prevents login)
- **Change role:** USER ↔ ADMIN
- **Hard delete:** Remove spam accounts (cannot delete admin)
- **Protection:** Cannot ban or delete admin accounts

---

## 🔐 Authentication & Authorization

### Auth Levels:
- ❌ **Public:** No authentication required
- 🔓 **Optional Auth:** Better results with authentication
- ✅ **Auth Required:** JWT token required
- 🔐 **Admin Only:** Admin role required

### JWT Token:
- **Expires:** 7 days
- **Header:** `Authorization: Bearer <token>`
- **Payload:** userId, role (USER/ADMIN)

### Roles:
- **ADMIN:** Full access to all endpoints + dashboard
- **USER:** Access to user endpoints (children, favorites, schedules, reviews)
- **GUEST:** Access to public endpoints (spots, spot details)

---

## 📊 Database Tables

| Table | Records | Purpose |
|-------|---------|---------|
| users | 4 | User accounts (1 admin + 3 users) |
| children | 6 | Children profiles |
| spots | 10 | Locations in Tokyo |
| spot_images | 20+ | Spot photos |
| spot_tags | 50+ | Flexible tagging system |
| reviews | 10 | User reviews |
| favorites | 7 | User favorites |
| schedules | 4 | Weekend schedules |
| child_preferences | - | Learned preferences from swipe |
| kid_swipe | - | Swipe history (LIKE/SKIP) |

---

## 🧪 Testing Quick Start

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buibaomoyu@gmail.com","password":"B@o140804"}'
```

### 3. Search Spots
```bash
curl "http://localhost:3000/api/spots/search?keyword=zoo&category=ZOO"
```

### 4. Get Recommendations
```bash
curl "http://localhost:3000/api/recommendations?lat=35.6812&lng=139.7671&child_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Admin Dashboard (Admin only)
```bash
curl "http://localhost:3000/api/admin/dashboard?period=30" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📁 Documentation Files

| File | Description |
|------|-------------|
| `README.md` | Project overview, setup, API summary |
| `API_ENDPOINTS.md` | Complete API reference với examples |
| `DATABASE_SCHEMA.md` | Database structure & relationships |
| `DATABASE_SETUP.md` | Database setup instructions |
| `SCHEDULES_API_TESTING.md` | Testing guide for Schedules API |
| `RECOMMENDATIONS_API_TESTING.md` | Testing guide for Recommendations API |
| `REVIEWS_API_TESTING.md` | Testing guide for Reviews API |
| `API_SUMMARY.md` | This file - Quick reference |

---

## 🎯 API Coverage by Feature

| Feature | Endpoints | Status |
|---------|-----------|--------|
| User Management | 4 | ✅ Complete |
| Spot Discovery | 4 | ✅ Complete |
| Reviews & Ratings | 7 | ✅ Complete |
| Favorites | 7 | ✅ Complete |
| Schedule Planning | 6 | ✅ Complete |
| Child Profiles | 5 | ✅ Complete |
| Kids Swipe Game | 4 | ✅ Complete |
| Smart Recommendations | 2 | ✅ Complete |
| Admin Dashboard | 3 | ✅ Complete |
| Spot Management (Admin) | 5 | ✅ Complete |
| Review Management (Admin) | 5 | ✅ Complete |
| User Management (Admin) | 5 | ✅ Complete |
| Weather Integration | 1 | ✅ Complete |

**Total Coverage: 100%** 🎉

---

## 🚀 Next Steps

### For Developers:
1. ✅ All backend APIs complete
2. ⏳ Frontend integration
3. ⏳ Mobile app development
4. ⏳ Real weather API integration
5. ⏳ Image upload functionality
6. ⏳ Push notifications
7. ⏳ Advanced analytics

### For Admins:
1. Login với admin account
2. Access dashboard: `/api/admin/dashboard`
3. Monitor KPIs daily
4. Review user activity trends
5. Manage spots and users

### For Users:
1. Đăng ký tài khoản
2. Thêm hồ sơ trẻ
3. Tìm kiếm địa điểm
4. Swipe để học sở thích
5. Nhận gợi ý thông minh
6. Lên lịch trình cuối tuần
7. Đánh giá sau khi đi

---

**🎉 Congratulations! Backend API 100% Complete!**

**Server:** `http://localhost:3000`
**Docs:** `http://localhost:3000/api`
**Health:** `http://localhost:3000/health`

Happy Coding! 🚀
