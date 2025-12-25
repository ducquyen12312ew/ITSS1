-- Kodomo Weekend Navi - Seed Data (Hanoi Locations)
-- Complete database seed with realistic Hanoi spots

USE kodomo_weekend_navi;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE admin_logs;
TRUNCATE TABLE kid_swipe;
TRUNCATE TABLE child_preferences;
TRUNCATE TABLE schedules;
TRUNCATE TABLE favorites;
TRUNCATE TABLE reviews;
TRUNCATE TABLE spot_tags;
TRUNCATE TABLE spot_images;
TRUNCATE TABLE spots;
TRUNCATE TABLE children;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- USERS
-- =====================================================
-- Password for all users: password123 (hashed with bcrypt)
-- Admin password: B@o140804 (will need to be hashed properly)

INSERT INTO users (email, password_hash, name, role, status, agreement) VALUES
-- Admin user (temporary hash - please update via app registration)
('buibaomoyu@gmail.com', '$2a$10$rXK5WZxQfJYmeW8X6JZRr.vGQ6P4YH3fN4uMxP7F5vZ3qP9pX7Y8u', 'Bùi Bảo', 'ADMIN', 'ACTIVE', TRUE),

-- Regular users
('tanaka.yuki@example.com', '$2a$10$rXK5WZxQfJYmeW8X6JZRr.vGQ6P4YH3fN4uMxP7F5vZ3qP9pX7Y8u', '田中 由紀', 'USER', 'ACTIVE', TRUE),
('nguyenvan@example.com', '$2a$10$rXK5WZxQfJYmeW8X6JZRr.vGQ6P4YH3fN4uMxP7F5vZ3qP9pX7Y8u', 'Nguyễn Văn', 'USER', 'ACTIVE', TRUE),
('tranthihue@example.com', '$2a$10$rXK5WZxQfJYmeW8X6JZRr.vGQ6P4YH3fN4uMxP7F5vZ3qP9pX7Y8u', 'Trần Thị Huệ', 'USER', 'ACTIVE', TRUE),
('satoyuki@example.com', '$2a$10$rXK5WZxQfJYmeW8X6JZRr.vGQ6P4YH3fN4uMxP7F5vZ3qP9pX7Y8u', '佐藤 由紀', 'USER', 'ACTIVE', TRUE);

-- =====================================================
-- CHILDREN
-- =====================================================

INSERT INTO children (user_id, name, birth_date, notes) VALUES
-- Admin children
(1, 'Minh', '2018-05-15', '活発で動物が大好き。公園で遊ぶのが好きです。'),
(1, 'An', '2020-08-20', 'おとなしくて絵本が好き。図書館が大好きです。'),

-- User 2 children  
(2, '太郎', '2019-03-10', 'スポーツが好き。アクティブな遊びを求めています。'),
(2, '花子', '2021-11-05', '音楽が好き。静かな場所を好みます。'),

-- User 3 children
(3, 'Hương', '2017-12-25', '好奇心旺盛。新しいことを学ぶのが大好き。'),

-- User 4 children
(4, 'Mai', '2019-09-22', 'アートが好き。創造的な活動を楽しみます。'),

-- User 5 children
(5, 'Hải', '2016-07-14', 'サイエンスが好き。博物館巡りが趣味。');

-- =====================================================
-- SPOTS (Hanoi Locations with Real Data)
-- =====================================================

INSERT INTO spots (name, description, address, latitude, longitude, operating_hours, facilities, status, average_rating, review_count, created_by_admin_id) VALUES

-- 1. Thảo Cầm Viên Hà Nội (Hanoi Zoo) - Ages: 0-12
('Thảo Cầm Viên Hà Nội', 'ベトナム最古の動物園。1000頭以上、100種類以上の動物がいます。ライオン、ゾウ、キリン、サルなど様々な動物を観察できます。子供向けの遊び場もあり、週末には多くの家族連れで賑わいます。広大な敷地内には緑も多く、ピクニックにも最適です。', 'Đường Láng, Ngọc Khánh, Ba Đình, Hà Nội', 21.0329, 105.8089, '{"monday": "7:00-17:00", "tuesday": "7:00-17:00", "wednesday": "7:00-17:00", "thursday": "7:00-17:00", "friday": "7:00-17:00", "saturday": "7:00-17:00", "sunday": "7:00-17:00"}', '{"parking": true, "nursing_room": false, "medical_station": true, "restaurant": true, "smoking_area": true}', 'PUBLIC', 4.5, 120, 1),

