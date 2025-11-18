# Review Management API Testing Guide

> **🔐 Admin Only** - Hướng dẫn test API quản lý đánh giá (Review Management)

## Mục lục
1. [Setup](#setup)
2. [Test Scenarios](#test-scenarios)
3. [Test Cases](#test-cases)
4. [Validation Rules](#validation-rules)
5. [Complete Workflow](#complete-workflow)

---

## Setup

### 1. Start Server
```bash
cd backend
npm run dev
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

**Save the token:**
```bash
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Test Scenarios

### Scenario 1: View All Reviews
**Goal:** Admin cần xem tất cả reviews để kiểm duyệt

### Scenario 2: Filter by Rating
**Goal:** Tìm reviews có rating thấp để kiểm tra chất lượng

### Scenario 3: Filter by Status
**Goal:** Xem các reviews đã ẩn hoặc đang công khai

### Scenario 4: Filter Reported Reviews
**Goal:** Tìm reviews bị report để xử lý

### Scenario 5: View Review Detail
**Goal:** Xem chi tiết review và lịch sử của user

### Scenario 6: Toggle Review Status
**Goal:** Ẩn/hiện review không phù hợp

### Scenario 7: Reset Report Count
**Goal:** Reset report count sau khi admin đã kiểm tra

### Scenario 8: Delete Inappropriate Review
**Goal:** Xóa review vi phạm chính sách

---

## Test Cases

### 1. Get All Reviews (No Filter)
**Mục đích:** Xem tất cả reviews với statistics

```bash
curl -X GET "http://localhost:3000/api/admin/review-management" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
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

**Validation:**
- ✅ Statistics hiển thị đầy đủ (total, public, hidden, with_image, reported)
- ✅ Rating distribution có đủ 5 levels (1-5)
- ✅ Reviews sorted by latest (created_at DESC)

---

### 2. Filter by Rating (Low Ratings)
**Mục đích:** Tìm reviews có rating thấp (1-2 sao)

```bash
curl -X GET "http://localhost:3000/api/admin/review-management?rating=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Test với rating khác:**
```bash
# Rating 2 sao
curl -X GET "http://localhost:3000/api/admin/review-management?rating=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Rating 5 sao
curl -X GET "http://localhost:3000/api/admin/review-management?rating=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ Chỉ trả về reviews có rating = giá trị filter
- ✅ Statistics cập nhật theo filter

---

### 3. Filter by Status
**Mục đích:** Xem reviews công khai, ẩn, hoặc tất cả

```bash
# Chỉ xem reviews công khai
curl -X GET "http://localhost:3000/api/admin/review-management?status=public" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Chỉ xem reviews đã ẩn
curl -X GET "http://localhost:3000/api/admin/review-management?status=hidden" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Xem tất cả (default)
curl -X GET "http://localhost:3000/api/admin/review-management?status=all" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ `status=public` → is_hidden = 0
- ✅ `status=hidden` → is_hidden = 1
- ✅ `status=all` → cả hai

---

### 4. Filter by Spot ID
**Mục đích:** Xem tất cả reviews của 1 spot cụ thể

```bash
curl -X GET "http://localhost:3000/api/admin/review-management?spot_id=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ Chỉ trả về reviews có spot_id = 1
- ✅ spot_name và spot_category hiển thị đúng

---

### 5. Filter by User ID
**Mục đích:** Xem tất cả reviews của 1 user cụ thể

```bash
curl -X GET "http://localhost:3000/api/admin/review-management?user_id=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ Chỉ trả về reviews của user_id = 2
- ✅ user_name và user_email hiển thị đúng

---

### 6. Filter by Image Presence
**Mục đích:** Tìm reviews có hoặc không có ảnh

```bash
# Reviews có ảnh
curl -X GET "http://localhost:3000/api/admin/review-management?has_image=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Reviews không có ảnh
curl -X GET "http://localhost:3000/api/admin/review-management?has_image=false" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ `has_image=true` → image_url NOT NULL
- ✅ `has_image=false` → image_url IS NULL

---

### 7. Filter by Date Range
**Mục đích:** Xem reviews trong khoảng thời gian cụ thể

```bash
# Reviews từ ngày 1/1/2024 đến 31/1/2024
curl -X GET "http://localhost:3000/api/admin/review-management?date_from=2024-01-01&date_to=2024-01-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Reviews từ ngày 1/1/2024 đến hiện tại
curl -X GET "http://localhost:3000/api/admin/review-management?date_from=2024-01-01" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ Chỉ trả về reviews trong khoảng thời gian
- ✅ Sử dụng DATE() function cho MySQL compatibility

---

### 8. Sort Options
**Mục đích:** Test các tùy chọn sắp xếp

```bash
# Mới nhất (default)
curl -X GET "http://localhost:3000/api/admin/review-management?sort=latest" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Cũ nhất
curl -X GET "http://localhost:3000/api/admin/review-management?sort=oldest" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Rating cao nhất
curl -X GET "http://localhost:3000/api/admin/review-management?sort=rating_high" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Rating thấp nhất
curl -X GET "http://localhost:3000/api/admin/review-management?sort=rating_low" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ `latest` → ORDER BY created_at DESC
- ✅ `oldest` → ORDER BY created_at ASC
- ✅ `rating_high` → ORDER BY rating DESC
- ✅ `rating_low` → ORDER BY rating ASC

---

### 9. Combined Filters
**Mục đích:** Test nhiều filters cùng lúc

```bash
# Low rating + public + có ảnh
curl -X GET "http://localhost:3000/api/admin/review-management?rating=1&status=public&has_image=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Spot cụ thể + date range + sort
curl -X GET "http://localhost:3000/api/admin/review-management?spot_id=1&date_from=2024-01-01&sort=rating_low" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ Tất cả filters được apply đồng thời
- ✅ Statistics phản ánh kết quả sau filter

---

### 10. Pagination
**Mục đích:** Test phân trang

```bash
# Trang 1 (20 items)
curl -X GET "http://localhost:3000/api/admin/review-management?limit=20&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Trang 2 (20 items)
curl -X GET "http://localhost:3000/api/admin/review-management?limit=20&offset=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 10 items per page
curl -X GET "http://localhost:3000/api/admin/review-management?limit=10&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ Pagination metadata chính xác (total, limit, offset, has_more)
- ✅ has_more = true nếu còn data

---

### 11. Get Review Detail
**Mục đích:** Xem chi tiết review với user history

```bash
curl -X GET "http://localhost:3000/api/admin/review-management/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
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

**Validation:**
- ✅ Review detail đầy đủ thông tin
- ✅ user_other_reviews hiển thị các reviews khác của user
- ✅ report_history null nếu không có report

---

### 12. Toggle Review Status (Hide)
**Mục đích:** Ẩn review không phù hợp

```bash
curl -X PATCH "http://localhost:3000/api/admin/review-management/1/toggle-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_hidden": true
  }'
```

**Expected Response:**
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

**Verification:**
```bash
# Kiểm tra review đã ẩn
curl -X GET "http://localhost:3000/api/admin/review-management/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ is_hidden = 1 trong database
- ✅ Review không hiển thị cho user thường

---

### 13. Toggle Review Status (Unhide)
**Mục đích:** Hiện lại review đã ẩn

```bash
curl -X PATCH "http://localhost:3000/api/admin/review-management/1/toggle-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_hidden": false
  }'
```

**Expected Response:**
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

**Validation:**
- ✅ is_hidden = 0 trong database
- ✅ Review hiển thị lại cho user thường

---

### 14. Reset Report Count
**Mục đích:** Reset report count sau khi admin đã kiểm tra

```bash
curl -X POST "http://localhost:3000/api/admin/review-management/1/reset-reports" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
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

**Verification:**
```bash
curl -X GET "http://localhost:3000/api/admin/review-management/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Validation:**
- ✅ report_count = 0 trong database
- ✅ Review không còn trong danh sách reported

---

### 15. Delete Review (Hard Delete)
**Mục đích:** Xóa review vi phạm chính sách

```bash
curl -X DELETE "http://localhost:3000/api/admin/review-management/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
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

**Verification:**
```bash
# Kiểm tra review đã xóa
curl -X GET "http://localhost:3000/api/admin/review-management/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Kiểm tra spot statistics đã update
curl -X GET "http://localhost:3000/api/spots/1"
```

**Validation:**
- ✅ Review không còn trong database
- ✅ Spot's review_count giảm 1
- ✅ Spot's average_rating được tính lại

---

## Validation Rules

### 1. Authentication
- ✅ Chỉ Admin mới access được
- ✅ Token phải valid và có role ADMIN
- ❌ User thường không access được

### 2. Filter Validation
- `rating`: 1-5 (integer)
- `status`: 'public' | 'hidden' | 'all'
- `has_image`: true/false (boolean)
- `date_from`, `date_to`: YYYY-MM-DD format
- `sort`: 'latest' | 'oldest' | 'rating_high' | 'rating_low'

### 3. Statistics Accuracy
- ✅ total_reviews = public + hidden
- ✅ reviews_with_image count chính xác
- ✅ reported_reviews count chính xác
- ✅ rating_distribution sum = total_reviews

### 4. Toggle Status Rules
- ✅ is_hidden chỉ nhận boolean (true/false)
- ✅ Toggle giữa public ↔ hidden
- ✅ Message thay đổi theo action ("Đã ẩn" / "Đã hiện")

### 5. Delete Rules
- ✅ Hard delete (xóa vĩnh viễn)
- ✅ Tự động update spot statistics
- ✅ Không thể undo

---

## Complete Workflow

### Workflow: Admin Kiểm Duyệt Reviews

```bash
#!/bin/bash

# 1. Login as Admin
echo "=== STEP 1: Admin Login ==="
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')
echo $RESPONSE | jq .

ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.data.token')
echo "Admin Token: $ADMIN_TOKEN"

# 2. Xem tất cả reviews với statistics
echo -e "\n=== STEP 2: Get All Reviews ==="
curl -s -X GET "http://localhost:3000/api/admin/review-management" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 3. Filter reviews có rating thấp (1-2 sao)
echo -e "\n=== STEP 3: Filter Low Rating Reviews ==="
curl -s -X GET "http://localhost:3000/api/admin/review-management?rating=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 4. Filter reviews bị report
echo -e "\n=== STEP 4: Filter Reported Reviews ==="
curl -s -X GET "http://localhost:3000/api/admin/review-management?status=public" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.reviews[] | select(.report_count > 0)'

# 5. Xem chi tiết review có vấn đề
echo -e "\n=== STEP 5: Get Review Detail ==="
REVIEW_ID=1
curl -s -X GET "http://localhost:3000/api/admin/review-management/$REVIEW_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 6. Quyết định: Ẩn review
echo -e "\n=== STEP 6: Hide Inappropriate Review ==="
curl -s -X PATCH "http://localhost:3000/api/admin/review-management/$REVIEW_ID/toggle-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_hidden": true
  }' | jq .

# 7. Reset report count sau khi xử lý
echo -e "\n=== STEP 7: Reset Report Count ==="
curl -s -X POST "http://localhost:3000/api/admin/review-management/$REVIEW_ID/reset-reports" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 8. Kiểm tra lại statistics
echo -e "\n=== STEP 8: Check Updated Statistics ==="
curl -s -X GET "http://localhost:3000/api/admin/review-management" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.statistics'

# 9. Nếu cần xóa review vi phạm nghiêm trọng
echo -e "\n=== STEP 9: Delete Inappropriate Review (Optional) ==="
# curl -s -X DELETE "http://localhost:3000/api/admin/review-management/$REVIEW_ID" \
#   -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo -e "\n=== Workflow Complete ==="
```

**Save as:** `test_review_management_workflow.sh`

**Run:**
```bash
chmod +x test_review_management_workflow.sh
./test_review_management_workflow.sh
```

---

## Error Cases

### 1. Unauthorized Access
```bash
curl -X GET "http://localhost:3000/api/admin/review-management" \
  -H "Authorization: Bearer invalid_token"
```

**Expected:**
```json
{
  "success": false,
  "message": "Token không hợp lệ"
}
```

---

### 2. Non-Admin Access
```bash
# Login as regular user
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }')

USER_TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# Try to access admin API
curl -X GET "http://localhost:3000/api/admin/review-management" \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected:**
```json
{
  "success": false,
  "message": "Chỉ admin mới có quyền truy cập"
}
```

---

### 3. Review Not Found
```bash
curl -X GET "http://localhost:3000/api/admin/review-management/99999" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:**
```json
{
  "success": false,
  "message": "Không tìm thấy review"
}
```

---

### 4. Invalid Filter Values
```bash
# Invalid rating
curl -X GET "http://localhost:3000/api/admin/review-management?rating=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Invalid status
curl -X GET "http://localhost:3000/api/admin/review-management?status=invalid" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Invalid date format
curl -X GET "http://localhost:3000/api/admin/review-management?date_from=2024/01/01" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** Results empty or validation error

---

## Summary

**Total Test Cases:** 15

**Test Coverage:**
- ✅ Get all reviews with statistics (1 test)
- ✅ Filter by rating (1 test)
- ✅ Filter by status (1 test)
- ✅ Filter by spot (1 test)
- ✅ Filter by user (1 test)
- ✅ Filter by image presence (1 test)
- ✅ Filter by date range (1 test)
- ✅ Sort options (1 test)
- ✅ Combined filters (1 test)
- ✅ Pagination (1 test)
- ✅ Get review detail (1 test)
- ✅ Toggle status (2 tests)
- ✅ Reset report count (1 test)
- ✅ Delete review (1 test)

**Authentication:**
- ✅ Admin only access
- ✅ Token validation
- ✅ Role-based authorization

**Statistics Validation:**
- ✅ Total reviews count
- ✅ Public/hidden breakdown
- ✅ Reviews with image count
- ✅ Reported reviews count
- ✅ Rating distribution (1-5)

**Data Integrity:**
- ✅ Spot statistics auto-update after delete
- ✅ Toggle status preserves data
- ✅ Reset report count works correctly

---

**📖 Related Documentation:**
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - Full API reference
- [README.md](README.md) - Project overview
- [DATABASE_SCHEMA.md](database/DATABASE_SCHEMA.md) - Database structure

**🎉 Happy Testing!**
