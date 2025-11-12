# 📖 HƯỚNG DẪN TEST API - FAVORITES & KIDS SWIPE

## ✅ KIỂM TRA TÍNH TƯƠNG THÍCH API VỚI DATABASE

### **1. Favorites API - ✅ HOÀN TOÀN TƯƠNG THÍCH**

| API Endpoint | Database Fields | Status |
|--------------|-----------------|--------|
| GET /api/favorites | favorites(favorite_id, user_id, spot_id, collection_tag) | ✅ OK |
| GET /api/favorites/check/:spotId | JOIN spots, spot_tags | ✅ OK |
| POST /api/favorites | INSERT favorites | ✅ OK |
| PUT /api/favorites/:favoriteId | UPDATE favorites | ✅ OK |
| DELETE /api/favorites/:favoriteId | DELETE favorites | ✅ OK |
| DELETE /api/favorites/spot/:spotId | DELETE by spot_id | ✅ OK |
| GET /api/favorites/collections | GROUP BY collection_tag | ✅ OK |

**Kết luận:** API đã phù hợp 100% với schema database.

---

### **2. Kids Swipe API - ✅ HOÀN TOÀN TƯƠNG THÍCH**

| API Endpoint | Database Fields | Status |
|--------------|-----------------|--------|
| POST /api/kids-swipe/:childId/swipe | kid_swipe(child_id, spot_id, action) | ✅ OK |
| GET /api/kids-swipe/:childId/spots | SELECT spots NOT IN kid_swipe | ✅ OK |
| GET /api/kids-swipe/:childId/preferences | child_preferences(tag_name) | ✅ OK |
| GET /api/kids-swipe/:childId/recommendations | JOIN spot_tags, child_preferences | ✅ OK |

**Kết luận:** API đã được cập nhật với `spot_id` thay vì `tag_name` trong bảng `kid_swipe`.

---

## 🚀 HƯỚNG DẪN TEST VỚI POSTMAN

### **BƯỚC 1: SETUP POSTMAN COLLECTION**

#### **1.1. Tạo Collection mới:**
1. Mở Postman
2. Click "New" → "Collection"
3. Đặt tên: "Kodomo Weekend API - Favorites & KidsSwipe"
4. Tạo folder:
   - 📁 **1. Authentication**
   - 📁 **2. Favorites API**
   - 📁 **3. Kids Swipe API**

#### **1.2. Setup Variables:**
1. Click vào Collection → Tab "Variables"
2. Thêm variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `token` | *(empty)* | *(will be set after login)* |
| `user_id` | *(empty)* | *(will be set after login)* |
| `child_id` | `1` | `1` |
| `spot_id` | `1` | `1` |

---

### **BƯỚC 2: AUTHENTICATION**

#### **2.1. Login API**

**Request:**
```
POST {{base_url}}/api/auth/login
```

**Body (raw JSON):**
```json
{
  "email": "buibaomoyu@gmail.com",
  "password": "B@o140804"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "user_id": 2,
      "email": "buibaomoyu@gmail.com",
      "first_name": "Bao",
      "last_name": "Bui",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Tests Script (Tab "Tests"):**
```javascript
// Save token to collection variable
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("token", jsonData.data.token);
    pm.collectionVariables.set("user_id", jsonData.data.user.user_id);
    console.log("Token saved:", jsonData.data.token);
}
```

---

## 📋 **PHẦN 1: TEST FAVORITES API**

### **Test Case 1: Lấy danh sách Favorites**

**Request:**
```
GET {{base_url}}/api/favorites
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (Optional):**
- `collection_tag`: Animals
- `limit`: 10
- `offset`: 0

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "favorite_id": 1,
        "spot_id": 1,
        "collection_tag": "Animals",
        "created_at": "2025-11-12T10:00:00.000Z",
        "name": "Ueno Zoo",
        "category": "ZOO",
        "min_age": 2,
        "max_age": 12,
        "price_range": "1000_3000",
        "address": "Taito-ku, Tokyo",
        "latitude": 35.7152,
        "longitude": 139.7737,
        "average_rating": 4.5,
        "review_count": 2,
        "is_indoor": false,
        "weather_suitable": "RAIN_OK",
        "main_image": "https://images.unsplash.com/...",
        "tags": ["outdoor", "animals", "rain_ok", "age_2-5", "age_6-12", "educational", "nature"]
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

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has favorites array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.favorites).to.be.an('array');
});

