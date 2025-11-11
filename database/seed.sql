USE kodomo_weekend_navi;
SET FOREIGN_KEY_CHECKS=0;

INSERT INTO users (user_id,email,password_hash,first_name,last_name,role,status,location_lat,location_lng,location_name,agreement,created_at,last_login_at) VALUES
(1,'admin@kodomo.com','$2a$10$rLqEh5dQoL3Yp9gGxR6PEep.YnHzAeVxYxEKPYCbmQxGqY8vRZqUC','Admin','Kodomo','ADMIN','ACTIVE',35.6762,139.6503,'Tokyo',TRUE,'2024-01-01 09:00:00','2025-11-11 10:00:00'),
(2,'tanaka.yuki@example.com','$2a$10$rLqEh5dQoL3Yp9gGxR6PEep.YnHzAeVxYxEKPYCbmQxGqY8vRZqUC','Yuki','Tanaka','USER','ACTIVE',35.6895,139.6917,'Shinjuku, Tokyo',TRUE,'2024-02-15 14:30:00','2025-11-10 16:20:00'),
(3,'nguyen.anh@example.com','$2a$10$rLqEh5dQoL3Yp9gGxR6PEep.YnHzAeVxYxEKPYCbmQxGqY8vRZqUC','Anh','Nguyen','USER','ACTIVE',35.6586,139.7454,'Sumida, Tokyo',TRUE,'2024-03-20 11:15:00','2025-11-09 09:45:00'),
(4,'sato.kenji@example.com','$2a$10$rLqEh5dQoL3Yp9gGxR6PEep.YnHzAeVxYxEKPYCbmQxGqY8vRZqUC','Kenji','Sato','USER','ACTIVE',35.7100,139.8107,'Chiba',TRUE,'2024-04-10 08:00:00','2025-11-08 18:30:00'),
(5,'spam.user@example.com','$2a$10$rLqEh5dQoL3Yp9gGxR6PEep.YnHzAeVxYxEKPYCbmQxGqY8vRZqUC','Spam','User','USER','BANNED',NULL,NULL,NULL,TRUE,'2024-05-01 12:00:00','2024-06-15 10:00:00');

INSERT INTO children (child_id,user_id,name,birth_date,avatar_url,notes,created_at) VALUES
(1,2,'Haruto','2019-04-15','/avatars/haruto.jpg','Thích động vật, sợ tiếng ồn lớn','2024-02-15 14:35:00'),
(2,2,'Himari','2021-08-20','/avatars/himari.jpg','Thích vẽ, làm đồ thủ công','2024-02-15 14:36:00'),
(3,3,'Minh','2018-12-10','/avatars/minh.jpg','Năng động, thích thể thao','2024-03-20 11:20:00'),
(4,4,'Ren','2020-06-05','/avatars/ren.jpg','Thích khám phá, tò mò về khoa học','2024-04-10 08:10:00'),
(5,4,'Yui','2022-02-28','/avatars/yui.jpg','Còn nhỏ, cần phòng cho bé bú','2024-04-10 08:11:00');

INSERT INTO child_preferences (child_id,preference_type,tag_name,created_at) VALUES
(1,'LIKE','animals','2024-02-15 14:40:00'),
(1,'LIKE','nature','2024-02-15 14:40:00'),
(1,'DISLIKE','loud_noise','2024-02-15 14:40:00'),
(2,'LIKE','crafts','2024-02-15 14:41:00'),
(2,'LIKE','painting','2024-02-15 14:41:00'),
(2,'LIKE','indoor','2024-02-15 14:41:00'),
(3,'LIKE','sports','2024-03-20 11:25:00'),
(3,'LIKE','outdoor','2024-03-20 11:25:00'),
(3,'LIKE','active','2024-03-20 11:25:00'),
(4,'LIKE','science','2024-04-10 08:15:00'),
(4,'LIKE','museum','2024-04-10 08:15:00'),
(4,'LIKE','learning','2024-04-10 08:15:00'),
(5,'LIKE','quiet','2024-04-10 08:16:00'),
(5,'DISLIKE','crowded','2024-04-10 08:16:00');