-- 2. Bảo tàng Dân tộc học Việt Nam - Ages: 6-18
('ベトナム民族学博物館', '3.27ヘクタールの広大な野外博物館で、ベトナムの54民族の文化を紹介。伝統的な家屋の展示、文化体験プログラム、伝統工芸のワークショップに参加できます。子供たちは実際に民族衣装を着たり、伝統楽器を演奏したりする体験ができます。', 'Đường Nguyễn Văn Huyên, Nghĩa Đô, Cầu Giấy, Hà Nội', 21.0378, 105.7938, '{"monday": "休館", "tuesday": "8:30-17:30", "wednesday": "8:30-17:30", "thursday": "8:30-17:30", "friday": "8:30-17:30", "saturday": "8:30-17:30", "sunday": "8:30-17:30"}', '{"parking": true, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": false}', 'PUBLIC', 4.2, 85, 1),

-- 3. Công viên Thủ Lệ - Ages: 0-12
('トゥーレー公園', '大きな湖のある広い公園。ペダルボート遊び、遊歩道、子供の遊び場があります。週末には多くの家族連れが訪れ、ピクニックやスポーツを楽しんでいます。湖の周りを散歩したり、ボートに乗ったり、芝生でのんびり過ごすことができます。入園無料なので気軽に訪れることができます。', 'Đường Thụy Khuê, Thuỵ Khuê, Tây Hồ, Hà Nội', 21.0497, 105.8178, '{"monday": "5:00-22:00", "tuesday": "5:00-22:00", "wednesday": "5:00-22:00", "thursday": "5:00-22:00", "friday": "5:00-22:00", "saturday": "5:00-22:00", "sunday": "5:00-22:00"}', '{"parking": true, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": true}', 'PUBLIC', 4.6, 200, 1),

-- 4. KidZone Vincom Center - Ages: 1-8
('キッズゾーン ビンコムセンター', '最新の屋内遊び場。ボールプール、大型滑り台、トランポリン、創造エリアなど充実の設備。幼児から小学生まで安全に楽しめます。エアコン完備で雨の日でも快適。スタッフが常駐しており、安全管理も徹底されています。', 'Vincom Center Bà Triệu, 191 Bà Triệu, Hai Bà Trưng, Hà Nội', 21.0144, 105.8459, '{"monday": "10:00-22:00", "tuesday": "10:00-22:00", "wednesday": "10:00-22:00", "thursday": "10:00-22:00", "friday": "10:00-22:00", "saturday": "9:00-22:00", "sunday": "9:00-22:00"}', '{"parking": true, "nursing_room": true, "medical_station": false, "restaurant": true, "smoking_area": false}', 'PUBLIC', 4.7, 150, 1),

-- 5. Hồ Hoàn Kiếm - Ages: 0-18
('ホアンキエム湖', 'ハノイの中心にある美しい湖。湖の周りを散歩したり、玉山祠を訪れたり、週末の歩行者天国で子供と安全に遊べます。朝は太極拳をする人々、夕方は散歩する家族連れで賑わいます。湖畔にはカフェやアイスクリーム屋さんもあり、休憩にも最適です。', 'Hoàn Kiếm, Hà Nội', 21.0285, 105.8542, '{"monday": "24時間", "tuesday": "24時間", "wednesday": "24時間", "thursday": "24時間", "friday": "24時間", "saturday": "24時間", "sunday": "24時間"}', '{"parking": false, "nursing_room": false, "medical_station": false, "restaurant": true, "smoking_area": true}', 'PUBLIC', 4.8, 500, 1),