pm.test("Each favorite has tags array", function () {
    var jsonData = pm.response.json();
    jsonData.data.favorites.forEach(function(fav) {
        pm.expect(fav.tags).to.be.an('array');
    });
});
```

---

### **Test Case 2: Kiểm tra Spot đã Favorite chưa**

**Request:**
```
GET {{base_url}}/api/favorites/check/{{spot_id}}
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (Đã favorite):**
```json
{
  "success": true,
  "data": {
    "is_favorite": true,
    "favorite_id": 1,
    "collection_tag": "Animals"
  }
}
```

**Expected Response (Chưa favorite):**
```json
{
  "success": true,
  "data": {
    "is_favorite": false,
    "favorite_id": null,
    "collection_tag": null
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has is_favorite boolean", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.is_favorite).to.be.a('boolean');
});
```

---

### **Test Case 3: Thêm Spot vào Favorites**

**Request:**
```
POST {{base_url}}/api/favorites
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "spot_id": 3,
  "collection_tag": "Weekend Plans"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã thêm vào yêu thích",
  "data": {
    "favorite_id": 11,
    "spot_id": 3,
    "name": "Tokyo Skytree",
    "category": "THEME_PARK",
    "price_range": "3000_5000",
    "address": "Sumida-ku, Tokyo",
    "average_rating": 5,
    "main_image": "https://images.unsplash.com/...",
    "tags": ["indoor", "sightseeing", "age_0-3", "age_4-8", "age_9-15", "age_16-18", "family"],
    "collection_tag": "Weekend Plans"
  }
}
```

**Error Case - Duplicate:**
```json
{
  "success": false,
  "message": "Địa điểm đã có trong danh sách yêu thích"
}
```

**Tests:**
```javascript
pm.test("Status code is 200 or 409", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 409]);
});

pm.test("Success response has favorite_id", function () {
    if (pm.response.code === 200) {
        var jsonData = pm.response.json();
        pm.expect(jsonData.data.favorite_id).to.be.a('number');
        
        // Save favorite_id for later tests
        pm.collectionVariables.set("favorite_id", jsonData.data.favorite_id);
    }
});
```

---

### **Test Case 4: Cập nhật Collection Tag**

**Request:**
```
PUT {{base_url}}/api/favorites/{{favorite_id}}
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "collection_tag": "Summer 2025"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã cập nhật yêu thích",
  "data": {
    "favorite_id": 11,
    "spot_id": 3,
    "name": "Tokyo Skytree",
    "collection_tag": "Summer 2025",
    "tags": ["indoor", "sightseeing", "age_0-3", ...]
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Collection tag updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.collection_tag).to.eql("Summer 2025");
});
```

---

### **Test Case 5: Xóa Favorite bằng favorite_id**

**Request:**
```
DELETE {{base_url}}/api/favorites/{{favorite_id}}
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích"
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Success message returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

---

### **Test Case 6: Xóa Favorite bằng spot_id (Toggle Button)**

**Request:**
```
DELETE {{base_url}}/api/favorites/spot/3
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Use Case:** Khi user bấm nút ♡ để unfavorite trên màn hình chi tiết, chỉ biết spot_id chứ không có favorite_id.

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích"
}
```

---

### **Test Case 7: Lấy danh sách Collections**

**Request:**
```
GET {{base_url}}/api/favorites/collections
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "collection_tag": "Animals",
        "count": 2
      },
      {
        "collection_tag": "Indoor",
        "count": 1
      },
      {
        "collection_tag": "Kids Swipe",
        "count": 2
      }
    ]
  }
}
```

**Use Case:** Hiển thị danh sách collections để user lọc favorites.

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Collections is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.collections).to.be.an('array');
});
```