INSERT INTO spots (spot_id,name,description,category,min_age,max_age,price_range,is_indoor,address,latitude,longitude,google_maps_url,operating_hours,is_open_today,weather_suitable,estimated_visit_duration,status,created_by_admin_id,created_at) VALUES
(1,'Ueno Zoo (上野動物園)','Vườn thú lâu đời nhất Nhật Bản với hơn 3000 động vật. Có panda khổng lồ nổi tiếng!','ZOO',0,15,'1000_3000',FALSE,'9-83 Ueno Park, Taito City, Tokyo 110-8711',35.7150,139.7738,'https://maps.google.com/?q=35.7150,139.7738','{"monday":"9:30-17:00","tuesday":"Closed","wednesday":"9:30-17:00","thursday":"9:30-17:00","friday":"9:30-17:00","saturday":"9:30-17:00","sunday":"9:30-17:00"}',TRUE,'NO_RAIN',180,'PUBLIC',1,'2024-01-05 10:00:00'),
(2,'Tokyo Skytree (東京スカイツリー)','Tháp truyền hình cao nhất thế giới với tầm nhìn 360° tuyệt đẹp. Có aquarium và planetarium!','THEME_PARK',3,18,'OVER_5000',TRUE,'1-1-2 Oshiage, Sumida City, Tokyo 131-0045',35.7101,139.8107,'https://maps.google.com/?q=35.7101,139.8107','{"monday":"10:00-21:00","tuesday":"10:00-21:00","wednesday":"10:00-21:00","thursday":"10:00-21:00","friday":"10:00-21:00","saturday":"8:00-22:00","sunday":"8:00-22:00"}',TRUE,'ALL_WEATHER',240,'PUBLIC',1,'2024-01-05 10:30:00'),
(3,'National Museum of Nature and Science (国立科学博物館)','Bảo tàng khoa học với khủng long, vũ trụ, và nhiều triển lãm tương tác cho trẻ em','MUSEUM',5,18,'1000_3000',TRUE,'7-20 Ueno Park, Taito City, Tokyo 110-8718',35.7164,139.7761,'https://maps.google.com/?q=35.7164,139.7761','{"monday":"Closed","tuesday":"9:00-17:00","wednesday":"9:00-17:00","thursday":"9:00-17:00","friday":"9:00-20:00","saturday":"9:00-17:00","sunday":"9:00-17:00"}',TRUE,'ALL_WEATHER',150,'PUBLIC',1,'2024-01-05 11:00:00'),
(4,'Yoyogi Park (代々木公園)','Công viên rộng lớn lý tưởng cho picnic, đạp xe, chơi bóng. Miễn phí!','PARK',0,18,'FREE',FALSE,'2-1 Yoyogikamizonocho, Shibuya City, Tokyo 151-0052',35.6719,139.6961,'https://maps.google.com/?q=35.6719,139.6961','{"monday":"24h","tuesday":"24h","wednesday":"24h","thursday":"24h","friday":"24h","saturday":"24h","sunday":"24h"}',TRUE,'SUNNY_ONLY',120,'PUBLIC',1,'2024-01-06 09:00:00'),
(5,'KidZania Tokyo (キッザニア東京)','Thành phố thu nhỏ cho trẻ em trải nghiệm 100+ nghề nghiệp. Rất phổ biến!','INDOOR_PLAY',3,15,'OVER_5000',TRUE,'LaLaport Toyosu, 2-4-9 Toyosu, Koto City, Tokyo 135-8614',35.6549,139.7966,'https://maps.google.com/?q=35.6549,139.7966','{"monday":"9:00-15:00,16:00-21:00","tuesday":"9:00-15:00,16:00-21:00","wednesday":"9:00-15:00,16:00-21:00","thursday":"9:00-15:00,16:00-21:00","friday":"9:00-15:00,16:00-21:00","saturday":"9:00-15:00,16:00-21:00","sunday":"9:00-15:00,16:00-21:00"}',TRUE,'ALL_WEATHER',240,'PUBLIC',1,'2024-01-06 10:00:00'),
(6,'Odaiba Seaside Park (お台場海浜公園)','Bãi biển nhân tạo với tượng Nữ thần Tự do, view đẹp về Rainbow Bridge','OUTDOOR_PLAY',0,18,'FREE',FALSE,'1-4 Daiba, Minato City, Tokyo 135-0091',35.6295,139.7737,'https://maps.google.com/?q=35.6295,139.7737','{"monday":"24h","tuesday":"24h","wednesday":"24h","thursday":"24h","friday":"24h","saturday":"24h","sunday":"24h"}',TRUE,'SUNNY_ONLY',150,'PUBLIC',1,'2024-01-06 11:00:00'),
(7,'Sumida Aquarium (すみだ水族館)','Thủy cung hiện đại trong Tokyo Skytree với cá heo, sứa phát sáng, chim cánh cụt','AQUARIUM',0,18,'3000_5000',TRUE,'Tokyo Solamachi 5-6F, 1-1-2 Oshiage, Sumida City, Tokyo 131-0045',35.7101,139.8109,'https://maps.google.com/?q=35.7101,139.8109','{"monday":"10:00-20:00","tuesday":"10:00-20:00","wednesday":"10:00-20:00","thursday":"10:00-20:00","friday":"10:00-20:00","saturday":"9:00-21:00","sunday":"9:00-21:00"}',TRUE,'ALL_WEATHER',120,'PUBLIC',1,'2024-01-07 09:00:00'),
(8,'Ghibli Museum (三鷹の森ジブリ美術館)','Bảo tàng Studio Ghibli với Totoro, Spirited Away. Cần đặt vé trước!','MUSEUM',4,18,'1000_3000',TRUE,'1-1-83 Shimorenjaku, Mitaka, Tokyo 181-0013',35.6961,139.5704,'https://maps.google.com/?q=35.6961,139.5704','{"monday":"Closed","tuesday":"Closed","wednesday":"10:00-18:00","thursday":"10:00-18:00","friday":"10:00-18:00","saturday":"10:00-18:00","sunday":"10:00-18:00"}',FALSE,'ALL_WEATHER',150,'PUBLIC',1,'2024-01-07 10:00:00'),
(9,'ASOBono Indoor Playground (アソボーノ)','Khu vui chơi trong nhà khổng lồ với bể bóng, lego, trampo line. Phù hợp ngày mưa!','INDOOR_PLAY',0,8,'1000_3000',TRUE,'Tokyo Dome City, 1-3 Koraku, Bunkyo City, Tokyo 112-0004',35.7056,139.7520,'https://maps.google.com/?q=35.7056,139.7520','{"monday":"10:00-18:00","tuesday":"10:00-18:00","wednesday":"10:00-18:00","thursday":"10:00-18:00","friday":"10:00-18:00","saturday":"9:30-19:00","sunday":"9:30-19:00"}',TRUE,'ALL_WEATHER',180,'PUBLIC',1,'2024-01-08 09:00:00'),
(10,'Showa Kinen Park (国営昭和記念公園)','Công viên quốc gia khổng lồ với hoa tulip, cosmos, sân chơi khổng lồ','PARK',0,18,'UNDER_1000',FALSE,'3173 Midoricho, Tachikawa, Tokyo 190-0014',35.7078,139.4068,'https://maps.google.com/?q=35.7078,139.4068','{"monday":"9:30-17:00","tuesday":"9:30-17:00","wednesday":"9:30-17:00","thursday":"9:30-17:00","friday":"9:30-17:00","saturday":"9:30-18:00","sunday":"9:30-18:00"}',TRUE,'SUNNY_ONLY',240,'PUBLIC',1,'2024-01-08 10:00:00');