-- 6. Bảo tàng Hồ Chí Minh - Ages: 6-18
('ホーチミン博物館', 'ホーチミン主席の生涯と業績を紹介する博物館。ユニークな建築デザイン、広い庭園があります。ベトナムの歴史を学ぶのに最適で、学校の社会科見学でもよく訪れられます。入場無料なのも魅力的です。', 'Số 19 Ngọc Hà, Ba Đình, Hà Nội', 21.0368, 105.8346, '{"monday": "休館", "tuesday": "8:00-12:00, 14:00-17:00", "wednesday": "8:00-12:00, 14:00-17:00", "thursday": "8:00-12:00, 14:00-17:00", "friday": "8:00-12:00, 14:00-17:00", "saturday": "8:00-12:00, 14:00-17:00", "sunday": "8:00-12:00, 14:00-17:00"}', '{"parking": true, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": false}', 'PUBLIC', 4.0, 60, 1),

-- 7. Times City Water Park - Ages: 3-18
('タイムズシティウォーターパーク', 'ハノイ最大の屋内ウォーターパーク。多数のウォータースライダー、造波プール、子供用浅いプール、流れるプールなど充実の設備。年中楽しめる温水プールで、冬でも快適に遊べます。家族全員で一日中楽しめる人気スポットです。', 'Times City, 458 Minh Khai, Hai Bà Trưng, Hà Nội', 20.9952, 105.8689, '{"monday": "10:00-21:00", "tuesday": "10:00-21:00", "wednesday": "10:00-21:00", "thursday": "10:00-21:00", "friday": "10:00-21:00", "saturday": "9:00-22:00", "sunday": "9:00-22:00"}', '{"parking": true, "nursing_room": true, "medical_station": true, "restaurant": true, "smoking_area": false}', 'PUBLIC', 4.6, 180, 1),

-- 8. Công viên Nghĩa Đô - Ages: 1-12
('ギアドー公園', '滑り台、ブランコ、シーソーなどの遊具がある現代的なコミュニティパーク。スポーツコート、ランニングトラック、フィットネス器具も完備。住宅地にあるため、地元の子供たちで賑わっています。無料で利用できる公園です。', 'Hoàng Quốc Việt, Nghĩa Đô, Cầu Giấy, Hà Nội', 21.0334, 105.7952, '{"monday": "5:00-22:00", "tuesday": "5:00-22:00", "wednesday": "5:00-22:00", "thursday": "5:00-22:00", "friday": "5:00-22:00", "saturday": "5:00-22:00", "sunday": "5:00-22:00"}', '{"parking": true, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": false}', 'PUBLIC', 4.4, 95, 1),

-- 9. Thư viện Khoa học Tổng hợp - Ages: 3-15
('ハノイ総合科学図書館', '子供向けエリアがある公共図書館。絵本、児童書、学習スペースがあります。定期的な読み聞かせ会やワークショップも開催。静かで落ち着いた環境で、読書好きな子供に最適です。無料で利用できます。', '31 Tràng Thi, Hoàn Kiếm, Hà Nội', 21.0242, 105.8523, '{"monday": "8:00-21:00", "tuesday": "8:00-21:00", "wednesday": "8:00-21:00", "thursday": "8:00-21:00", "friday": "8:00-21:00", "saturday": "8:00-17:00", "sunday": "8:00-17:00"}', '{"parking": false, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": false}', 'PUBLIC', 4.3, 70, 1),

-- 10. Ecopark Adventure Park - Ages: 5-18
('エコパークアドベンチャーパーク', 'アウトドアアドベンチャーパーク。クライミング、吊り橋、ジップライン、ロープコースなど。子供向けから大人向けまで様々なレベルのコースがあります。安全装備完備で、インストラクターが指導します。自然の中で冒険を楽しめます。', 'Khu đô thị Ecopark, Văn Giang, Hưng Yên', 20.9461, 105.9458, '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-18:00", "saturday": "8:00-19:00", "sunday": "8:00-19:00"}', '{"parking": true, "nursing_room": false, "medical_station": true, "restaurant": true, "smoking_area": true}', 'PUBLIC', 4.5, 110, 1),

