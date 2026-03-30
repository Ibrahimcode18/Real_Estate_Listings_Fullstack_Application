CREATE DATABASE  IF NOT EXISTS `realestate_listings` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `realestate_listings`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: realestate_listings
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `agency_name` varchar(16) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `license_number` varchar(32) NOT NULL,
  `about` varchar(128) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,1,'Elite Home','555-01999','RE-12345','Top seller in Australia',1,'2026-03-08 15:12:59'),(3,4,'Acme Real Estate','+1-555-0198','RE-12345-AB',NULL,1,'2026-03-23 00:31:32'),(4,5,'Ronaldo Agency','0903335567','4949-N484',NULL,1,'2026-03-25 19:42:44'),(5,6,'Fede Valverde','24434955555','ABCD333',NULL,0,'2026-03-28 21:15:22'),(6,3,'CR7 Properties','07805837000','AD-4445BE',NULL,1,'2026-03-30 12:57:05'),(11,14,'NewAgent','999999999999','BCD22344',NULL,0,'2026-03-30 19:47:50');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `city` varchar(100) NOT NULL,
  `image_url` varchar(128) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `city` (`city`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Liverpool','Nothinffornow','2026-03-08 15:04:28'),(2,'Birmingham','https://picsum.photos/300/200','2026-03-15 13:46:52'),(5,'Northampton','https://picsum.photos/300/200','2026-03-29 14:57:22'),(7,'Manchester','https://picsum.photos/300/200','2026-03-30 17:34:54');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` int NOT NULL,
  `location_id` int NOT NULL,
  `title` varchar(64) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `listing_type` enum('sale','rent') NOT NULL,
  `image_url` varchar(128) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `location_id` (`location_id`),
  KEY `properties_ibfk_1` (`agent_id`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (14,1,5,'Testing add properties','A problem is occuring with the update because of the price is a not of type number',50000.00,'sale','http://localhost:3000/api/v1/images/d4f9a6a3-3b5a-4b14-8cf8-7236ffc78eee.jpg','2026-03-29 15:18:38','2026-03-29 15:18:38'),(17,4,2,'Ronaldo Mansion','A mansion owned by the GOAT of football. 10 bedrooms, 1 master bedroom, 5 bathrooms, 3 living rooms.',380000.00,'sale','http://localhost:3000/api/v1/images/b5b88043-35e4-40d0-9259-e101f19f9e96.jpg','2026-03-30 16:20:55','2026-03-30 16:20:55'),(18,4,1,'Ronaldo Mansion2','A mansion owned by the GOAT of football. 10 bedrooms, 1 master bedroom, 5 bathrooms, 3 living rooms.',30000.00,'sale','http://localhost:3000/api/v1/images/20d65505-36c6-418b-8547-da506cbfed91.jpg','2026-03-30 16:21:46','2026-03-30 16:21:46'),(19,4,5,'Ensuite Room ','Student Room for 450 pounds a month. With all amenities provided including kitchen personal bathroom and study area',450.00,'rent','http://localhost:3000/api/v1/images/1eb37c70-1d73-4b6c-86c9-ce5dedd5088a.jpg','2026-03-30 16:23:46','2026-03-30 16:23:46'),(20,6,1,'Ronaldo Mansion3','The biggest mansion owned by the GOAT of football. 10 bedrooms, 1 master bedroom, 5 bathrooms, 3 living rooms.',50000.00,'sale','http://localhost:3000/api/v1/images/82609f8a-bff4-4339-ba8f-97ccfb763688.jpg','2026-03-30 16:27:21','2026-03-30 16:27:21'),(21,6,2,'Luxury Detached Villa','Incredible 5-bedroom home featuring a private pool, large double garage, and landscaped garden.',30000.00,'rent','http://localhost:3000/api/v1/images/67454512-6629-43e9-978f-48a94734945b.jpg','2026-03-30 16:29:50','2026-03-30 16:29:50'),(22,6,2,'Charming TownHouse','Newly renovated 3-bedroom townhouse near excellent local schools and parks.',500.00,'rent','http://localhost:3000/api/v1/images/b11580e3-bbef-43ed-b6db-70001e724614.jpg','2026-03-30 16:31:16','2026-03-30 16:31:16'),(23,6,5,'Beautiful Family Home','Spacious 3-bedroom detached house with a lovely backyard and modern kitchen.',500.00,'rent','http://localhost:3000/api/v1/images/3683f8a2-6dd5-4d3a-b8bd-4beb1cd89d10.jpg','2026-03-30 16:32:29','2026-03-30 16:32:29'),(24,6,2,'2-Bedroom Flat','A big bedroom',3400.00,'sale','http://localhost:3000/api/v1/images/4f863d03-4b5c-4e3d-acc2-856fe72d0bea.jpg','2026-03-30 17:35:53','2026-03-30 17:35:53');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `email` varchar(64) NOT NULL,
  `password` varchar(128) NOT NULL,
  `first_name` varchar(32) DEFAULT NULL,
  `last_name` varchar(32) DEFAULT NULL,
  `role` enum('user','agent','admin') DEFAULT 'user',
  `date_registered` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'janedoe','jane@elitehomes.com','$2b$10$Jad9zp96fwKuSdLE4npm/uVW0jcI1DN5BC.V6KF7eZoM0R2nUYLiq','Jane','Doe','agent','2026-03-08 15:10:00','2026-03-15 17:49:52'),(2,'bob','bob@test.com','$2b$10$pX/r6wQhOVwD5tiC4HqzVOn9O2NrSS0faUjbQ68NXzLcjlQyvYvYO',NULL,NULL,'user','2026-03-12 15:44:56','2026-03-12 15:44:56'),(3,'Ade','Bob2@gmail.com','$2b$10$dKFWI0jifrzthMowjQjvMOvFWRfovlmVod1QhItsB2H1TGD/Uf49y',NULL,NULL,'admin','2026-03-14 07:39:02','2026-03-30 17:49:18'),(4,'KylianMbappe','mbappe@gmail.com','$2b$10$BavlUrgAV7C2887k5ZqAfu4iRr.Kny9FmJ2Roihxa9EYnQOytRTmG','Kylian','Mbappe','agent','2026-03-23 00:18:45','2026-03-25 17:05:03'),(5,'Ronaldo','ronaldo@gmail.com','$2b$10$AN7mz.OMesSSE3q.8Rqn4uBdl6dtWOYtF46IMslSAPATlTNJ7l8FG',NULL,NULL,'agent','2026-03-25 19:36:11','2026-03-25 20:15:04'),(6,'fedeValverde','fedeValverde@gmail.com','$2b$10$VWWdYJJJfztb4Wkldzn3rOlxluMzoLs6IO/a7SJypnU69wD.iWK7q','Fede','Valverde','agent','2026-03-25 23:11:23','2026-03-29 17:58:59'),(14,'newuser','newuser@gmail.com','$2b$10$5HBqTpbOVePzkv0mNzWKPeX6vJJm8Laztto1ewssT3mTzzLJ2Y4Gy',NULL,NULL,'agent','2026-03-30 19:46:39','2026-03-30 20:01:46');
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

-- Dump completed on 2026-03-30 21:51:23