INSERT INTO spot_images (spot_id,image_url,is_main,display_order,uploaded_at) VALUES
(1,'/images/spots/ueno-zoo-main.jpg',TRUE,1,'2024-01-05 10:05:00'),
(1,'/images/spots/ueno-zoo-panda.jpg',FALSE,2,'2024-01-05 10:06:00'),
(1,'/images/spots/ueno-zoo-kids.jpg',FALSE,3,'2024-01-05 10:07:00'),
(2,'/images/spots/skytree-main.jpg',TRUE,1,'2024-01-05 10:35:00'),
(2,'/images/spots/skytree-view.jpg',FALSE,2,'2024-01-05 10:36:00'),
(3,'/images/spots/science-museum-main.jpg',TRUE,1,'2024-01-05 11:05:00'),
(3,'/images/spots/science-museum-dino.jpg',FALSE,2,'2024-01-05 11:06:00'),
(4,'/images/spots/yoyogi-park-main.jpg',TRUE,1,'2024-01-06 09:05:00'),
(4,'/images/spots/yoyogi-park-kids.jpg',FALSE,2,'2024-01-06 09:06:00'),
(5,'/images/spots/kidzania-main.jpg',TRUE,1,'2024-01-06 10:05:00'),
(5,'/images/spots/kidzania-activity.jpg',FALSE,2,'2024-01-06 10:06:00'),
(6,'/images/spots/odaiba-main.jpg',TRUE,1,'2024-01-06 11:05:00'),
(7,'/images/spots/sumida-aqua-main.jpg',TRUE,1,'2024-01-07 09:05:00'),
(7,'/images/spots/sumida-aqua-penguin.jpg',FALSE,2,'2024-01-07 09:06:00'),
(8,'/images/spots/ghibli-main.jpg',TRUE,1,'2024-01-07 10:05:00'),
(8,'/images/spots/ghibli-totoro.jpg',FALSE,2,'2024-01-07 10:06:00'),
(9,'/images/spots/asobono-main.jpg',TRUE,1,'2024-01-08 09:05:00'),
(10,'/images/spots/showa-park-main.jpg',TRUE,1,'2024-01-08 10:05:00');