---

## 👶 **PHẦN 2: TEST KIDS SWIPE API**

### **Test Case 8: Lấy danh sách Spots chưa Swipe**

**Request:**
```
GET {{base_url}}/api/kids-swipe/{{child_id}}/spots
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (Optional):**
- `limit`: 20
- `offset`: 0
- `category`: ZOO
- `lat`: 35.6812
- `lng`: 139.7671
- `distance`: 50

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "spot_id": 3,
        "name": "Tokyo Skytree",
        "description": "634m tall observation tower",
        "category": "THEME_PARK",
        "min_age": 0,
        "max_age": 18,
        "price_range": "3000_5000",
        "is_indoor": true,
        "address": "Sumida-ku, Tokyo",
        "latitude": 35.7101,
        "longitude": 139.8107,
        "average_rating": 5,
        "review_count": 1,
        "favorite_count": 1,
        "main_image": "https://images.unsplash.com/...",
        "tags": ["indoor", "sightseeing", "age_0-3", "age_4-8", "age_9-15", "age_16-18", "family"],
        "distance": 5.23
      }
    ],
    "child": {
      "child_id": 1,
      "name": "Minh",
      "age": 5
    },
    "pagination": {
      "total": 7,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

**Giải thích:**
- Child_id=1 (Minh) đã swipe spots: 1, 6, 2
- API trả về các spots còn lại: 3, 4, 5, 7, 8, 9, 10
- Spots phù hợp với độ tuổi (5 tuổi)

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Spots array returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.spots).to.be.an('array');
});

pm.test("Child info included", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.child).to.have.property('name');
    pm.expect(jsonData.data.child).to.have.property('age');
});

// Save first spot_id for swipe test
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data.spots.length > 0) {
        pm.collectionVariables.set("swipe_spot_id", jsonData.data.spots[0].spot_id);
    }
}
```

---

### **Test Case 9: Child Swipe LIKE một Spot**

**Request:**
```
POST {{base_url}}/api/kids-swipe/{{child_id}}/swipe
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "spot_id": 3,
  "action": "LIKE"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã lưu sở thích của trẻ - Tokyo Skytree",
  "data": {
    "action": "LIKE",
    "spot_id": 3,
    "spot_name": "Tokyo Skytree",
    "tags_saved": 7,
    "total_tags": 7
  }
}
```

**Điều gì xảy ra sau khi LIKE:**
1. ✅ **kid_swipe table:** INSERT (child_id=1, spot_id=3, action='LIKE')
2. ✅ **child_preferences table:** INSERT 7 tags (indoor, sightseeing, age_0-3, age_4-8, age_9-15, age_16-18, family)
3. ✅ **favorites table:** INSERT (user_id=2, spot_id=3, collection_tag='Kids Swipe')

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Action is LIKE", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.action).to.eql("LIKE");
});

pm.test("Tags saved", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.tags_saved).to.be.a('number');
    pm.expect(jsonData.data.tags_saved).to.be.above(0);
});
```

---

### **Test Case 10: Child Swipe SKIP một Spot**

**Request:**
```
POST {{base_url}}/api/kids-swipe/{{child_id}}/swipe
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "spot_id": 4,
  "action": "SKIP"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã bỏ qua - Odaiba Seaside Park",
  "data": {
    "action": "SKIP",
    "spot_id": 4,
    "spot_name": "Odaiba Seaside Park"
  }
}
```

**Điều gì xảy ra sau khi SKIP:**
1. ✅ **kid_swipe table:** INSERT (child_id=1, spot_id=4, action='SKIP')
2. ❌ **child_preferences:** KHÔNG lưu gì
3. ❌ **favorites:** KHÔNG lưu gì

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Action is SKIP", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.action).to.eql("SKIP");
});
```

