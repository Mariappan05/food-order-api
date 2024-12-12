-- MySQL dump 10.13  Distrib 9.0.1, for Win64 (x86_64)
--
-- Host: localhost    Database: food_order
-- ------------------------------------------------------
-- Server version	9.0.1

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
-- Table structure for table `fooditems`
--

DROP TABLE IF EXISTS `fooditems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fooditems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fooditems`
--

LOCK TABLES `fooditems` WRITE;
/*!40000 ALTER TABLE `fooditems` DISABLE KEYS */;
INSERT INTO `fooditems` VALUES (1,'Rice',45.00,'https://www.health.com/thmb/AcaOIOijkWe2IaNA13jnRHlMPuM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/GettyImages-1734160670-0157c2daf8e841d6a783b38aedc51aa8.jpg'),(2,'Basmathi Rice',55.00,'https://st4.depositphotos.com/2894907/19801/i/600/depositphotos_198015568-stock-photo-white-rice-in-bowl.jpg'),(3,'Fish',150.00,'https://images.pexels.com/photos/11121793/pexels-photo-11121793.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),(4,'Hen',270.00,'https://img.freepik.com/free-photo/hen-looking-food-farmyard_23-2148315304.jpg?t=st=1730984223~exp=1730987823~hmac=39b72159efe055e4ac6b30758a6f5a4fd6dce909fc041bab2216cf176c8f48ba&w=740'),(5,'Boiler Hen',180.00,'https://img.freepik.com/free-photo/close-up-chicken-pen_23-2148214267.jpg?t=st=1730984123~exp=1730987723~hmac=b2f59dc40a01e5612a4b74b37258658c9da5f3fe167519cadb5391e929154cd1&w=360');
/*!40000 ALTER TABLE `fooditems` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-12 19:55:20