-- 11. Bảo tàng Lịch sử Quốc gia - Ages: 8-18
('国立歴史博物館', 'ベトナムの先史時代から現代までの歴史を展示。貴重な遺物や歴史的文書を見ることができます。学生向けの教育プログラムも充実。歴史好きな子供や、社会科の勉強に最適です。', '1 Tràng Tiền, Hoàn Kiếm, Hà Nội', 21.0237, 105.8580, '{"monday": "8:00-12:00, 13:30-17:00", "tuesday": "8:00-12:00, 13:30-17:00", "wednesday": "8:00-12:00, 13:30-17:00", "thursday": "8:00-12:00, 13:30-17:00", "friday": "8:00-12:00, 13:30-17:00", "saturday": "8:00-12:00, 13:30-17:00", "sunday": "8:00-12:00, 13:30-17:00"}', '{"parking": false, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": false}', 'PUBLIC', 4.1, 55, 1),

-- 12. Lotte Mart Kids Playground - Ages: 2-8
('ロッテマートキッズプレイグラウンド', 'ロッテマート内の無料遊び場。幼児に安全な遊具、ソフトプレイエリア。保護者が買い物中に子供が遊べる便利なスポット。清潔で安全管理もしっかりしています。', 'Lotte Mart, 54 Liễu Giai, Ba Đình, Hà Nội', 21.0314, 105.8138, '{"monday": "9:00-22:00", "tuesday": "9:00-22:00", "wednesday": "9:00-22:00", "thursday": "9:00-22:00", "friday": "9:00-22:00", "saturday": "9:00-22:00", "sunday": "9:00-22:00"}', '{"parking": true, "nursing_room": true, "medical_station": false, "restaurant": true, "smoking_area": false}', 'PUBLIC', 4.4, 130, 1),

-- 13. Công viên Thiên văn học - Ages: 6-18
('ハノイ天文公園', '宇宙と天文学をテーマにした教育的な公園。惑星のモデル、望遠鏡、天文学の展示があります。夜間には星空観察イベントも開催。科学好きな子供に人気のスポットです。', 'Hoàng Quốc Việt, Nghĩa Tân, Cầu Giấy, Hà Nội', 21.0342, 105.7888, '{"monday": "8:00-17:00", "tuesday": "8:00-17:00", "wednesday": "8:00-17:00", "thursday": "8:00-17:00", "friday": "8:00-17:00", "saturday": "8:00-20:00", "sunday": "8:00-20:00"}', '{"parking": true, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": false}', 'PUBLIC', 4.2, 45, 1),

-- 14. VinKE Royal City - Ages: 2-15
('ビンケ ロイヤルシティ', '50以上のゲーム機、ソフトプレイエリア、バンパーカー、エア遊具がある大型屋内エンターテイメント施設。終日チケットで遊び放題。雨の日や暑い日に最適な屋内施設です。', 'Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội', 21.0007, 105.8081, '{"monday": "9:30-22:00", "tuesday": "9:30-22:00", "wednesday": "9:30-22:00", "thursday": "9:30-22:00", "friday": "9:30-22:00", "saturday": "9:00-22:30", "sunday": "9:00-22:30"}', '{"parking": true, "nursing_room": true, "medical_station": false, "restaurant": true, "smoking_area": false}', 'PUBLIC', 4.8, 220, 1),

-- 15. Công viên Indira Gandhi - Ages: 0-12
('インディラガンディー公園', '多くの緑、鯉の池、子供の遊び場がある静かな公園。家族でのピクニック、散歩、軽い運動に最適。都会の喧騒から離れてリラックスできる癒しのスポットです。', 'Láng Hạ, Đống Đa, Hà Nội', 21.0194, 105.8124, '{"monday": "5:00-22:00", "tuesday": "5:00-22:00", "wednesday": "5:00-22:00", "thursday": "5:00-22:00", "friday": "5:00-22:00", "saturday": "5:00-22:00", "sunday": "5:00-22:00"}', '{"parking": true, "nursing_room": false, "medical_station": false, "restaurant": false, "smoking_area": false}', 'PUBLIC', 4.5, 88, 1);

