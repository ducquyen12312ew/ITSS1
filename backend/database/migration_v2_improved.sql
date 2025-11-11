-- =============================================
-- Kodomo Weekend Navi - Database Migration v2
-- CẢI TIẾN: Thêm bảng review_reports & cột reported_count
-- =============================================

USE kodomo_weekend_navi;

-- =============================================
-- 1. THÊM CỘT reported_count vào reviews (nếu chưa có)
-- =============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'kodomo_weekend_navi' 
    AND TABLE_NAME = 'reviews' 
    AND COLUMN_NAME = 'reported_count'
);

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE reviews ADD COLUMN reported_count INT DEFAULT 0 COMMENT "Số lần bị báo cáo" AFTER is_hidden;',
    'SELECT "Column reported_count already exists" AS info;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 2. TẠO BẢNG review_reports (Báo cáo review vi phạm)
-- =============================================
CREATE TABLE IF NOT EXISTS review_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    reported_by_user_id INT NOT NULL,
    reason ENUM('SPAM', 'OFFENSIVE', 'INAPPROPRIATE', 'FAKE', 'OTHER') NOT NULL,
    description TEXT NULL COMMENT 'Mô tả chi tiết lý do báo cáo',
    status ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING',
    admin_note TEXT NULL COMMENT 'Ghi chú của admin khi xử lý',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_status (status),
    INDEX idx_reported_by (reported_by_user_id),
    UNIQUE KEY unique_user_review_report (review_id, reported_by_user_id)
) ENGINE=InnoDB COMMENT='Lưu các báo cáo review vi phạm từ user';

-- =============================================
-- 3. TẠO TRIGGER: Tự động tăng reported_count (nếu chưa có)
-- =============================================
DROP TRIGGER IF EXISTS increment_reported_count_after_insert;

DELIMITER $$

CREATE TRIGGER increment_reported_count_after_insert
AFTER INSERT ON review_reports
FOR EACH ROW
BEGIN
    UPDATE reviews 
    SET reported_count = reported_count + 1 
    WHERE review_id = NEW.review_id;
END$$

DELIMITER ;

-- =============================================
-- 4. TẠO VIEW: Reviews cần kiểm tra (nhiều report)
-- =============================================
CREATE OR REPLACE VIEW view_flagged_reviews AS
SELECT 
    r.review_id,
    r.spot_id,
    r.user_id,
    r.rating,
    r.comment,
    r.reported_count,
    r.is_hidden,
    s.name AS spot_name,
    u.email AS user_email,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    COUNT(rr.report_id) AS pending_reports
FROM reviews r
INNER JOIN spots s ON r.spot_id = s.spot_id
INNER JOIN users u ON r.user_id = u.user_id
LEFT JOIN review_reports rr ON r.review_id = rr.review_id AND rr.status = 'PENDING'
WHERE r.reported_count >= 1
GROUP BY r.review_id
ORDER BY r.reported_count DESC;

-- =============================================
-- 5. CẢI TIẾN: Thêm INDEX cho performance
-- =============================================

-- Index cho tìm kiếm reviews theo reported_count
ALTER TABLE reviews ADD INDEX idx_reported_count (reported_count);

-- Index cho spots được yêu thích nhiều
ALTER TABLE favorites ADD INDEX idx_collection_tag (collection_tag);

-- Composite index cho schedules (user + date)
ALTER TABLE schedules ADD INDEX idx_user_date (user_id, scheduled_date);

-- =============================================
-- HOÀN TẤT! Database đã được nâng cấp
-- =============================================

SELECT '✅ Migration v2 completed successfully!' AS status;
SELECT CONCAT('Total tables: ', COUNT(*)) AS total_tables FROM information_schema.tables WHERE table_schema = 'kodomo_weekend_navi';
