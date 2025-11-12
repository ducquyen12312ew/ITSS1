USE kodomo_weekend_navi;

-- Users 
-- password for test accounts: password123
-- password for buibaomoyu@gmail.com: (Bao_password)
INSERT INTO users (email, password_hash, first_name, last_name, role, status, agreement, location_lat, location_lng, location_name) VALUES
('admin@kodomo.com', '$2b$10$rT8YhS8qN3x5L1mZ9yJZWe7K3vN9xL2mZ8yJZWe7K3vN9xL2mZ8yJ', 'Admin', 'System', 'ADMIN', 'ACTIVE', TRUE, 35.6762, 139.6503, 'Tokyo'),
('buibaomoyu@gmail.com', '$2b$10$leYXirPOMnfEN.fLYUPpXehbBMbeVEtc87xwf9Ag39hPw.DrXM/vO', 'Bao', 'Bui', 'USER', 'ACTIVE', TRUE, 35.6812, 139.7671, 'Tokyo'),
('tanaka.yuki@example.com', '$2b$10$rT8YhS8qN3x5L1mZ9yJZWe7K3vN9xL2mZ8yJZWe7K3vN9xL2mZ8yJ', 'Yuki', 'Tanaka', 'USER', 'ACTIVE', TRUE, 35.6812, 139.7671, 'Ueno'),
('sato.kenji@example.com', '$2b$10$rT8YhS8qN3x5L1mZ9yJZWe7K3vN9xL2mZ8yJZWe7K3vN9xL2mZ8yJ', 'Kenji', 'Sato', 'USER', 'ACTIVE', TRUE, 35.6586, 139.7454, 'Asakusa'),
('suzuki.mai@example.com', '$2b$10$rT8YhS8qN3x5L1mZ9yJZWe7K3vN9xL2mZ8yJZWe7K3vN9xL2mZ8yJ', 'Mai', 'Suzuki', 'USER', 'ACTIVE', TRUE, 35.6284, 139.7366, 'Shinagawa');

-- Children
INSERT INTO children (user_id, name, birth_date, avatar_url, notes) VALUES
(2, 'Minh', '2020-03-15', 'https://i.pravatar.cc/150?img=1', 'Loves exploring'),
(2, 'An', '2022-08-22', 'https://i.pravatar.cc/150?img=2', 'Curious toddler'),
(3, 'Taro', '2018-04-15', 'https://i.pravatar.cc/150?img=3', 'Loves animals'),
(3, 'Hanako', '2020-08-22', 'https://i.pravatar.cc/150?img=4', 'Likes crafts'),
(4, 'Kenta', '2017-12-10', 'https://i.pravatar.cc/150?img=5', 'Enjoys outdoor'),
(5, 'Misaki', '2019-06-05', 'https://i.pravatar.cc/150?img=6', 'Allergic to peanuts');

-- Child preferences
INSERT INTO child_preferences (child_id, preference_type, tag_name) VALUES
(1, 'LIKE', 'animals'),
(1, 'LIKE', 'outdoor'),
(1, 'DISLIKE', 'indoor'),
(2, 'LIKE', 'crafts'),
(2, 'LIKE', 'indoor'),
(3, 'LIKE', 'outdoor'),
(3, 'LIKE', 'sports'),
(4, 'LIKE', 'animals'),
(4, 'LIKE', 'crafts');

