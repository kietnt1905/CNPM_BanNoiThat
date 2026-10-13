-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: web_noithat
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `web_noithat`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `web_noithat` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `web_noithat`;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_variant` (`cart_id`,`variant_id`),
  KEY `fk_cart_items_variant` (`variant_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Bàn ăn cao cấp','ban-an','Mặt đá Ceramic chống ố, Gỗ óc chó FAS.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(2,'Bàn trà - Sofa','ban-tra','Đá Marble Calacatta & Kim loại mạ PVD.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(3,'Bàn làm việc','ban-lam-viec','Gỗ óc chó Bắc Mỹ & Thiết kế công thái học.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(4,'Bàn trang điểm','ban-trang-diem','Gương Bỉ tráng bạc & Đường uốn lượn duyên dáng.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(5,'Sofa da thật','sofa-da','Da bò Ý thuộc thảo mộc tự nhiên 100%.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(6,'Sofa vải nỉ','sofa-vai','Vải len Bouclé nhập khẩu & Đệm lông vũ êm ái.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(7,'Ghế Armchair thư giãn','ghe-thu-gian','Mây đan mắt cáo thủ công & Đệm lông vũ.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(8,'Ghế ăn sang trọng','ghe-an','Da Nappa cao cấp, tựa cong ôm trọn cơ thể.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(9,'Giường ngủ Master','giuong-ngu','Gỗ sồi khối và gỗ óc chó nâng niu giấc ngủ.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(10,'Tab & Tủ kệ cao cấp','tu-ke','Cánh kính khói & Phụ kiện Hafele giảm chấn.',1,'2026-10-09 22:24:23','2026-10-09 22:24:23');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2026_10_01_142919_create_cart_items_table',1),(2,'2026_10_01_142919_create_carts_table',1),(3,'2026_10_01_142919_create_categories_table',1),(4,'2026_10_01_142919_create_order_items_table',1),(5,'2026_10_01_142919_create_orders_table',1),(6,'2026_10_01_142919_create_payments_table',1),(7,'2026_10_01_142919_create_product_images_table',1),(8,'2026_10_01_142919_create_product_variants_table',1),(9,'2026_10_01_142919_create_products_table',1),(10,'2026_10_01_142919_create_users_table',1),(11,'2026_10_01_142922_add_foreign_keys_to_cart_items_table',1),(12,'2026_10_01_142922_add_foreign_keys_to_carts_table',1),(13,'2026_10_01_142922_add_foreign_keys_to_order_items_table',1),(14,'2026_10_01_142922_add_foreign_keys_to_orders_table',1),(15,'2026_10_01_142922_add_foreign_keys_to_payments_table',1),(16,'2026_10_01_142922_add_foreign_keys_to_product_images_table',1),(17,'2026_10_01_142922_add_foreign_keys_to_product_variants_table',1),(18,'2026_10_01_142922_add_foreign_keys_to_products_table',1),(19,'2026_10_02_042250_create_personal_access_tokens_table',1),(20,'2026_10_02_070239_add_google_and_otp_to_users_table',1),(21,'2026_10_02_070538_create_otp_verifications_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dimensions_snapshot` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `line_total` decimal(15,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_variant` (`order_id`,`variant_id`),
  KEY `fk_order_items_variant` (`variant_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `recipient_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','confirmed','shipping','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `shipping_fee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(15,2) GENERATED ALWAYS AS (((`subtotal` + `shipping_fee`) - `discount_amount`)) STORED,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `idx_orders_status_date` (`status`,`created_at`),
  KEY `idx_orders_user_date` (`user_id`,`created_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `otp_verifications_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `method` enum('cod','bank_transfer','vnpay','momo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','success','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `transaction_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_code` (`transaction_code`),
  KEY `fk_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_images_order` (`product_id`,`sort_order`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80','Bộ Bàn Ăn Hoàng Gia Elegance 8 Chỗ Mặt Đá',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(2,1,'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80','Bộ Bàn Ăn Hoàng Gia Elegance 8 Chỗ Mặt Đá',1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(3,2,'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80','Bàn Ăn Mở Rộng Thông Minh Calacatta Gold',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(4,3,'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80','Bàn Trà Đôi Mặt Đá Marble Calacatta Elegance',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(5,4,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80','Bàn Tròn Cà Phê Gỗ Óc Chó Nghệ Thuật',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(6,5,'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80','Bàn Làm Việc Giám Đốc Atelier Master Óc Chó',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(7,6,'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80','Bàn Làm Việc Nâng Hạ Thông Minh Pro Desk',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(8,7,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80','Sofa Da Thật Tuscany Thượng Hạng 3 Chỗ',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(9,8,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80','Sofa Vải Dệt Bouclé Scandinavian Cloud',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(10,9,'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80','Ghế Armchair Mây Đan Mắt Cáo Thủ Công Osaka',0,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(11,10,'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80','Ghế Ăn Da Nappa Khung Kim Loại Mạ PVD',0,'2026-10-09 22:24:23','2026-10-09 22:24:23');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `length_cm` decimal(8,2) DEFAULT NULL,
  `width_cm` decimal(8,2) DEFAULT NULL,
  `height_cm` decimal(8,2) DEFAULT NULL,
  `weight_kg` decimal(8,2) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `stock_quantity` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `fk_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'BA-ELG-01','Nâu óc chó','Mặt đá Ceramic Nano & Gỗ Óc Chó FAS',220.00,95.00,75.00,NULL,46500000.00,10,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(2,2,'BA-CAL-02','Trắng vân mây vàng','Đá Thiêu Kết Calacatta & Khung Titan Mạ PVD',240.00,90.00,75.00,NULL,24900000.00,15,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(3,3,'BT-CAL-01','Vàng Champagne & Trắng','Đá Marble Calacatta & Khung Titan Mạ Vàng',90.00,90.00,45.00,NULL,11500000.00,18,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(4,4,'BT-WAL-02','Nâu gỗ óc chó','Gỗ Óc Chó FAS Tự Nhiên & Dầu Lau Hữu Cơ',75.00,75.00,42.00,NULL,8600000.00,12,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(5,5,'BLV-ATL-01','Gỗ óc chó tối màu','Gỗ Óc Chó FAS & Chân Kim Loại Sơn Tĩnh Điện',180.00,85.00,76.00,NULL,32000000.00,5,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(6,6,'BLV-PRO-02','Gỗ sồi tự nhiên','Mặt Gỗ Sồi Khối & Khung Động Cơ Điện Kép',140.00,70.00,118.00,NULL,12500000.00,20,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(7,7,'SF-TUS-01','Nâu da bò cổ điển','Da Bò Ý Thuộc Thảo Mộc & Khung Gỗ Thông Bắc Âu',260.00,98.00,82.00,NULL,68000000.00,6,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(8,8,'SF-BOU-02','Trắng kem Bouclé','Vải Len Bouclé & Đệm Lông Vũ Tự Nhiên',230.00,95.00,78.00,NULL,38500000.00,8,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(9,9,'ARM-OSA-01','Mây tự nhiên & Gỗ sồi','Mây Tự Nhiên & Gỗ Sồi Trắng Khối',78.00,82.00,85.00,NULL,14800000.00,14,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(10,10,'GA-NAP-01','Xám tro & Chân Vàng','Da Nappa Cao Cấp & Khung Thép Mạ PVD',52.00,55.00,84.00,NULL,4200000.00,32,1,'2026-10-09 22:24:23','2026-10-09 22:24:23');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty_months` smallint unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Bộ Bàn Ăn Hoàng Gia Elegance 8 Chỗ Mặt Đá','bo-ban-an-hoang-gia-elegance-8-cho-mat-da','Mặt đá Ceramic Nano tôi luyện nhiệt độ 1200°C chống xước vĩnh cửu và chân gỗ óc chó nguyên khối.','TK House',36,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(2,1,'Bàn Ăn Mở Rộng Thông Minh Calacatta Gold','ban-an-mo-rong-thong-minh-calacatta-gold','Bàn mở rộng thông minh với thanh trượt êm ái, mặt đá thiêu kết Calacatta sang trọng.','TK House',24,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(3,2,'Bàn Trà Đôi Mặt Đá Marble Calacatta Elegance','ban-tra-doi-mat-da-marble-calacatta-elegance','Sự kết hợp hoàn hảo giữa những đường vân mây Calacatta mềm mại và khung Titan mạ vàng sang trọng.','TK House',24,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(4,2,'Bàn Tròn Cà Phê Gỗ Óc Chó Nghệ Thuật','ban-tron-ca-phe-go-oc-cho-nghe-thuat','Thiết kế tinh xảo từ gỗ óc chó FAS tự nhiên và dầu lau hữu cơ an toàn cho gia đình.','TK House',24,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(5,3,'Bàn Làm Việc Giám Đốc Atelier Master Óc Chó','ban-lam-viec-giam-doc-atelier-master-oc-cho','Không gian nuôi dưỡng những quyết định lớn với hệ bàn gỗ nguyên tấm và tỉ lệ công thái học chuẩn mực.','TK House',36,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(6,3,'Bàn Làm Việc Nâng Hạ Thông Minh Pro Desk','ban-lam-viec-nang-ha-thong-minh-pro-desk','Động cơ nâng hạ êm ái, bộ nhớ 4 vị trí chiều cao, kết hợp mặt bàn gỗ tự nhiên thanh lịch.','TK House',24,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(7,5,'Sofa Da Thật Tuscany Thượng Hạng 3 Chỗ','sofa-da-that-tuscany-thuong-hang-3-cho','Da bò Ý thuộc thảo mộc tự nhiên 100%, càng dùng bề mặt càng đằm sâu và bóng mượt độc bản.','TK House',60,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(8,6,'Sofa Vải Dệt Bouclé Scandinavian Cloud','sofa-vai-det-boucle-scandinavian-cloud','Vải len Bouclé nhập khẩu ôm ấp mềm mại, đệm lông vũ 3 lớp thư giãn tuyệt đối.','TK House',36,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(9,7,'Ghế Armchair Mây Đan Mắt Cáo Thủ Công Osaka','ghe-armchair-may-dan-mat-cao-thu-cong-osaka','Mây đan mắt cáo thủ công truyền thống kết hợp khung gỗ sồi trắng mộc mạc phong cách Japandi.','TK House',24,1,'2026-10-09 22:24:23','2026-10-09 22:24:23'),(10,8,'Ghế Ăn Da Nappa Khung Kim Loại Mạ PVD','ghe-an-da-nappa-khung-kim-loai-ma-pvd','Đệm da Nappa êm dịu, lưng cong duyên dáng ôm trọn cơ thể cho trải nghiệm dùng bữa trọn vẹn.','TK House',24,1,'2026-10-09 22:24:23','2026-10-09 22:24:23');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('customer','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Quản Trị Viên',NULL,'admin@gmail.com','2026-10-09 22:24:23',NULL,'$2y$12$/dIZKZ/0grHsht3vTUPo2.GMHRgabYrqWOxYIO2o38uBpXYsUGb2i','0901234567','admin',1,NULL,'2026-10-09 22:24:23','2026-10-09 22:24:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10 12:24:28
