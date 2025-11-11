DROP DATABASE IF EXISTS kodomo_weekend_navi;
CREATE DATABASE kodomo_weekend_navi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kodomo_weekend_navi;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('USER','ADMIN') DEFAULT 'USER' NOT NULL,
  status ENUM('ACTIVE','BANNED') DEFAULT 'ACTIVE' NOT NULL,
  location_lat DECIMAL(10,8) NULL,
  location_lng DECIMAL(11,8) NULL,
  location_name VARCHAR(255) NULL,
  agreement BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_role (role)
) ENGINE=InnoDB;

CREATE TABLE children (
  child_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  avatar_url VARCHAR(500) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE child_preferences (
  preference_id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  preference_type ENUM('LIKE','DISLIKE') NOT NULL,
  tag_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
  INDEX idx_child_id (child_id),
  UNIQUE KEY unique_child_preference (child_id, preference_type, tag_name)
) ENGINE=InnoDB;

CREATE TABLE spots (
  spot_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category ENUM('MUSEUM','INDOOR_PLAY','OUTDOOR_PLAY','PARK','AQUARIUM','ZOO','THEME_PARK','CRAFT','SPORTS','OTHER') NOT NULL,
  min_age INT DEFAULT 0,
  max_age INT DEFAULT 18,
  price_range ENUM('FREE','UNDER_1000','1000_3000','3000_5000','OVER_5000') NOT NULL,
  is_indoor BOOLEAN DEFAULT FALSE,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  google_maps_url VARCHAR(1000) NULL,
  operating_hours JSON NULL,
  is_open_today BOOLEAN DEFAULT TRUE,
  weather_suitable ENUM('ALL_WEATHER','RAIN_OK','SUNNY_ONLY','NO_RAIN') DEFAULT 'ALL_WEATHER',
  estimated_visit_duration INT DEFAULT 120,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  status ENUM('PUBLIC','PRIVATE','DRAFT') DEFAULT 'PUBLIC',
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

CREATE TABLE spot_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  spot_id INT NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  INDEX idx_spot_id (spot_id),
  INDEX idx_is_main (is_main)
) ENGINE=InnoDB;

CREATE TABLE spot_facilities (
  facility_id INT AUTO_INCREMENT PRIMARY KEY,
  spot_id INT NOT NULL,
  facility_name VARCHAR(100) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT NULL,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  INDEX idx_spot_id (spot_id),
  UNIQUE KEY unique_spot_facility (spot_id, facility_name)
) ENGINE=InnoDB;

CREATE TABLE spot_tags (
  tag_id INT AUTO_INCREMENT PRIMARY KEY,
  spot_id INT NOT NULL,
  tag_name VARCHAR(50) NOT NULL,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  INDEX idx_spot_id (spot_id),
  INDEX idx_tag_name (tag_name),
  UNIQUE KEY unique_spot_tag (spot_id, tag_name)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  spot_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment VARCHAR(140) NULL,
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

CREATE TABLE review_images (
  review_image_id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  INDEX idx_review_id (review_id)
) ENGINE=InnoDB;

CREATE TABLE review_facilities (
  review_facility_id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  facility_name VARCHAR(100) NOT NULL,
  is_checked BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  INDEX idx_review_id (review_id),
  UNIQUE KEY unique_review_facility (review_id, facility_name)
) ENGINE=InnoDB;

CREATE TABLE favorites (
  favorite_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  spot_id INT NOT NULL,
  collection_tag VARCHAR(50) NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_spot_id (spot_id),
  UNIQUE KEY unique_user_spot (user_id, spot_id)
) ENGINE=InnoDB;

CREATE TABLE schedules (
  schedule_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  spot_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  time_slot ENUM('AM','PM','FULL_DAY') NOT NULL,
  travel_time INT NULL,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  status ENUM('PLANNED','COMPLETED','CANCELLED') DEFAULT 'PLANNED',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE kidswipe_history (
  swipe_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  child_id INT NOT NULL,
  spot_id INT NOT NULL,
  action ENUM('LIKE','SKIP') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_child_id (child_id),
  INDEX idx_action (action)
) ENGINE=InnoDB;

CREATE TABLE recommendations (
  recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  child_id INT NULL,
  spot_id INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  factors JSON NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_score (score),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

CREATE TABLE kpis_metrics (
  metric_id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  time_period ENUM('DAILY','WEEKLY','MONTHLY') NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_metric_name (metric_name),
  UNIQUE KEY unique_date_metric (date, metric_name, time_period)
) ENGINE=InnoDB;

CREATE TABLE admin_activity_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action ENUM('CREATE_SPOT','EDIT_SPOT','DELETE_SPOT','HIDE_REVIEW','DELETE_REVIEW','BAN_USER','UNBAN_USER') NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT NOT NULL,
  details JSON NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;

CREATE TABLE weather_conditions (
  weather_id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  weather_condition ENUM('SUNNY','RAINY','CLOUDY','HOT','COLD','SNOW') NOT NULL,
  temperature DECIMAL(4,1) NULL,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date_location (date, location),
  UNIQUE KEY unique_date_location (date, location)
) ENGINE=InnoDB;

DROP TRIGGER IF EXISTS update_spot_rating_after_insert;
DROP TRIGGER IF EXISTS update_spot_rating_after_update;
DROP TRIGGER IF EXISTS update_spot_rating_after_delete;

CREATE TRIGGER update_spot_rating_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
UPDATE spots
SET average_rating = (SELECT AVG(rating) FROM reviews WHERE spot_id = NEW.spot_id AND is_hidden = FALSE),
    total_reviews  = (SELECT COUNT(*)   FROM reviews WHERE spot_id = NEW.spot_id AND is_hidden = FALSE)
WHERE spot_id = NEW.spot_id;

CREATE TRIGGER update_spot_rating_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
UPDATE spots
SET average_rating = (SELECT AVG(rating) FROM reviews WHERE spot_id = NEW.spot_id AND is_hidden = FALSE),
    total_reviews  = (SELECT COUNT(*)   FROM reviews WHERE spot_id = NEW.spot_id AND is_hidden = FALSE)
WHERE spot_id = NEW.spot_id;

CREATE TRIGGER update_spot_rating_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
UPDATE spots
SET average_rating = (SELECT COALESCE(AVG(rating),0) FROM reviews WHERE spot_id = OLD.spot_id AND is_hidden = FALSE),
    total_reviews  = (SELECT COUNT(*)           FROM reviews WHERE spot_id = OLD.spot_id AND is_hidden = FALSE)
WHERE spot_id = OLD.spot_id;

CREATE VIEW view_top_rated_spots AS
SELECT s.spot_id, s.name, s.category, s.average_rating, s.total_reviews, s.is_indoor, s.price_range
FROM spots s
WHERE s.status='PUBLIC' AND s.total_reviews>=5
ORDER BY s.average_rating DESC, s.total_reviews DESC;

CREATE VIEW view_popular_spots AS
SELECT s.spot_id, s.name, s.category, COUNT(f.favorite_id) AS favorite_count, s.average_rating
FROM spots s
LEFT JOIN favorites f ON s.spot_id=f.spot_id
WHERE s.status='PUBLIC'
GROUP BY s.spot_id
ORDER BY favorite_count DESC;

CREATE INDEX idx_spots_indoor_price ON spots(is_indoor, price_range);
CREATE INDEX idx_spots_age_range ON spots(min_age, max_age);
CREATE INDEX idx_reviews_posted_at ON reviews(posted_at);
CREATE INDEX idx_schedules_user_date ON schedules(user_id, scheduled_date);