INSERT INTO spot_facilities (spot_id,facility_name,is_available,notes) VALUES
(1,'PARKING',TRUE,'普通車600円/日'),
(1,'NURSING_ROOM',TRUE,'授乳室あり'),
(1,'STROLLER_ACCESSIBLE',TRUE,'ベビーカー貸出あり'),
(1,'RESTROOM',TRUE,'おむつ交換台あり'),
(1,'CAFE',TRUE,NULL),
(2,'PARKING',TRUE,'30分300円'),
(2,'NURSING_ROOM',TRUE,NULL),
(2,'STROLLER_ACCESSIBLE',TRUE,NULL),
(2,'RESTROOM',TRUE,NULL),
(2,'RESTAURANT',TRUE,'多数あり'),
(2,'ELEVATOR',TRUE,NULL),
(3,'PARKING',FALSE,'近隣の有料駐車場を利用'),
(3,'NURSING_ROOM',TRUE,NULL),
(3,'STROLLER_ACCESSIBLE',TRUE,NULL),
(3,'RESTROOM',TRUE,NULL),
(3,'CAFE',TRUE,NULL),
(4,'PARKING',FALSE,'なし'),
(4,'RESTROOM',TRUE,'公園内に複数あり'),
(4,'VENDING_MACHINE',TRUE,NULL),
(5,'PARKING',TRUE,'ららぽーと豊洲の駐車場'),
(5,'NURSING_ROOM',TRUE,NULL),
(5,'STROLLER_PARKING',TRUE,'ベビーカー置き場あり'),
(5,'RESTROOM',TRUE,NULL),
(5,'LOCKER',TRUE,NULL),
(6,'PARKING',TRUE,'近隣に多数'),
(6,'RESTROOM',TRUE,NULL),
(6,'SHOWER',TRUE,'夏季のみ'),
(7,'PARKING',TRUE,'スカイツリー駐車場'),
(7,'NURSING_ROOM',TRUE,NULL),
(7,'STROLLER_ACCESSIBLE',TRUE,NULL),
(7,'RESTROOM',TRUE,NULL),
(7,'CAFE',TRUE,NULL),
(8,'PARKING',FALSE,'なし（公共交通機関推奨）'),
(8,'NURSING_ROOM',TRUE,NULL),
(8,'STROLLER_ACCESSIBLE',FALSE,'ベビーカー不可'),
(8,'RESTROOM',TRUE,NULL),
(8,'CAFE',TRUE,NULL),
(9,'PARKING',TRUE,'東京ドーム駐車場'),
(9,'NURSING_ROOM',TRUE,NULL),
(9,'STROLLER_PARKING',TRUE,NULL),
(9,'RESTROOM',TRUE,NULL),
(9,'LOCKER',TRUE,NULL),
(10,'PARKING',TRUE,'普通車900円/日'),
(10,'NURSING_ROOM',TRUE,NULL),
(10,'STROLLER_RENTAL',TRUE,'レンタル300円'),
(10,'RESTROOM',TRUE,'園内多数'),
(10,'RESTAURANT',TRUE,NULL);

