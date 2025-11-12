-- Kodomo Weekend Navi Database Schema
DROP DATABASE IF EXISTS kodomo_weekend_navi;
CREATE DATABASE kodomo_weekend_navi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kodomo_weekend_navi;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE',
    agreement BOOLEAN DEFAULT FALSE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name VARCHAR(255),
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

CREATE TABLE children (
    child_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    avatar_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

CREATE TABLE child_preferences (
    preference_id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    preference_type ENUM('LIKE', 'DISLIKE') NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
    UNIQUE KEY unique_child_tag (child_id, tag_name),
    INDEX idx_child_id (child_id)
);

CREATE TABLE spots (
    spot_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('PARK', 'MUSEUM', 'ZOO', 'AQUARIUM', 'THEME_PARK', 'INDOOR_PLAY', 'OTHER') DEFAULT 'OTHER',
    min_age INT DEFAULT 0,
    max_age INT DEFAULT 18,
    price_range ENUM('FREE', 'UNDER_1000', '1000_3000', '3000_5000', 'OVER_5000') DEFAULT 'FREE',
    is_indoor BOOLEAN DEFAULT FALSE,
    address VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    google_maps_url VARCHAR(255),
    operating_hours JSON,
    is_open_today BOOLEAN DEFAULT TRUE,
    weather_suitable ENUM('ALL_WEATHER', 'SUNNY_ONLY', 'RAIN_OK') DEFAULT 'ALL_WEATHER',
    estimated_visit_duration INT,
    facilities JSON,
    status ENUM('PUBLIC', 'PRIVATE', 'DRAFT') DEFAULT 'PUBLIC',
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    created_by_admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_location (latitude, longitude)
);

CREATE TABLE spot_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    spot_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_spot_id (spot_id)
);

CREATE TABLE spot_tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    spot_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    UNIQUE KEY unique_spot_tag (spot_id, tag_name),
    INDEX idx_spot_id (spot_id)
);

CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    spot_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url VARCHAR(255),
    facilities_check JSON,
    report_count INT DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_spot_id (spot_id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    spot_id INT NOT NULL,
    collection_tag VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_spot (user_id, spot_id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE schedules (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    spot_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    time_slot ENUM('AM', 'PM', 'FULL_DAY') DEFAULT 'FULL_DAY',
    status ENUM('PLANNED', 'COMPLETED', 'CANCELLED') DEFAULT 'PLANNED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (scheduled_date)
);

CREATE TABLE kid_swipe (
    swipe_id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    spot_id INT NOT NULL,
    action ENUM('LIKE', 'SKIP') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
    UNIQUE KEY unique_child_spot (child_id, spot_id),
    INDEX idx_child_id (child_id),
    INDEX idx_spot_id (spot_id)
);

CREATE TABLE weather_cache (
    weather_id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    weather_condition ENUM('SUNNY', 'CLOUDY', 'RAINY', 'SNOWY') NOT NULL,
    temperature DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_location (date, location)
);

CREATE TABLE admin_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_admin_id (admin_id)
);

SELECT 'Database created successfully' AS status;