-- Spots
INSERT INTO spots (name, description, category, min_age, max_age, price_range, is_indoor, address, latitude, longitude, google_maps_url, operating_hours, is_open_today, weather_suitable, estimated_visit_duration, facilities, status, created_by_admin_id) VALUES
('Ueno Zoo', 'Oldest zoo in Japan with pandas and elephants', 'ZOO', 2, 12, '1000_3000', FALSE, 'Taito-ku, Tokyo', 35.7152, 139.7737, 'https://maps.google.com/?q=35.7152,139.7737', '{"monday":"9:30-17:00","tuesday":"9:30-17:00","wednesday":"Closed","thursday":"9:30-17:00","friday":"9:30-17:00","saturday":"9:30-17:00","sunday":"9:30-17:00"}', TRUE, 'RAIN_OK', 180, '{"parking":true,"nursing_room":true,"stroller":true,"restroom":true,"cafe":true}', 'PUBLIC', 1),
('National Museum of Nature and Science', 'Dinosaur fossils and science experiments', 'MUSEUM', 4, 15, '1000_3000', TRUE, 'Taito-ku, Tokyo', 35.7164, 139.7760, 'https://maps.google.com/?q=35.7164,139.7760', '{"monday":"9:00-17:00","tuesday":"Closed","wednesday":"9:00-17:00","thursday":"9:00-17:00","friday":"9:00-20:00","saturday":"9:00-17:00","sunday":"9:00-17:00"}', TRUE, 'ALL_WEATHER', 150, '{"parking":false,"nursing_room":true,"stroller":true,"restroom":true,"cafe":true}', 'PUBLIC', 1),
('Tokyo Skytree', '634m tall observation tower', 'THEME_PARK', 0, 18, '3000_5000', TRUE, 'Sumida-ku, Tokyo', 35.7101, 139.8107, 'https://maps.google.com/?q=35.7101,139.8107', '{"monday":"10:00-21:00","tuesday":"10:00-21:00","wednesday":"10:00-21:00","thursday":"10:00-21:00","friday":"10:00-21:00","saturday":"10:00-21:00","sunday":"10:00-21:00"}', TRUE, 'ALL_WEATHER', 120, '{"parking":true,"nursing_room":true,"stroller":true,"restroom":true,"cafe":true}', 'PUBLIC', 1),
('Odaiba Seaside Park', 'Beach park with sandy area', 'PARK', 0, 18, 'FREE', FALSE, 'Minato-ku, Tokyo', 35.6295, 139.7741, 'https://maps.google.com/?q=35.6295,139.7741', '{"monday":"24h","tuesday":"24h","wednesday":"24h","thursday":"24h","friday":"24h","saturday":"24h","sunday":"24h"}', TRUE, 'SUNNY_ONLY', 180, '{"parking":true,"nursing_room":false,"stroller":true,"restroom":true,"cafe":false}', 'PUBLIC', 1),
('KidZania Tokyo', 'Occupational experience for kids', 'INDOOR_PLAY', 3, 12, '3000_5000', TRUE, 'Koto-ku, Tokyo', 35.6548, 139.7966, 'https://maps.google.com/?q=35.6548,139.7966', '{"monday":"9:00-15:00","tuesday":"9:00-15:00","wednesday":"9:00-15:00","thursday":"9:00-15:00","friday":"9:00-15:00","saturday":"9:00-15:00","sunday":"9:00-15:00"}', TRUE, 'ALL_WEATHER', 240, '{"parking":true,"nursing_room":true,"stroller":false,"restroom":true,"cafe":true}', 'PUBLIC', 1),
('Kasai Rinkai Aquarium', 'Famous aquarium with tuna tank', 'AQUARIUM', 0, 18, '1000_3000', TRUE, 'Edogawa-ku, Tokyo', 35.6426, 139.8571, 'https://maps.google.com/?q=35.6426,139.8571', '{"monday":"9:30-17:00","tuesday":"9:30-17:00","wednesday":"Closed","thursday":"9:30-17:00","friday":"9:30-17:00","saturday":"9:30-17:00","sunday":"9:30-17:00"}', TRUE, 'ALL_WEATHER', 150, '{"parking":true,"nursing_room":true,"stroller":true,"restroom":true,"cafe":true}', 'PUBLIC', 1),
('Yoyogi Park', 'Large park with lawn and forest', 'PARK', 0, 18, 'FREE', FALSE, 'Shibuya-ku, Tokyo', 35.6719, 139.6951, 'https://maps.google.com/?q=35.6719,139.6951', '{"monday":"24h","tuesday":"24h","wednesday":"24h","thursday":"24h","friday":"24h","saturday":"24h","sunday":"24h"}', TRUE, 'SUNNY_ONLY', 120, '{"parking":false,"nursing_room":false,"stroller":true,"restroom":true,"cafe":false}', 'PUBLIC', 1),
('teamLab Borderless', 'Digital art museum', 'MUSEUM', 0, 18, '3000_5000', TRUE, 'Koto-ku, Tokyo', 35.6253, 139.7755, 'https://maps.google.com/?q=35.6253,139.7755', '{"monday":"10:00-19:00","tuesday":"Closed","wednesday":"10:00-19:00","thursday":"10:00-19:00","friday":"10:00-21:00","saturday":"10:00-21:00","sunday":"10:00-19:00"}', TRUE, 'ALL_WEATHER', 120, '{"parking":true,"nursing_room":true,"stroller":false,"restroom":true,"cafe":true}', 'PUBLIC', 1),
('Asobono', 'Indoor playground in Tokyo Dome City', 'INDOOR_PLAY', 0, 8, '1000_3000', TRUE, 'Bunkyo-ku, Tokyo', 35.7056, 139.7520, 'https://maps.google.com/?q=35.7056,139.7520', '{"monday":"10:00-18:00","tuesday":"10:00-18:00","wednesday":"10:00-18:00","thursday":"10:00-18:00","friday":"10:00-18:00","saturday":"10:00-19:00","sunday":"10:00-19:00"}', TRUE, 'ALL_WEATHER', 180, '{"parking":true,"nursing_room":true,"stroller":true,"restroom":true,"cafe":true}', 'PUBLIC', 1),
('Inokashira Park Zoo', 'Small zoo and aquatic life museum', 'ZOO', 2, 12, 'UNDER_1000', FALSE, 'Musashino-shi, Tokyo', 35.7000, 139.5776, 'https://maps.google.com/?q=35.7000,139.5776', '{"monday":"9:30-17:00","tuesday":"9:30-17:00","wednesday":"Closed","thursday":"9:30-17:00","friday":"9:30-17:00","saturday":"9:30-17:00","sunday":"9:30-17:00"}', TRUE, 'RAIN_OK', 120, '{"parking":false,"nursing_room":false,"stroller":true,"restroom":true,"cafe":false}', 'PUBLIC', 1);