INSERT INTO spot_tags (spot_id,tag_name) VALUES
(1,'動物'),(1,'屋外'),(1,'パンダ'),(1,'人気'),
(2,'室内'),(2,'景色'),(2,'雨の日OK'),(2,'デート'),
(3,'室内'),(3,'学習'),(3,'雨の日OK'),(3,'恐竜'),
(4,'無料'),(4,'屋外'),(4,'ピクニック'),(4,'広い'),
(5,'室内'),(5,'雨の日OK'),(5,'体験'),(5,'人気'),(5,'要予約'),
(6,'無料'),(6,'屋外'),(6,'ビーチ'),(6,'景色'),
(7,'室内'),(7,'雨の日OK'),(7,'水族館'),(7,'ペンギン'),
(8,'室内'),(8,'雨の日OK'),(8,'ジブリ'),(8,'要予約'),
(9,'室内'),(9,'雨の日OK'),(9,'乳幼児OK'),(9,'遊び場'),
(10,'屋外'),(10,'広い'),(10,'花'),(10,'自転車');

INSERT INTO reviews (review_id,spot_id,user_id,rating,comment,safety_report_count,helpful_count,is_hidden,posted_at) VALUES
(1,1,2,5,'パンダが可愛すぎました！子供が大喜びでした。授乳室も綺麗で助かりました。',0,15,FALSE,'2024-05-10 15:30:00'),
(2,1,3,4,'とても広くて一日楽しめます。ただし週末は混雑します。',0,8,FALSE,'2024-06-15 11:20:00'),
(3,2,2,5,'Tầm nhìn tuyệt vời! Trẻ rất thích thủy cung ở dưới.',0,12,FALSE,'2024-07-20 14:45:00'),
(4,2,4,4,'高いけど、一度は行く価値あり。子連れ設備も充実。',0,6,FALSE,'2024-08-05 16:10:00'),
(5,3,3,5,'Con rất thích khủng long! Có nhiều hoạt động tương tác.',0,10,FALSE,'2024-07-15 10:30:00'),
(6,4,2,5,'無料で広くて最高！ピクニックに最適です。',0,20,FALSE,'2024-09-01 12:00:00'),
(7,4,4,4,'天気が良い日におすすめ。子供が走り回れる。',0,7,FALSE,'2024-09-10 13:30:00'),
(8,5,3,5,'Con được trải nghiệm làm nhiều nghề, rất vui!',0,18,FALSE,'2024-08-20 17:00:00'),
(9,5,2,4,'予約必須。高いけど子供の体験学習に良い。',0,9,FALSE,'2024-08-25 18:30:00'),
(10,7,4,5,'ペンギンが可愛い！室内なので雨でもOK。',0,11,FALSE,'2024-09-15 15:45:00'),
(11,8,2,5,'ジブリ好きなら必見！チケット取るの大変だけど行く価値あり。',0,25,FALSE,'2024-10-01 14:20:00'),
(12,9,3,5,'Ngày mưa đi đây rất tuyệt! Trẻ chơi cả ngày không chán.',0,14,FALSE,'2024-10-10 16:00:00'),
(13,10,4,4,'広すぎて全部回れない。自転車レンタルがおすすめ。',0,8,FALSE,'2024-10-20 13:00:00');

INSERT INTO review_images (review_id,image_url,uploaded_at) VALUES
(1,'/images/reviews/review-1-panda.jpg','2024-05-10 15:31:00'),
(1,'/images/reviews/review-1-kids.jpg','2024-05-10 15:32:00'),
(3,'/images/reviews/review-3-view.jpg','2024-07-20 14:46:00'),
(5,'/images/reviews/review-5-dino.jpg','2024-07-15 10:31:00'),
(6,'/images/reviews/review-6-picnic.jpg','2024-09-01 12:01:00'),
(8,'/images/reviews/review-8-kidzania.jpg','2024-08-20 17:01:00'),
(10,'/images/reviews/review-10-penguin.jpg','2024-09-15 15:46:00'),
(11,'/images/reviews/review-11-totoro.jpg','2024-10-01 14:21:00');