---

### **Test Case 11: Lấy Preferences của Child**

**Request:**
```
GET {{base_url}}/api/kids-swipe/{{child_id}}/preferences
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "child": {
      "child_id": 1,
      "name": "Minh",
      "age": 5
    },
    "preferences": [
      {
        "tag_name": "animals",
        "count": 2,
        "last_updated": "2025-11-12T14:00:00.000Z"
      },
      {
        "tag_name": "outdoor",
        "count": 2,
        "last_updated": "2025-11-12T14:00:00.000Z"
      },
      {
        "tag_name": "indoor",
        "count": 1,
        "last_updated": "2025-11-12T15:30:00.000Z"
      }
    ]
  }
}
```

**Giải thích:**
- `count`: Số lần tag xuất hiện (từ các spots đã LIKE)
- `last_updated`: Lần cuối cùng thêm tag này
- Sắp xếp theo count DESC → Tags được thích nhiều nhất lên đầu

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Preferences is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.preferences).to.be.an('array');
});

pm.test("Each preference has count", function () {
    var jsonData = pm.response.json();
    jsonData.data.preferences.forEach(function(pref) {
        pm.expect(pref.count).to.be.a('number');
    });
});
```

---

### **Test Case 12: Lấy Recommendations dựa trên Preferences**

**Request:**
```
GET {{base_url}}/api/kids-swipe/{{child_id}}/recommendations
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (Optional):**
- `limit`: 10
- `offset`: 0
- `min_match`: 2 (Tối thiểu 2 tags trùng khớp)
- `lat`: 35.6812
- `lng`: 139.7671
- `distance`: 50

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "spot_id": 10,
        "name": "Inokashira Park Zoo",
        "description": "Small zoo and aquatic life museum",
        "category": "ZOO",
        "min_age": 2,
        "max_age": 12,
        "price_range": "UNDER_1000",
        "is_indoor": false,
        "address": "Musashino-shi, Tokyo",
        "latitude": 35.7,
        "longitude": 139.5776,
        "average_rating": 0,
        "review_count": 0,
        "favorite_count": 0,
        "main_image": "https://images.unsplash.com/...",
        "tags": ["outdoor", "animals", "cheap", "age_2-5", "age_6-12", "nature", "small_zoo"],
        "match_score": 3,
        "distance": 15.42
      }
    ],
    "child": {
      "child_id": 1,
      "name": "Minh",
      "age": 5
    },
    "preferences_used": ["animals", "outdoor"],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0,
      "has_more": false
    }
  }
}
```

**Giải thích:**
- `match_score`: Số lượng tags trùng khớp giữa spot và child preferences
- Ví dụ: Minh thích [animals, outdoor] → Inokashira Zoo có cả 2 tags → match_score=2
- Sắp xếp theo: match_score DESC, average_rating DESC

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Recommendations have match_score", function () {
    var jsonData = pm.response.json();
    jsonData.data.recommendations.forEach(function(spot) {
        pm.expect(spot.match_score).to.be.a('number');
        pm.expect(spot.match_score).to.be.above(0);
    });
});

pm.test("Preferences used included", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.preferences_used).to.be.an('array');
});
```

---

## 🔄 **LUỒNG TEST HOÀN CHỈNH**

### **Scenario: Parent thêm favorite, Child swipe spots**

