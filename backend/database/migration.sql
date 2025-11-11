-- =============================================
-- Kodomo Weekend Navi - Database Migration
-- Cẩm nang đi chơi cuối tuần cùng con
-- =============================================

-- Xóa database nếu đã tồn tại (cẩn thận khi chạy trên production!)
DROP DATABASE IF EXISTS kodomo_weekend_navi;

-- Tạo database mới
CREATE DATABASE kodomo_weekend_navi 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database vừa tạo
USE kodomo_weekend_navi;

-- =============================================
-- TABLE 1: Users (Quản lý người dùng)
-- =============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER' NOT NULL,
    status ENUM('ACTIVE', 'BANNED') DEFAULT 'ACTIVE' NOT NULL,
    location_lat DECIMAL(10, 8) NULL,
    location_lng DECIMAL(11, 8) NULL,
    location_name VARCHAR(255) NULL,
    agreement BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 2: Children (Hồ sơ trẻ em)
-- =============================================
CREATE TABLE children (
    child_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    age INT GENERATED ALWAYS AS (YEAR(CURDATE()) - YEAR(birth_date)) STORED,
    avatar_url VARCHAR(500) NULL,
    notes TEXT NULL COMMENT 'Ghi chú sức khỏe/chú ý đặc biệt',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 3: Child_Preferences (Sở thích trẻ em)
-- =============================================
CREATE TABLE child_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    preference_type ENUM('LIKE', 'DISLIKE') NOT NULL,
    tag_name VARCHAR(50) NOT NULL COMMENT 'animals, crafts, sports, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
    INDEX idx_child_id (child_id),
    UNIQUE KEY unique_child_preference (child_id, preference_type, tag_name)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 4: Spots (Địa điểm)
-- =============================================
CREATE TABLE spots (
    spot_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category ENUM('MUSEUM', 'INDOOR_PLAY', 'OUTDOOR_PLAY', 'PARK', 'AQUARIUM', 'ZOO', 'THEME_PARK', 'CRAFT', 'SPORTS', 'OTHER') NOT NULL,
    min_age INT DEFAULT 0,
    max_age INT DEFAULT 18,
    price_range ENUM('FREE', 'UNDER_1000', '1000_3000', '3000_5000', 'OVER_5000') NOT NULL,
    is_indoor BOOLEAN DEFAULT FALSE,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    google_maps_url VARCHAR(1000) NULL,
    operating_hours JSON NULL COMMENT 'Giờ mở cửa theo ngày: {"monday": "9:00-17:00", ...}',
    is_open_today BOOLEAN DEFAULT TRUE,
    weather_suitable ENUM('ALL_WEATHER', 'RAIN_OK', 'SUNNY_ONLY', 'NO_RAIN') DEFAULT 'ALL_WEATHER',
    estimated_visit_duration INT DEFAULT 120 COMMENT 'Thời gian tham quan (phút)',
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    status ENUM('PUBLIC', 'PRIVATE', 'DRAFT') DEFAULT 'PUBLIC',
    created_by_admin_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude),
    INDEX idx_rating (average_rating),
    FULLTEXT KEY ft_name_description (name, description)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 5: Spot_Images (Hình ảnh địa điểm)
-- =============================================
CREATE TABLE spot_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE COMMENT 'Ảnh đại diện',
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_spot_id (spot_id),
    INDEX idx_is_main (is_main)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 6: Spot_Facilities (Cơ sở vật chất)
-- =============================================
CREATE TABLE spot_facilities (
    facility_id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    facility_name VARCHAR(100) NOT NULL COMMENT 'PARKING, NURSING_ROOM, STROLLER_ACCESSIBLE, RESTROOM, etc.',
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_spot_id (spot_id),
    UNIQUE KEY unique_spot_facility (spot_id, facility_name)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 7: Spot_Tags (Thẻ tag địa điểm)
-- =============================================
CREATE TABLE spot_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL COMMENT '雨の日OK, 無料, 室内, etc.',
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_spot_id (spot_id),
    INDEX idx_tag_name (tag_name),
    UNIQUE KEY unique_spot_tag (spot_id, tag_name)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 8: Reviews (Đánh giá)
-- =============================================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(140) NULL COMMENT 'Tối đa 140 ký tự',
    safety_report_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_spot_id (spot_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_hidden (is_hidden),
    INDEX idx_rating (rating)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 9: Review_Images (Hình ảnh đánh giá)
-- =============================================
CREATE TABLE review_images (
    review_image_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 10: Review_Facilities (Facilities check trong review)
-- =============================================
CREATE TABLE review_facilities (
    review_facility_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    facility_name VARCHAR(100) NOT NULL COMMENT 'CLEAN, SAFE, KID_FRIENDLY, etc.',
    is_checked BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    UNIQUE KEY unique_review_facility (review_id, facility_name)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 11: Favorites (Danh sách yêu thích)
-- =============================================
CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    spot_id INT NOT NULL,
    collection_tag VARCHAR(50) NULL COMMENT 'Indoor, Free, Near, etc.',
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_spot_id (spot_id),
    UNIQUE KEY unique_user_spot (user_id, spot_id)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 12: Schedules (Lịch trình cuối tuần)
-- =============================================
CREATE TABLE schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    spot_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    time_slot ENUM('AM', 'PM', 'FULL_DAY') NOT NULL,
    travel_time INT NULL COMMENT 'Thời gian di chuyển (phút)',
    reminder_enabled BOOLEAN DEFAULT FALSE,
    status ENUM('PLANNED', 'COMPLETED', 'CANCELLED') DEFAULT 'PLANNED',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 13: KidSwipe_History (Lịch sử Kids Swipe)
-- =============================================
CREATE TABLE kidswipe_history (
    swipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    child_id INT NOT NULL,
    spot_id INT NOT NULL,
    action ENUM('LIKE', 'SKIP') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_child_id (child_id),
    INDEX idx_action (action)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 14: Recommendations (Cache recommendation)
-- =============================================
CREATE TABLE recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    child_id INT NULL,
    spot_id INT NOT NULL,
    score DECIMAL(5, 2) NOT NULL COMMENT 'Điểm phù hợp 0-100',
    factors JSON NULL COMMENT 'Lý do: distance, weather, age_match, etc.',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_score (score),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 15: KPIs_Metrics (Dữ liệu KPI)
-- =============================================
CREATE TABLE kpis_metrics (
    metric_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL COMMENT 'DecisionTime, RouteActivationRate, MonthlyRepeat, etc.',
    value DECIMAL(10, 2) NOT NULL,
    time_period ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_metric_name (metric_name),
    UNIQUE KEY unique_date_metric (date, metric_name, time_period)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 16: Admin_Activity_Logs (Nhật ký hoạt động admin)
-- =============================================
CREATE TABLE admin_activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action ENUM('CREATE_SPOT', 'EDIT_SPOT', 'DELETE_SPOT', 'HIDE_REVIEW', 'DELETE_REVIEW', 'BAN_USER', 'UNBAN_USER') NOT NULL,
    target_type VARCHAR(50) NOT NULL COMMENT 'Spot, Review, User',
    target_id INT NOT NULL,
    details JSON NULL COMMENT 'Chi tiết thay đổi',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;

-- =============================================
-- TABLE 17: Weather_Conditions (Cache thông tin thời tiết - Optional)
-- =============================================
CREATE TABLE weather_conditions (
    weather_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    condition ENUM('SUNNY', 'RAINY', 'CLOUDY', 'HOT', 'COLD', 'SNOW') NOT NULL,
    temperature DECIMAL(4, 1) NULL COMMENT 'Nhiệt độ (°C)',
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date_location (date, location),
    UNIQUE KEY unique_date_location (date, location)
) ENGINE=InnoDB;

-- =============================================
-- TRIGGERS để tự động cập nhật average_rating
-- =============================================
DELIMITER //

CREATE TRIGGER update_spot_rating_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE spots 
    SET average_rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE spot_id = NEW.spot_id AND is_hidden = FALSE
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE spot_id = NEW.spot_id AND is_hidden = FALSE
    )
    WHERE spot_id = NEW.spot_id;
END//

CREATE TRIGGER update_spot_rating_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE spots 
    SET average_rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE spot_id = NEW.spot_id AND is_hidden = FALSE
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE spot_id = NEW.spot_id AND is_hidden = FALSE
    )
    WHERE spot_id = NEW.spot_id;
END//

CREATE TRIGGER update_spot_rating_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE spots 
    SET average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE spot_id = OLD.spot_id AND is_hidden = FALSE
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE spot_id = OLD.spot_id AND is_hidden = FALSE
    )
    WHERE spot_id = OLD.spot_id;
END//

DELIMITER ;

-- =============================================
-- VIEWS cho reporting
-- =============================================

-- View: Top rated spots
CREATE VIEW view_top_rated_spots AS
SELECT 
    s.spot_id,
    s.name,
    s.category,
    s.average_rating,
    s.total_reviews,
    s.is_indoor,
    s.price_range
FROM spots s
WHERE s.status = 'PUBLIC' AND s.total_reviews >= 5
ORDER BY s.average_rating DESC, s.total_reviews DESC;

-- View: Popular spots by favorites
CREATE VIEW view_popular_spots AS
SELECT 
    s.spot_id,
    s.name,
    s.category,
    COUNT(f.favorite_id) as favorite_count,
    s.average_rating
FROM spots s
LEFT JOIN favorites f ON s.spot_id = f.spot_id
WHERE s.status = 'PUBLIC'
GROUP BY s.spot_id
ORDER BY favorite_count DESC;

-- =============================================
-- Indexes để tối ưu performance
-- =============================================

-- Additional indexes for common queries
CREATE INDEX idx_spots_indoor_price ON spots(is_indoor, price_range);
CREATE INDEX idx_spots_age_range ON spots(min_age, max_age);
CREATE INDEX idx_reviews_posted_at ON reviews(posted_at);
CREATE INDEX idx_schedules_user_date ON schedules(user_id, scheduled_date);

-- =============================================
-- COMPLETE! Database migration finished
-- =============================================

SELECT '✅ Database migration completed successfully!' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables 
WHERE table_schema = 'kodomo_weekend_navi';