INSERT INTO review_facilities (review_id,facility_name,is_checked) VALUES
(1,'CLEAN',TRUE),(1,'SAFE',TRUE),(1,'KID_FRIENDLY',TRUE),(1,'NURSING_ROOM_CLEAN',TRUE),
(3,'CLEAN',TRUE),(3,'ACCESSIBLE',TRUE),
(5,'INTERACTIVE',TRUE),(5,'EDUCATIONAL',TRUE),
(6,'SPACIOUS',TRUE),(6,'FREE_ENTRY',TRUE),
(8,'FUN',TRUE),(8,'EDUCATIONAL',TRUE),
(10,'CLEAN',TRUE),(10,'INDOOR',TRUE),
(11,'UNIQUE',TRUE),(11,'PHOTO_SPOT',TRUE);

INSERT INTO favorites (user_id,spot_id,collection_tag,saved_at) VALUES
(2,1,'Animal','2024-05-10 16:00:00'),
(2,2,'Indoor','2024-07-20 15:00:00'),
(2,4,'Free','2024-09-01 12:30:00'),
(2,5,'Indoor','2024-08-25 19:00:00'),
(2,8,'Special','2024-10-01 15:00:00'),
(3,1,'Animal','2024-06-15 12:00:00'),
(3,3,'Learning','2024-07-15 11:00:00'),
(3,5,'Indoor','2024-08-20 17:30:00'),
(3,9,'Rainy Day','2024-10-10 16:30:00'),
(4,2,'View','2024-08-05 17:00:00'),
(4,4,'Free','2024-09-10 14:00:00'),
(4,7,'Indoor','2024-09-15 16:15:00'),
(4,10,'Nature','2024-10-20 13:30:00');

INSERT INTO schedules (user_id,spot_id,scheduled_date,time_slot,travel_time,reminder_enabled,status,notes,created_at) VALUES
(2,1,'2025-11-16','AM',30,TRUE,'PLANNED','パンダを見に行く！','2025-11-10 20:00:00'),
(2,4,'2025-11-16','PM',25,TRUE,'PLANNED','ピクニック','2025-11-10 20:05:00'),
(3,5,'2025-11-17','FULL_DAY',45,TRUE,'PLANNED','KidZania体験','2025-11-09 18:00:00'),
(4,7,'2025-11-16','AM',40,FALSE,'PLANNED','水族館','2025-11-08 19:00:00'),
(4,6,'2025-11-16','PM',35,FALSE,'PLANNED','お台場で遊ぶ','2025-11-08 19:05:00'),
(2,3,'2024-10-15','AM',20,TRUE,'COMPLETED','恐竜展を見た','2024-10-10 10:00:00'),
(3,1,'2024-09-20','FULL_DAY',50,FALSE,'COMPLETED','とても楽しかった','2024-09-15 15:00:00');

INSERT INTO kidswipe_history (user_id,child_id,spot_id,action,timestamp) VALUES
(2,1,1,'LIKE','2024-05-01 10:00:00'),
(2,1,3,'SKIP','2024-05-01 10:01:00'),
(2,1,4,'LIKE','2024-05-01 10:02:00'),
(2,1,6,'LIKE','2024-05-01 10:03:00'),
(2,2,5,'LIKE','2024-05-02 14:00:00'),
(2,2,8,'LIKE','2024-05-02 14:01:00'),
(2,2,9,'LIKE','2024-05-02 14:02:00'),
(3,3,4,'LIKE','2024-06-10 11:00:00'),
(3,3,10,'LIKE','2024-06-10 11:01:00'),
(3,3,1,'LIKE','2024-06-10 11:02:00'),
(4,4,3,'LIKE','2024-07-15 09:00:00'),
(4,4,2,'LIKE','2024-07-15 09:01:00'),
(4,5,9,'LIKE','2024-07-20 10:00:00'),
(4,5,7,'LIKE','2024-07-20 10:01:00');