-- Spot images
INSERT INTO spot_images (spot_id, image_url, is_main, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1581181530057-8a33e3c94a54', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1569137139943-ce8bc12c4b5c', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', TRUE, 1),
(6, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1591604466107-ec97de577aff', TRUE, 1),
(8, 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73', TRUE, 1),
(9, 'https://images.unsplash.com/photo-1587832187482-08b97139a5f6', TRUE, 1),
(10, 'https://images.unsplash.com/photo-1516641051054-9df6a1aad654', TRUE, 1);

-- Spot tags (including common tags: age ranges, indoor/outdoor for all spots)
INSERT INTO spot_tags (spot_id, tag_name) VALUES
-- Ueno Zoo
(1, 'outdoor'),(1, 'animals'),(1, 'rain_ok'),(1, 'age_2-5'),(1, 'age_6-12'),(1, 'educational'),(1, 'nature'),
-- National Museum
(2, 'indoor'),(2, 'educational'),(2, 'crafts'),(2, 'age_4-8'),(2, 'age_9-15'),(2, 'science'),(2, 'museum'),
-- Tokyo Skytree
(3, 'indoor'),(3, 'sightseeing'),(3, 'age_0-3'),(3, 'age_4-8'),(3, 'age_9-15'),(3, 'age_16-18'),(3, 'family'),
-- Odaiba Seaside Park
(4, 'outdoor'),(4, 'water'),(4, 'free'),(4, 'age_0-3'),(4, 'age_4-8'),(4, 'age_9-15'),(4, 'beach'),(4, 'picnic'),
-- KidZania Tokyo
(5, 'indoor'),(5, 'roleplay'),(5, 'educational'),(5, 'age_4-8'),(5, 'age_9-12'),(5, 'interactive'),(5, 'career'),
-- Kasai Rinkai Aquarium
(6, 'indoor'),(6, 'animals'),(6, 'water'),(6, 'age_0-3'),(6, 'age_4-8'),(6, 'age_9-15'),(6, 'age_16-18'),(6, 'marine_life'),
-- Yoyogi Park
(7, 'outdoor'),(7, 'free'),(7, 'picnic'),(7, 'age_0-3'),(7, 'age_4-8'),(7, 'age_9-15'),(7, 'nature'),(7, 'sports'),
-- teamLab Borderless
(8, 'indoor'),(8, 'art'),(8, 'digital'),(8, 'age_0-3'),(8, 'age_4-8'),(8, 'age_9-15'),(8, 'age_16-18'),(8, 'interactive'),
-- Asobono
(9, 'indoor'),(9, 'play'),(9, 'kids_only'),(9, 'age_0-3'),(9, 'age_4-8'),(9, 'safe'),(9, 'toddler'),
-- Inokashira Park Zoo
(10, 'outdoor'),(10, 'animals'),(10, 'cheap'),(10, 'age_2-5'),(10, 'age_6-12'),(10, 'nature'),(10, 'small_zoo');

-- Reviews
INSERT INTO reviews (spot_id, user_id, rating, comment, image_url, facilities_check, report_count, is_hidden) VALUES
(1, 2, 5, 'Kids loved seeing the pandas!', 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7', '{"clean":true,"safe":true,"kid_friendly":true}', 0, FALSE),
(1, 3, 4, 'Large zoo, can spend full day', NULL, '{"clean":true,"safe":true}', 0, FALSE),
(2, 2, 5, 'Dinosaur exhibition is amazing!', NULL, '{"clean":true,"educational":true}', 0, FALSE),
(3, 3, 5, 'Best view of Tokyo!', NULL, '{"clean":true}', 0, FALSE),
(4, 2, 4, 'Fun beach area for kids', NULL, '{"safe":true}', 0, FALSE),
(5, 4, 5, 'Realistic occupational experience', NULL, '{"educational":true,"kid_friendly":true}', 0, FALSE),
(6, 2, 5, 'Tuna tank is spectacular', NULL, '{"clean":true,"kid_friendly":true}', 0, FALSE),
(7, 4, 4, 'Perfect for picnic', NULL, '{"safe":true}', 0, FALSE),
(8, 2, 5, 'Magical art experience!', NULL, '{"clean":true}', 0, FALSE),
(9, 3, 5, 'Safe playground for small kids', NULL, '{"safe":true,"kid_friendly":true}', 0, FALSE);

-- Favorites
INSERT INTO favorites (user_id, spot_id, collection_tag) VALUES
(2, 1, 'Animals'),(2, 6, 'Animals'),(2, 2, 'Indoor'),
(3, 7, 'Free'),(3, 4, 'Outdoor'),(3, 1, 'Weekend Plans'),
(4, 5, 'Educational'),(4, 9, 'Indoor'),
(5, 8, 'Art & Culture'),(5, 3, 'Sightseeing');

-- Schedules
INSERT INTO schedules (user_id, spot_id, scheduled_date, time_slot, status, notes) VALUES
(2, 1, '2025-11-16', 'AM', 'PLANNED', 'Visit pandas with Minh'),
(2, 6, '2025-11-17', 'PM', 'PLANNED', 'Aquarium date'),
(3, 7, '2025-11-16', 'FULL_DAY', 'PLANNED', 'Picnic with Taro and Hanako'),
(4, 5, '2025-11-23', 'AM', 'PLANNED', 'Reserved for Kenta'),
(5, 8, '2025-11-24', 'PM', 'PLANNED', 'teamLab with Misaki');

-- Kid swipe history (updated with spot_id instead of tag_name)
INSERT INTO kid_swipe (child_id, spot_id, action) VALUES
-- Minh (child_id=1) liked zoo and aquarium, skipped museum
(1, 1, 'LIKE'),  -- Ueno Zoo
(1, 6, 'LIKE'),  -- Kasai Rinkai Aquarium
(1, 2, 'SKIP'),  -- National Museum
-- An (child_id=2) liked indoor play, skipped outdoor park
(2, 9, 'LIKE'),  -- Asobono
(2, 5, 'LIKE'),  -- KidZania
(2, 7, 'SKIP'),  -- Yoyogi Park
-- Taro (child_id=3) liked outdoor activities
(3, 1, 'LIKE'),  -- Ueno Zoo
(3, 4, 'LIKE'),  -- Odaiba Seaside Park
(3, 7, 'LIKE'),  -- Yoyogi Park
-- Hanako (child_id=4) liked art and indoor
(4, 8, 'LIKE'),  -- teamLab
(4, 2, 'LIKE'),  -- National Museum
(4, 4, 'SKIP'),  -- Odaiba (outdoor)
-- Kenta (child_id=5) adventurous, likes variety
(5, 1, 'LIKE'),  -- Ueno Zoo
(5, 5, 'LIKE'),  -- KidZania
(5, 8, 'LIKE'),  -- teamLab
(5, 10, 'SKIP'); -- Inokashira Park Zoo

-- Weather cache
INSERT INTO weather_cache (date, location, weather_condition, temperature) VALUES
('2025-11-11', 'Tokyo', 'SUNNY', 18.5),
('2025-11-12', 'Tokyo', 'CLOUDY', 16.2),
('2025-11-13', 'Tokyo', 'RAINY', 14.8);

SELECT 'Seed data inserted successfully' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_spots FROM spots;
SELECT COUNT(*) AS total_reviews FROM reviews;