-- =====================================================
-- SPOT IMAGES
-- =====================================================

INSERT INTO spot_images (spot_id, image_url, is_main, display_order) VALUES
-- Zoo images
(1, 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1581888227599-779811939961?w=800', FALSE, 2),

-- Museum Ethnology
(2, 'https://images.unsplash.com/photo-1569704449284-135a0c0e0d8f?w=800', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1608452964553-9b4d97b2752f?w=800', FALSE, 2),

-- Thu Le Park
(3, 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1519832979-6fa011b87667?w=800', FALSE, 2),

-- KidZone
(4, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800', FALSE, 2),

-- Hoan Kiem Lake
(5, 'https://images.unsplash.com/photo-1555881788-a4e75baa1205?w=800', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', FALSE, 2),

-- Ho Chi Minh Museum
(6, 'https://images.unsplash.com/photo-1566127444977-eb86e0a1318f?w=800', TRUE, 1),

-- Water Park
(7, 'https://images.unsplash.com/photo-1587139223877-04cb899fa3e8?w=800', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', FALSE, 2),

-- Nghia Do Park
(8, 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=800', TRUE, 1),

-- Library
(9, 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800', TRUE, 1),

-- Adventure Park
(10, 'https://images.unsplash.com/photo-1535923163756-a31799c41fd9?w=800', TRUE, 1),

-- History Museum
(11, 'https://images.unsplash.com/photo-1566127444977-eb86e0a1318f?w=800', TRUE, 1),

-- Lotte Mart
(12, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800', TRUE, 1),

-- Astronomy Park
(13, 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800', TRUE, 1),

-- VinKE
(14, 'https://images.unsplash.com/photo-1597524936625-72cd840bc8f4?w=800', TRUE, 1),

-- Indira Gandhi Park
(15, 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800', TRUE, 1);

-- =====================================================
-- SPOT TAGS
-- =====================================================
-- Tag categories:
-- 1. Category tags: 動物園, 博物館, 公園, 図書館, 遊び場, プール, 科学
-- 2. Price tags: 無料, 1000円以下, 1000-3000円, 3000-5000円, 5000円以上
-- 3. Age range tags: 0-2歳, 3-5歳, 6-8歳, 9-12歳, 13-18歳
-- 4. Indoor/Outdoor: 室内, 屋外, 雨OK
-- 5. Facilities: 駐車場, 授乳室, 医療施設, レストラン, 喫煙所

INSERT INTO spot_tags (spot_id, tag_name) VALUES
-- Zoo (1) - Ages: 0-12, Price: 1000-3000, Outdoor
(1, '動物園'), (1, '0-2歳'), (1, '3-5歳'), (1, '6-8歳'), (1, '9-12歳'), 
(1, '1000-3000円'), (1, '屋外'),
(1, '駐車場'), (1, '医療施設'), (1, 'レストラン'), (1, '喫煙所'),

-- Museum Ethnology (2) - Ages: 6-18, Price: 1000-3000, Outdoor (but has indoor sections)
(2, '博物館'), (2, '6-8歳'), (2, '9-12歳'), (2, '13-18歳'),
(2, '1000-3000円'), (2, '屋外'),
(2, '駐車場'),

-- Thu Le Park (3) - Ages: 0-12, Price: FREE, Outdoor
(3, '公園'), (3, '0-2歳'), (3, '3-5歳'), (3, '6-8歳'), (3, '9-12歳'),
(3, '無料'), (3, '屋外'),
(3, '駐車場'), (3, '喫煙所'),

-- KidZone (4) - Ages: 1-8, Price: 3000-5000, Indoor
(4, '遊び場'), (4, '0-2歳'), (4, '3-5歳'), (4, '6-8歳'),
(4, '3000-5000円'), (4, '室内'), (4, '雨OK'),
(4, '駐車場'), (4, '授乳室'), (4, 'レストラン'),

-- Hoan Kiem Lake (5) - Ages: 0-18, Price: FREE, Outdoor
(5, '公園'), (5, '0-2歳'), (5, '3-5歳'), (5, '6-8歳'), (5, '9-12歳'), (5, '13-18歳'),
(5, '無料'), (5, '屋外'),
(5, 'レストラン'), (5, '喫煙所'),

-- Ho Chi Minh Museum (6) - Ages: 6-18, Price: FREE, Indoor
(6, '博物館'), (6, '6-8歳'), (6, '9-12歳'), (6, '13-18歳'),
(6, '無料'), (6, '室内'), (6, '雨OK'),
(6, '駐車場'),

-- Water Park (7) - Ages: 3-18, Price: 5000+, Indoor
(7, 'プール'), (7, '3-5歳'), (7, '6-8歳'), (7, '9-12歳'), (7, '13-18歳'),
(7, '5000円以上'), (7, '室内'), (7, '雨OK'),
(7, '駐車場'), (7, '授乳室'), (7, '医療施設'), (7, 'レストラン'),

-- Nghia Do Park (8) - Ages: 1-12, Price: FREE, Outdoor
(8, '公園'), (8, '0-2歳'), (8, '3-5歳'), (8, '6-8歳'), (8, '9-12歳'),
(8, '無料'), (8, '屋外'),
(8, '駐車場'),

-- Library (9) - Ages: 3-15, Price: FREE, Indoor
(9, '図書館'), (9, '3-5歳'), (9, '6-8歳'), (9, '9-12歳'), (9, '13-18歳'),
(9, '無料'), (9, '室内'), (9, '雨OK'),

-- Adventure Park (10) - Ages: 5-18, Price: 1000-3000, Outdoor
(10, '遊び場'), (10, '3-5歳'), (10, '6-8歳'), (10, '9-12歳'), (10, '13-18歳'),
(10, '1000-3000円'), (10, '屋外'),
(10, '駐車場'), (10, '医療施設'), (10, 'レストラン'), (10, '喫煙所'),

-- History Museum (11) - Ages: 8-18, Price: 1000-3000, Indoor
(11, '博物館'), (11, '6-8歳'), (11, '9-12歳'), (11, '13-18歳'),
(11, '1000-3000円'), (11, '室内'), (11, '雨OK'),

-- Lotte Mart (12) - Ages: 2-8, Price: FREE, Indoor
(12, '遊び場'), (12, '0-2歳'), (12, '3-5歳'), (12, '6-8歳'),
(12, '無料'), (12, '室内'), (12, '雨OK'),
(12, '駐車場'), (12, '授乳室'), (12, 'レストラン'),

-- Astronomy Park (13) - Ages: 6-18, Price: <1000, Outdoor
(13, '科学'), (13, '6-8歳'), (13, '9-12歳'), (13, '13-18歳'),
(13, '1000円以下'), (13, '屋外'),
(13, '駐車場'),

-- VinKE (14) - Ages: 2-15, Price: 3000-5000, Indoor
(14, '遊び場'), (14, '0-2歳'), (14, '3-5歳'), (14, '6-8歳'), (14, '9-12歳'), (14, '13-18歳'),
(14, '3000-5000円'), (14, '室内'), (14, '雨OK'),
(14, '駐車場'), (14, '授乳室'), (14, 'レストラン'),

-- Indira Gandhi Park (15) - Ages: 0-12, Price: FREE, Outdoor
(15, '公園'), (15, '0-2歳'), (15, '3-5歳'), (15, '6-8歳'), (15, '9-12歳'),
(15, '無料'), (15, '屋外'),
(15, '駐車場');

-- =====================================================
-- REVIEWS
-- =====================================================

INSERT INTO reviews (spot_id, user_id, rating, comment, created_at) VALUES
-- Zoo reviews
(1, 2, 5, '子供たちが動物を見て大喜びでした！広くて1日楽しめます。ライオンとゾウが特に人気でした。', '2025-11-20 10:30:00'),
(1, 3, 4, '動物の種類が豊富で良かったです。少し古い施設もありますが、子供は楽しんでいました。', '2025-11-18 14:20:00'),
(1, 4, 5, 'ベトナム最古の動物園だけあって、歴史を感じます。写真もたくさん撮れました。', '2025-11-15 09:15:00'),

-- Museum reviews
(2, 2, 4, '文化体験ができて良かったです。子供にとって新しい発見がたくさんありました。', '2025-11-19 11:00:00'),
(2, 5, 5, '伝統工芸のワークショップが楽しかったです。スタッフも親切で丁寧に教えてくれました。', '2025-11-17 15:30:00'),

-- Thu Le Park reviews
(3, 3, 5, '無料で楽しめる素晴らしい公園。ボート遊びが子供に大人気でした。', '2025-11-22 08:45:00'),
(3, 4, 4, '散歩に最適な場所。週末は少し混雑していますが、十分に楽しめます。', '2025-11-21 16:00:00'),

-- KidZone reviews
(4, 2, 5, '雨の日でも安心して遊べます。清潔で安全な施設です。スタッフの対応も素晴らしい。', '2025-11-20 13:20:00'),
(4, 5, 4, '子供が3時間遊び続けました。料金は少し高めですが、その価値はあります。', '2025-11-16 10:50:00'),

-- Hoan Kiem Lake reviews
(5, 3, 5, 'ハノイの象徴的な場所。週末の歩行者天国は家族連れに最高です。', '2025-11-23 07:30:00'),
(5, 4, 4, '美しい湖と歴史的な寺院。子供と散歩するのに良い場所です。', '2025-11-22 17:45:00'),

-- Water Park reviews
(7, 2, 5, '屋内なので天候に関係なく楽しめます。スライダーが最高！子供が大喜びでした。', '2025-11-19 12:00:00'),
(7, 3, 5, '子供たちが一日中楽しんでいました。施設も清潔で管理が行き届いています。', '2025-11-18 14:30:00'),
(7, 5, 4, 'プールの種類が豊富で飽きません。少し高いですが、十分な価値があります。', '2025-11-17 11:15:00'),

-- VinKE reviews
(14, 2, 5, 'ゲームとアトラクションが豊富！子供が大満足でした。終日チケットがお得です。', '2025-11-21 15:00:00'),
(14, 4, 5, '雨の日に最適。たくさんのゲームで遊べます。おすすめです！', '2025-11-20 10:00:00');

-- =====================================================
-- FAVORITES
-- =====================================================

INSERT INTO favorites (user_id, spot_id, collection_tag) VALUES
-- Admin favorites
(1, 1, 'Family Favorite'),
(1, 4, 'Rainy Day'),
(1, 7, 'Summer Fun'),
(1, 12, 'Free Activities'),

-- User 2 favorites
(2, 3, 'Parks'),
(2, 5, 'Cultural'),
(2, 8, 'Nearby'),

-- User 3 favorites
(3, 2, 'Educational'),
(3, 6, 'Free'),
(3, 9, 'Library'),

-- User 4 favorites
(4, 10, 'Adventure'),
(4, 13, 'Science'),
(4, 14, 'Indoor Fun');

-- =====================================================
-- KID SWIPES
-- =====================================================

INSERT INTO kid_swipe (child_id, spot_id, action, created_at) VALUES
-- Child 1 (Minh - loves animals)
(1, 1, 'LIKE', '2025-11-20 10:00:00'),
(1, 10, 'LIKE', '2025-11-20 10:05:00'),
(1, 3, 'LIKE', '2025-11-20 10:10:00'),
(1, 6, 'SKIP', '2025-11-20 10:15:00'),
(1, 8, 'LIKE', '2025-11-20 10:20:00'),

-- Child 2 (An - loves books)
(2, 9, 'LIKE', '2025-11-21 14:00:00'),
(2, 2, 'LIKE', '2025-11-21 14:05:00'),
(2, 12, 'LIKE', '2025-11-21 14:10:00'),
(2, 7, 'SKIP', '2025-11-21 14:15:00'),
(2, 6, 'LIKE', '2025-11-21 14:20:00'),

-- Child 3 (太郎 - loves sports)
(3, 10, 'LIKE', '2025-11-22 09:00:00'),
(3, 8, 'LIKE', '2025-11-22 09:05:00'),
(3, 14, 'LIKE', '2025-11-22 09:10:00'),
(3, 3, 'LIKE', '2025-11-22 09:15:00'),

-- Child 5 (Hương - curious)
(5, 2, 'LIKE', '2025-11-23 11:00:00'),
(5, 11, 'LIKE', '2025-11-23 11:05:00'),
(5, 13, 'LIKE', '2025-11-23 11:10:00'),
(5, 6, 'LIKE', '2025-11-23 11:15:00');

-- =====================================================
-- CHILD PREFERENCES (auto-generated from swipes)
-- =====================================================

INSERT INTO child_preferences (child_id, preference_type, tag_name) VALUES
-- Child 1 preferences (from zoo, adventure, parks)
(1, 'LIKE', '動物園'),
(1, 'LIKE', '屋外'),
(1, 'LIKE', '自然'),
(1, 'LIKE', '冒険'),
(1, 'LIKE', '公園'),

-- Child 2 preferences (from library, museum, free places)
(2, 'LIKE', '図書館'),
(2, 'LIKE', '室内'),
(2, 'LIKE', '静か'),
(2, 'LIKE', '文化'),
(2, 'LIKE', '無料'),
(2, 'LIKE', '博物館'),

-- Child 3 preferences (from sports, adventure, games)
(3, 'LIKE', 'スポーツ'),
(3, 'LIKE', '屋外'),
(3, 'LIKE', '冒険'),
(3, 'LIKE', 'ゲーム'),
(3, 'LIKE', '公園'),

-- Child 5 preferences (from museums, science)
(5, 'LIKE', '博物館'),
(5, 'LIKE', '教育的'),
(5, 'LIKE', '科学'),
(5, 'LIKE', '体験型'),
(5, 'LIKE', '歴史');

-- =====================================================
-- SCHEDULES
-- =====================================================

INSERT INTO schedules (user_id, spot_id, scheduled_date, time, status, notes, created_at) VALUES
-- Admin schedules
(1, 1, '2025-11-30', 9, 'PLANNED', '動物園で朝の時間を楽しむ。お弁当持参。', '2025-11-24 10:00:00'),
(1, 7, '2025-12-01', 10, 'PLANNED', 'プール一日券購入済み。水着とタオル準備。', '2025-11-24 10:30:00'),

-- User 2 schedules
(2, 3, '2025-11-28', 14, 'PLANNED', 'ピクニック準備。ボート遊びも予定。', '2025-11-23 15:00:00'),
(2, 14, '2025-12-02', 10, 'PLANNED', '子供の誕生日パーティー。友達も一緒。', '2025-11-23 15:30:00'),

-- User 3 schedules
(3, 2, '2025-11-29', 9, 'PLANNED', '文化体験ツアー。ワークショップ参加予定。', '2025-11-22 09:00:00'),

-- User 4 schedules
(4, 10, '2025-12-05', 8, 'PLANNED', 'アドベンチャーコース予約済み。運動靴持参。', '2025-11-21 11:00:00');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Database seeded successfully!' as message,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM children) as total_children,
    (SELECT COUNT(*) FROM spots) as total_spots,
    (SELECT COUNT(*) FROM spot_images) as total_images,
    (SELECT COUNT(*) FROM spot_tags) as total_tags,
    (SELECT COUNT(*) FROM reviews) as total_reviews,
    (SELECT COUNT(*) FROM favorites) as total_favorites,
    (SELECT COUNT(*) FROM kid_swipe) as total_swipes,
    (SELECT COUNT(*) FROM schedules) as total_schedules;