INSERT INTO recommendations (user_id,child_id,spot_id,score,factors,generated_at,expires_at) VALUES
(2,1,1,95.50,'{"distance":5,"age_match":10,"weather":8,"preference_match":10}','2025-11-11 08:00:00','2025-11-11 23:59:59'),
(2,1,10,88.20,'{"distance":7,"age_match":10,"weather":7,"preference_match":9}','2025-11-11 08:00:00','2025-11-11 23:59:59'),
(2,2,5,92.00,'{"distance":6,"age_match":10,"weather":10,"preference_match":9}','2025-11-11 08:00:00','2025-11-11 23:59:59'),
(3,3,4,90.00,'{"distance":4,"age_match":10,"weather":8,"preference_match":10}','2025-11-11 08:00:00','2025-11-11 23:59:59'),
(4,4,3,93.50,'{"distance":5,"age_match":10,"weather":10,"preference_match":10}','2025-11-11 08:00:00','2025-11-11 23:59:59');

INSERT INTO kpis_metrics (date,metric_name,value,time_period,calculated_at) VALUES
('2025-11-01','DecisionTime',15.30,'DAILY','2025-11-01 23:00:00'),
('2025-11-01','RouteActivationRate',78.50,'DAILY','2025-11-01 23:00:00'),
('2025-11-01','AverageRating',4.45,'DAILY','2025-11-01 23:00:00'),
('2025-11-05','DecisionTime',12.80,'DAILY','2025-11-05 23:00:00'),
('2025-11-05','RouteActivationRate',82.30,'DAILY','2025-11-05 23:00:00'),
('2025-11-05','AverageRating',4.52,'DAILY','2025-11-05 23:00:00'),
('2025-11-10','DecisionTime',10.50,'DAILY','2025-11-10 23:00:00'),
('2025-11-10','RouteActivationRate',85.70,'DAILY','2025-11-10 23:00:00'),
('2025-11-10','AverageRating',4.58,'DAILY','2025-11-10 23:00:00'),
('2025-11-01','MonthlyActiveUsers',1250.00,'MONTHLY','2025-11-01 00:00:00'),
('2025-11-01','MonthlyRepeatRate',65.20,'MONTHLY','2025-11-01 00:00:00');

INSERT INTO admin_activity_logs (admin_id,action,target_type,target_id,details,timestamp) VALUES
(1,'CREATE_SPOT','Spot',1,'{"name":"Ueno Zoo","category":"ZOO"}','2024-01-05 10:00:00'),
(1,'CREATE_SPOT','Spot',2,'{"name":"Tokyo Skytree","category":"THEME_PARK"}','2024-01-05 10:30:00'),
(1,'CREATE_SPOT','Spot',3,'{"name":"Science Museum","category":"MUSEUM"}','2024-01-05 11:00:00'),
(1,'EDIT_SPOT','Spot',1,'{"field":"description","old":"...","new":"..."}','2024-03-10 14:00:00'),
(1,'BAN_USER','User',5,'{"reason":"Spam reviews"}','2024-06-15 10:00:00');

INSERT INTO weather_conditions (date,location,weather_condition,temperature,fetched_at) VALUES
('2025-11-11','Tokyo','SUNNY',18.5,'2025-11-11 06:00:00'),
('2025-11-12','Tokyo','CLOUDY',16.2,'2025-11-11 06:00:00'),
('2025-11-13','Tokyo','RAINY',14.8,'2025-11-11 06:00:00'),
('2025-11-14','Tokyo','SUNNY',19.3,'2025-11-11 06:00:00'),
('2025-11-15','Tokyo','SUNNY',20.1,'2025-11-11 06:00:00'),
('2025-11-16','Tokyo','CLOUDY',17.5,'2025-11-11 06:00:00'),
('2025-11-17','Tokyo','SUNNY',19.8,'2025-11-11 06:00:00');

SET FOREIGN_KEY_CHECKS=1;

UPDATE spots s
SET average_rating = (SELECT AVG(rating) FROM reviews WHERE spot_id=s.spot_id AND is_hidden=FALSE),
    total_reviews  = (SELECT COUNT(*) FROM reviews WHERE spot_id=s.spot_id AND is_hidden=FALSE);