```
1. LOGIN
   POST /api/auth/login
   → Save token
   
2. XEM DANH SÁCH FAVORITES CỦA PARENT
   GET /api/favorites
   → Hiện có: Animals (2), Indoor (1)
   
3. THÊM MỘT SPOT VÀO FAVORITES
   POST /api/favorites
   Body: { spot_id: 7, collection_tag: "Outdoor" }
   → Yoyogi Park được thêm vào favorites
   
4. CHILD MỞ KIDSWIPE
   GET /api/kids-swipe/1/spots
   → Trả về 7 spots chưa swipe (loại trừ 1, 6, 2 đã swipe)
   
5. CHILD SWIPE LIKE TOKYO SKYTREE
   POST /api/kids-swipe/1/swipe
   Body: { spot_id: 3, action: "LIKE" }
   → Lưu 7 tags vào child_preferences
   → TỰ ĐỘNG thêm Tokyo Skytree vào favorites của parent (collection_tag="Kids Swipe")
   
6. PARENT XEM LẠI FAVORITES
   GET /api/favorites
   → Hiện có: Animals (2), Indoor (1), Outdoor (1), Kids Swipe (1)
   
7. XEM PREFERENCES CỦA CHILD
   GET /api/kids-swipe/1/preferences
   → Tags: animals(2), outdoor(2), indoor(1), sightseeing(1)...
   
8. XEM RECOMMENDATIONS CHO CHILD
   GET /api/kids-swipe/1/recommendations?min_match=2
   → Spots có nhiều tags trùng khớp
```

---

## 📊 **VALIDATION RULES**

### **Favorites API:**
| Rule | Expected Behavior |
|------|-------------------|
| Add duplicate favorite | ❌ 409 "Địa điểm đã có trong danh sách yêu thích" |
| Add non-existent spot | ❌ 404 "Không tìm thấy địa điểm" |
| Delete other user's favorite | ❌ 404 "Không tìm thấy yêu thích" |
| Empty collection_tag | ✅ OK (NULL allowed) |

### **Kids Swipe API:**
| Rule | Expected Behavior |
|------|-------------------|
| Swipe with invalid action | ❌ 400 "action phải là LIKE hoặc SKIP" |
| Swipe other user's child | ❌ 404 "Không có quyền truy cập" |
| Swipe same spot twice | ✅ OK (ignored, no error) |
| Swipe non-existent spot | ❌ 404 "Không tìm thấy địa điểm" |

---

## 🎯 **CHECKLIST TEST**

### **Favorites API:**
- [ ] ✅ GET /api/favorites - Lấy list
- [ ] ✅ GET /api/favorites?collection_tag=Animals - Filter by tag
- [ ] ✅ GET /api/favorites/check/:spotId - Check favorite status
- [ ] ✅ POST /api/favorites - Add favorite
- [ ] ❌ POST /api/favorites (duplicate) - Error 409
- [ ] ✅ PUT /api/favorites/:favoriteId - Update collection_tag
- [ ] ✅ DELETE /api/favorites/:favoriteId - Delete by ID
- [ ] ✅ DELETE /api/favorites/spot/:spotId - Delete by spot_id
- [ ] ✅ GET /api/favorites/collections - Get collections list

### **Kids Swipe API:**
- [ ] ✅ GET /api/kids-swipe/:childId/spots - Get unswipped spots
- [ ] ✅ POST /api/kids-swipe/:childId/swipe (LIKE) - Swipe like
- [ ] ✅ POST /api/kids-swipe/:childId/swipe (SKIP) - Swipe skip
- [ ] ❌ POST /api/kids-swipe/:childId/swipe (invalid action) - Error 400
- [ ] ✅ GET /api/kids-swipe/:childId/preferences - Get child preferences
- [ ] ✅ GET /api/kids-swipe/:childId/recommendations - Get recommendations

### **Integration Tests:**
- [ ] ✅ Child LIKE → Spot added to parent's favorites
- [ ] ✅ collection_tag="Kids Swipe" for auto-added favorites
- [ ] ✅ Tags saved to child_preferences
- [ ] ✅ kid_swipe table updated
- [ ] ✅ Swipped spots excluded from /spots endpoint

---

## 🚀 **TIPS**

1. **Sử dụng Environment Variables** thay vì hardcode token
2. **Chain requests** bằng Tests script để tự động lưu IDs
3. **Test error cases** để đảm bảo validation hoạt động
4. **Monitor Console** để xem logs từ Tests script
5. **Export Collection** để backup và share với team

**Happy Testing! 🎉**
