CREATE DATABASE  IF NOT EXISTS `tms` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tms`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: tms
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_no` varchar(45) NOT NULL,
  `pickup_locations_id` int NOT NULL,
  `pickup_date_time` datetime NOT NULL,
  `delivery_locations_id` int NOT NULL,
  `delivery_date_time` datetime NOT NULL,
  `distance` varchar(50) NOT NULL,
  `note` text,
  `customer_id` int NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deletd_user_id` int DEFAULT NULL,
  `booking_status_id` int NOT NULL,
  `vehicle_type_id` int NOT NULL,
  `vehicle_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `assigned_user_id` int DEFAULT NULL,
  `assigned_date_time` datetime DEFAULT NULL,
  `strat_meter_reading` varchar(100) DEFAULT NULL,
  `end_meter_reading` varchar(100) DEFAULT NULL,
  `acutual_start_datetime` datetime DEFAULT NULL,
  `acutual_end_time` datetime DEFAULT NULL,
  `booking_contact_person_name` varchar(100) DEFAULT NULL,
  `booking_contact_person_mobileno` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_booking_customer1_idx` (`customer_id`),
  KEY `fk_booking_booking_status1_idx` (`booking_status_id`),
  KEY `fk_booking_vehicle_type1_idx` (`vehicle_type_id`),
  KEY `fk_booking_vehicle1_idx` (`vehicle_id`),
  KEY `fk_booking_driver1_idx` (`driver_id`),
  KEY `fk_booking_pickup_locations1_idx` (`pickup_locations_id`),
  KEY `fk_booking_delivery_locations1_idx` (`delivery_locations_id`),
  CONSTRAINT `fk_booking_booking_status1` FOREIGN KEY (`booking_status_id`) REFERENCES `booking_status` (`id`),
  CONSTRAINT `fk_booking_customer1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`),
  CONSTRAINT `fk_booking_delivery_locations1` FOREIGN KEY (`delivery_locations_id`) REFERENCES `delivery_locations` (`id`),
  CONSTRAINT `fk_booking_driver1` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`id`),
  CONSTRAINT `fk_booking_pickup_locations1` FOREIGN KEY (`pickup_locations_id`) REFERENCES `pickup_locations` (`id`),
  CONSTRAINT `fk_booking_vehicle1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`id`),
  CONSTRAINT `fk_booking_vehicle_type1` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
INSERT INTO `booking` VALUES (3,'CFC2500003',1,'2025-03-21 05:10:00',3,'2025-03-21 06:10:00','43.60',NULL,1,'2025-03-21 02:10:21',NULL,'2025-04-04 23:09:51',10,NULL,10,7,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Chanuka Ishan','0775412478'),(4,'CFC2500004',1,'2025-04-01 12:46:00',1,'2025-04-01 23:47:00','193.21',NULL,1,'2025-04-01 23:46:24',NULL,'2025-04-04 23:17:02',10,NULL,10,7,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Nalin De Silva','0778598789'),(5,'CFC2500005',1,'2025-04-01 12:47:00',1,'2025-04-01 23:52:00','193.21',NULL,1,'2025-04-01 23:48:24','2025-04-04 23:04:58',NULL,10,10,NULL,1,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Nalin De Silva','0778598789'),(6,'CFC2500006',1,'2025-04-02 12:06:00',1,'2025-04-02 02:05:00','196.28',NULL,1,'2025-04-02 00:06:08',NULL,NULL,10,NULL,NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Nalin De Silva','0778598789'),(7,'CFC2500007',1,'2025-04-02 01:27:00',3,'2025-04-02 00:30:00','341.30',NULL,1,'2025-04-02 00:28:08',NULL,NULL,10,NULL,NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Nalin De Silva','0778598789'),(8,'CFC2500008',1,'2025-04-05 12:28:00',1,'2025-04-02 00:30:00','198.06',NULL,1,'2025-04-02 00:29:15','2025-04-04 23:06:09',NULL,10,10,NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Nalin De Silva','0778598789'),(9,'CFC2500009',1,'2025-04-02 06:59:00',1,'2025-04-03 07:00:00','197.00',NULL,1,'2025-04-02 17:58:39','2025-04-04 23:05:42',NULL,10,10,NULL,1,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Nalin De Silva','0778598789');
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_has_location`
--

DROP TABLE IF EXISTS `booking_has_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_has_location` (
  `booking_id` int NOT NULL,
  `location_id` int NOT NULL,
  PRIMARY KEY (`booking_id`,`location_id`),
  KEY `fk_booking_has_location_location1_idx` (`location_id`),
  KEY `fk_booking_has_location_booking1_idx` (`booking_id`),
  CONSTRAINT `fk_booking_has_location_booking1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`),
  CONSTRAINT `fk_booking_has_location_location1` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_has_location`
--

LOCK TABLES `booking_has_location` WRITE;
/*!40000 ALTER TABLE `booking_has_location` DISABLE KEYS */;
INSERT INTO `booking_has_location` VALUES (7,10),(8,12),(8,13),(9,13),(8,14),(9,14);
/*!40000 ALTER TABLE `booking_has_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_status`
--

DROP TABLE IF EXISTS `booking_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_status`
--

LOCK TABLES `booking_status` WRITE;
/*!40000 ALTER TABLE `booking_status` DISABLE KEYS */;
INSERT INTO `booking_status` VALUES (1,'Inproccess'),(2,'Attend'),(3,'Arrived At Pickup'),(4,'Departed From Pickup'),(5,'Arrived At Delivery'),(6,'Departed From Delivery'),(7,'Cancelled');
/*!40000 ALTER TABLE `booking_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_type`
--

DROP TABLE IF EXISTS `business_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_type`
--

LOCK TABLES `business_type` WRITE;
/*!40000 ALTER TABLE `business_type` DISABLE KEYS */;
INSERT INTO `business_type` VALUES (1,'WareHouse'),(2,'Retail'),(3,'Courier Services'),(4,'Manufacture');
/*!40000 ALTER TABLE `business_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(100) NOT NULL,
  `direct_telephone_no` varchar(10) NOT NULL,
  `direct_email_no` char(100) NOT NULL,
  `contact_person_fullname` varchar(250) NOT NULL,
  `contact_person_email` varchar(150) NOT NULL,
  `contact_person_mobileno` varchar(45) NOT NULL,
  `company_address` varchar(45) NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` varchar(45) NOT NULL,
  `updated_user_id` varchar(45) DEFAULT NULL,
  `deleted_user_id` varchar(45) DEFAULT NULL,
  `customer_status_id` int NOT NULL,
  `customer_reg_no` varchar(10) NOT NULL,
  `business_type_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_reg_no_UNIQUE` (`customer_reg_no`),
  KEY `fk_customer_customer_status1_idx` (`customer_status_id`),
  KEY `fk_customer_business_type1_idx` (`business_type_id`),
  CONSTRAINT `fk_customer_business_type1` FOREIGN KEY (`business_type_id`) REFERENCES `business_type` (`id`),
  CONSTRAINT `fk_customer_customer_status1` FOREIGN KEY (`customer_status_id`) REFERENCES `customer_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Cargils Foot City','0117474747','cargils@gmail.com','Nalin De Silva','nalin@gmail.com','0778598789','No 223 Colombo 4','2025-02-20 17:16:44',NULL,NULL,'1',NULL,NULL,1,'CUS00001',1),(2,'I M L Dilivery','0112145871','iml@gmail.com','Ramesh Perera','ramesh@gmail.com','0775213347','No 123 Colombo 09','2025-04-02 18:01:22',NULL,'2025-02-23 23:28:27','10',NULL,'10',1,'CUS00002',3),(3,'Brandex','0112451257','brandex@gmail.com','Chanuka Ishan','chanuka@gmail.com','0775412478','No 541 Awissawella','2025-03-06 14:05:10',NULL,NULL,'10',NULL,NULL,1,'CUS00006',2),(6,'Sitrek','0112145879','sitrek@gmail.com','Nasni','nasni@gmail.com','0775412474','No 154 Boralla','2025-02-23 23:52:11',NULL,NULL,'10',NULL,NULL,1,'CUS00004',3),(7,'Soso','0112453684','soso@gmail.com','Deshan Munaweera','deshan@gmail.com','0775489567','No 456 Wattala','2025-02-24 00:52:32',NULL,NULL,'10',NULL,NULL,1,'CUS00005',4),(8,'Fit','0117474747','pramodr@gmail.com','Nalin De Silva','aaaa@gmail.com','0778589654','No 1232 Negombo Perera','2025-03-05 22:13:45',NULL,'2025-03-05 22:14:01','10',NULL,'10',3,'CUS00007',1),(9,'Keels','0112487456','keels@gmail.com','Deshan Perera','deshan@gmail.com','0784125412','No. 11 York Street Colombo Sri Lanka','2025-03-21 14:50:04',NULL,NULL,'10',NULL,NULL,1,'CUS00008',1);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_agreement`
--

DROP TABLE IF EXISTS `customer_agreement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_agreement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agreement_date` date NOT NULL,
  `agreement_period` varchar(45) NOT NULL,
  `agreement_end_date` date NOT NULL,
  `delivery_frequency` varchar(45) NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `agreement_charge` decimal(10,2) DEFAULT NULL,
  `additional_charge` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `total_distance` decimal(10,3) DEFAULT NULL,
  `customer_agreement_status_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `vehicle_type_id` int NOT NULL,
  `package_id` int NOT NULL,
  `cus_agreement_no` char(8) DEFAULT NULL,
  `special_note` varchar(400) DEFAULT NULL,
  `approval_note` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cus_agreement_no_UNIQUE` (`cus_agreement_no`),
  KEY `fk_customer_agreement_customer_agreement_status1_idx` (`customer_agreement_status_id`),
  KEY `fk_customer_agreement_customer1_idx` (`customer_id`),
  KEY `fk_customer_agreement_vehicle_type1_idx` (`vehicle_type_id`),
  KEY `fk_customer_agreement_package1_idx` (`package_id`),
  CONSTRAINT `fk_customer_agreement_customer1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`),
  CONSTRAINT `fk_customer_agreement_customer_agreement_status1` FOREIGN KEY (`customer_agreement_status_id`) REFERENCES `customer_agreement_status` (`id`),
  CONSTRAINT `fk_customer_agreement_package1` FOREIGN KEY (`package_id`) REFERENCES `package` (`id`),
  CONSTRAINT `fk_customer_agreement_vehicle_type1` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_agreement`
--

LOCK TABLES `customer_agreement` WRITE;
/*!40000 ALTER TABLE `customer_agreement` DISABLE KEYS */;
INSERT INTO `customer_agreement` VALUES (1,'2024-03-24','06 months','2024-09-24','Weekly','2025-02-20 17:16:44','2025-03-08 15:14:39','2025-03-08 15:29:17',10,10,10,2000.00,1500.00,10000.00,1.000,4,1,1,1,'AGR00001','existing Customer','Approved'),(3,'2024-10-24','12 months','2025-10-24','Weekly','2025-02-20 17:16:44','2025-03-08 10:04:33',NULL,10,10,NULL,1500.00,1000.00,1000.00,3000.000,2,2,2,50,'AGR00002','Existing Custome','Aprroved'),(4,'2024-10-24','24 months','2026-10-24','Monthly','2025-02-20 17:16:44',NULL,NULL,10,NULL,NULL,1500.00,1000.00,1000.00,3000.000,2,6,3,53,'AGR00003','Existing Customer','Aprroved'),(5,'2025-03-01','12 months','2026-03-01','Daily','2025-03-05 23:22:12','2025-03-28 16:46:41','2025-03-06 22:30:21',10,10,10,NULL,NULL,NULL,NULL,2,1,3,53,'AGR00004','',NULL),(6,'2023-02-05','60 months','2028-02-05','Daily','2025-03-05 23:24:03','2025-03-21 13:54:28','2025-03-06 22:30:10',10,10,10,NULL,NULL,NULL,NULL,2,6,7,49,'AGR00005','Changed','Approved'),(7,'2025-03-01','06 months','2025-03-01','Daily','2025-03-06 11:58:31','2025-03-30 12:11:54','2025-03-08 15:29:04',10,10,10,NULL,NULL,NULL,NULL,1,1,1,50,'AGR00006','Existing cutomer','Reject'),(8,'2025-03-01','06 months','2025-03-01','Daily','2025-03-06 11:59:49','2025-03-08 10:14:46',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,1,2,44,'AGR00007','Existing Custome','Aprroved'),(9,'2025-03-01','06 months','2025-03-01','Daily','2025-03-06 12:00:44','2025-03-08 14:04:25',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,1,4,46,'AGR00008','','aaa'),(10,'2025-03-01','06 months','2025-03-01','Daily','2025-03-06 12:01:04','2025-03-08 14:05:22',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,1,1,51,'AGR00009','','Approved'),(11,'2025-03-01','06 months','2025-03-01','Daily','2025-03-06 12:01:18','2025-03-08 14:24:19',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,1,5,47,'AGR00010','Package change to flaoting Rate','Approved'),(12,'2025-03-01','06 months','2025-06-01','Daily','2025-03-06 12:19:16','2025-03-08 14:32:58',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,7,1,1,'AGR00011','aaaa','Approved'),(13,'2025-03-01','06 months','2025-03-01','Daily','2025-03-06 20:16:36','2025-03-08 10:05:06',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,1,3,45,'AGR00012','Existing Custome','Aprroved'),(14,'2025-03-13','06 months','2025-03-28','Daily','2025-03-08 12:11:39','2025-03-08 14:11:58',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,6,3,45,'AGR00013','Exiting Customer','Aprroved'),(15,'2024-08-15','12 months','2025-08-15','Daily','2025-03-08 14:35:51','2025-03-08 14:36:13',NULL,10,10,NULL,2500.00,1500.00,NULL,NULL,2,6,2,55,'AGR00014','Existing Customer','Approved'),(16,'2025-03-01','06 months','2025-11-01','Daily','2025-03-08 15:13:02','2025-03-08 15:13:37',NULL,10,10,NULL,NULL,NULL,NULL,NULL,2,3,4,46,'AGR00015','Existing Customer','Approved');
/*!40000 ALTER TABLE `customer_agreement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_agreement_status`
--

DROP TABLE IF EXISTS `customer_agreement_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_agreement_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_agreement_status`
--

LOCK TABLES `customer_agreement_status` WRITE;
/*!40000 ALTER TABLE `customer_agreement_status` DISABLE KEYS */;
INSERT INTO `customer_agreement_status` VALUES (1,'Pending'),(2,'Approved'),(3,'Expired'),(4,'Deleted'),(5,'Reject');
/*!40000 ALTER TABLE `customer_agreement_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_payment`
--

DROP TABLE IF EXISTS `customer_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_no` char(10) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `due_amount` decimal(10,2) NOT NULL,
  `current_payment` decimal(10,2) NOT NULL,
  `method` varchar(45) NOT NULL,
  `added_datetime` datetime NOT NULL,
  `added_user_id` int NOT NULL,
  `balance_amount` decimal(10,2) NOT NULL,
  `customer_agreement_id` int NOT NULL,
  `customer_agreement_id1` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_customer_payment_customer_agreement1_idx` (`customer_agreement_id1`),
  CONSTRAINT `fk_customer_payment_customer_agreement1` FOREIGN KEY (`customer_agreement_id1`) REFERENCES `customer_agreement` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_payment`
--

LOCK TABLES `customer_payment` WRITE;
/*!40000 ALTER TABLE `customer_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_status`
--

DROP TABLE IF EXISTS `customer_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_status`
--

LOCK TABLES `customer_status` WRITE;
/*!40000 ALTER TABLE `customer_status` DISABLE KEYS */;
INSERT INTO `customer_status` VALUES (1,'Active'),(2,'Inactive'),(3,'Deleted');
/*!40000 ALTER TABLE `customer_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_locations`
--

DROP TABLE IF EXISTS `delivery_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(450) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `customer_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_delivery_locations_customer1_idx` (`customer_id`),
  CONSTRAINT `fk_delivery_locations_customer1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_locations`
--

LOCK TABLES `delivery_locations` WRITE;
/*!40000 ALTER TABLE `delivery_locations` DISABLE KEYS */;
INSERT INTO `delivery_locations` VALUES (1,'Cargills Food City - Walgama','19, 35 Samagi Mawatha, Matara 81000, Sri Lanka',1),(2,'Cargills Food City - Jaffna','No 420 Hospital Rd, Jaffna 40000, Sri Lanka',1),(3,'Cargills Food City Express Iconic Residence','No39 Perera Mawatha, Sri Jayawardenepura Kotte, Sri Lanka',1);
/*!40000 ALTER TABLE `delivery_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Managment'),(2,'Operation');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `designation`
--

DROP TABLE IF EXISTS `designation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `roleid` int DEFAULT NULL,
  `useraccount` tinyint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `designation`
--

LOCK TABLES `designation` WRITE;
/*!40000 ALTER TABLE `designation` DISABLE KEYS */;
INSERT INTO `designation` VALUES (1,'Manager',1,1),(2,'Supervisor',2,1),(3,'Coordinator',3,1);
/*!40000 ALTER TABLE `designation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_reg_no` varchar(45) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `callingname` varchar(45) NOT NULL,
  `nic` varchar(45) NOT NULL,
  `driving_license_no` varchar(45) NOT NULL,
  `driving_license_expire_date` date NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `mobileno` varchar(45) NOT NULL,
  `supplier_id` int NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `driver_status_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobileno_UNIQUE` (`mobileno`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  KEY `fk_driver_supplier1_idx` (`supplier_id`),
  KEY `fk_driver_driver_status1_idx` (`driver_status_id`),
  CONSTRAINT `fk_driver_driver_status1` FOREIGN KEY (`driver_status_id`) REFERENCES `driver_status` (`id`),
  CONSTRAINT `fk_driver_supplier1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver`
--

LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` VALUES (1,'00000001','Jayamal Perera','Perera','200108401750','B52147845','2021-03-24','perera@gmail,com','0775213344',1,'2025-02-20 17:16:44','2025-02-20 17:16:44','2025-03-02 21:32:23',10,NULL,10,3),(2,'00000002','Denuwan Prabath','Prabath','200105478123','B2154125','2025-03-01','denu@gmail.com','0775213345',9,'2025-03-01 21:45:22',NULL,NULL,10,NULL,NULL,1),(3,'00000003','Deshan Vimukthi','Deshan','200108401759','B2154127','2025-03-13','deshu@gmail.com','0778457129',8,'2025-03-01 21:46:37','2025-03-01 22:51:23',NULL,10,10,NULL,1),(4,'00000004','Isuru Udayanga','Udayanga','200108401758','B4512547','2025-03-13','aaaaasela@gmail.com','0775213347',8,'2025-03-01 22:27:50','2025-03-01 22:50:21',NULL,10,10,NULL,1),(5,'00000005','Asitha Sampath','Asitha','200105478412','B4562133','2025-03-24','asitha@gmail.com','0785424123',12,'2025-03-02 21:11:47',NULL,NULL,10,NULL,NULL,1),(6,'00000006','Ashvin Viduraka','Ashvin','765771738V','B2512415','2025-03-19','ashvin@gmail.com','0775213340',11,'2025-03-02 23:09:26',NULL,NULL,10,NULL,NULL,1),(7,'00000007','Wihara Perera','Perera','200108401757','B2512498','2025-03-14','wihara@gmail.com','0748124571',2,'2025-03-03 01:02:43',NULL,NULL,10,NULL,NULL,1),(8,'00000008','Ishara Perera','Ishara','200108401787','B2154198','2025-03-06','ishara@gmail.com','0775213300',6,'2025-03-04 20:25:20',NULL,NULL,10,NULL,NULL,1);
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_status`
--

DROP TABLE IF EXISTS `driver_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_status`
--

LOCK TABLES `driver_status` WRITE;
/*!40000 ALTER TABLE `driver_status` DISABLE KEYS */;
INSERT INTO `driver_status` VALUES (1,'Active'),(2,'Inactive'),(3,'Deleted');
/*!40000 ALTER TABLE `driver_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(250) NOT NULL,
  `callingname` varchar(45) NOT NULL,
  `address` varchar(300) NOT NULL,
  `nic` varchar(45) NOT NULL,
  `civil_status` varchar(45) NOT NULL,
  `dateofbirth` date NOT NULL,
  `gender` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `mobileno` varchar(10) NOT NULL,
  `join_date` date NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `employee_status_id` int NOT NULL,
  `department_id` int NOT NULL,
  `designation_id` int NOT NULL,
  `emp_no` varchar(8) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  KEY `fk_employee_employee_status1_idx` (`employee_status_id`),
  KEY `fk_employee_department1_idx` (`department_id`),
  KEY `fk_employee_designation1_idx` (`designation_id`),
  CONSTRAINT `fk_employee_department1` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`),
  CONSTRAINT `fk_employee_designation1` FOREIGN KEY (`designation_id`) REFERENCES `designation` (`id`),
  CONSTRAINT `fk_employee_employee_status1` FOREIGN KEY (`employee_status_id`) REFERENCES `employee_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (12,'Pramod Ravisanka','Ravisanka','No 102 Udugampola Gampaha','200108401750','single','2001-03-24','Male','pramod@gmail.com','0775213344','2025-01-01','2025-02-20 17:16:44','2025-02-28 17:31:43','2025-02-22 23:44:10',1,10,1,4,1,1,'00000001'),(22,'Amith Krishan','Amith','No 102 Udugampola Gampaha','200108401758','single','2022-07-10','Male','amith@gmail.com','0777876493','2025-03-01','2025-03-10 12:16:47',NULL,NULL,10,NULL,NULL,2,1,1,'00000002'),(23,'Ishara Rajitha','Rajitha','No Paris Perera Mawatha','200108401757','married','2025-03-07','Male','isuru@gmail.com','0778547963','2025-03-06','2025-03-10 16:00:55',NULL,NULL,10,NULL,NULL,2,2,3,'00000003'),(24,'Achini Ruvishani','Ruvishani','No 446 Paris Perera Mawatha Jaela','200573401004','single','2005-08-21','Female','achiniruvishani009@gmail.com','0774582136','2025-03-01','2025-03-15 20:17:37',NULL,NULL,10,NULL,NULL,2,1,1,'00000004');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_status`
--

DROP TABLE IF EXISTS `employee_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_status`
--

LOCK TABLES `employee_status` WRITE;
/*!40000 ALTER TABLE `employee_status` DISABLE KEYS */;
INSERT INTO `employee_status` VALUES (2,'Confirm'),(3,'Resign'),(4,'Deleted');
/*!40000 ALTER TABLE `employee_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `address` varchar(500) NOT NULL,
  `customer_id` int NOT NULL,
  `added_user_id` int NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_location_customer1_idx` (`customer_id`),
  CONSTRAINT `fk_location_customer1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (10,'Cargills Food City - Walgama','19, 35 Samagi Mawatha, Matara 81000, Sri Lanka',1,10,'2025-03-30 11:46:54',NULL,NULL,NULL,NULL),(11,'Cargills Food City - Jaffna','No 420 Hospital Rd, Jaffna 40000, Sri Lanka',1,10,'2025-03-30 11:47:09',NULL,NULL,NULL,NULL),(12,'Cargills Food City Express Iconic Residence','No39 Perera Mawatha, Sri Jayawardenepura Kotte, Sri Lanka',1,10,'2025-03-30 12:15:35',NULL,NULL,NULL,NULL),(13,'Cargills Food City - Rajagiriya 03','502 Nawala Rd, Sri Jayawardenepura Kotte 11222, Sri Lanka',1,10,'2025-03-30 12:15:47',NULL,NULL,NULL,NULL),(14,'Cargills Food City – Rajagiriya 02','395, Sri Jayawardanapura Mw, Welikada Terrace, Rajagiriya, Sri Lanka',1,10,'2025-03-30 12:16:01',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module`
--

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES (1,'User'),(2,'Privilage'),(3,'Employee'),(4,'Payment'),(5,'Location');
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package`
--

DROP TABLE IF EXISTS `package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `distance` decimal(10,3) NOT NULL,
  `additinal_km_charge_cus` decimal(10,2) NOT NULL,
  `additinal_km_charge_sup` decimal(10,2) NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `vehicle_type_id` int NOT NULL,
  `package_status_id` int NOT NULL,
  `package_charge_cus` decimal(10,2) NOT NULL,
  `package_charge_sup` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_packge_vehicle_type1_idx` (`vehicle_type_id`),
  KEY `fk_packge_package_status1_idx` (`package_status_id`),
  CONSTRAINT `fk_packge_package_status1` FOREIGN KEY (`package_status_id`) REFERENCES `package_status` (`id`),
  CONSTRAINT `fk_packge_vehicle_type1` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package`
--

LOCK TABLES `package` WRITE;
/*!40000 ALTER TABLE `package` DISABLE KEYS */;
INSERT INTO `package` VALUES (1,'Floating rate',1.000,50.00,30.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,1,1,89.00,69.00),(44,'Floating rate',1.000,50.00,30.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,2,1,109.00,79.00),(45,'Floating rate',1.000,60.00,40.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,3,1,119.00,99.00),(46,'Floating rate',1.000,60.00,40.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,4,1,129.00,109.00),(47,'Floating rate',1.000,60.00,40.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,5,1,139.00,119.00),(48,'Floating rate',1.000,60.00,40.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,6,1,159.00,139.00),(49,'Floating rate',1.000,80.00,60.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,7,1,189.00,159.00),(50,'Fix Rate - 2500km',2500.000,60.00,40.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,1,1,290000.00,250000.00),(51,'Fix Rate - 3000km',3000.000,60.00,40.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,1,1,310000.00,270000.00),(52,'Fix Rate - 3500km',3500.000,60.00,40.00,'2025-02-22 23:57:05',NULL,NULL,10,NULL,NULL,1,1,320000.00,290000.00),(53,'Fix Rate - 4000km',4000.000,60.00,40.00,'2025-02-22 23:57:05',NULL,'2025-03-06 22:13:23',10,NULL,10,1,3,340000.00,310000.00),(55,'Fix Rate - 2500km',2500.000,50.00,40.00,'2025-03-06 21:24:30','2025-03-06 22:05:46','2025-03-06 22:11:50',10,10,10,2,3,210000.00,190000.00);
/*!40000 ALTER TABLE `package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_status`
--

DROP TABLE IF EXISTS `package_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_status`
--

LOCK TABLES `package_status` WRITE;
/*!40000 ALTER TABLE `package_status` DISABLE KEYS */;
INSERT INTO `package_status` VALUES (1,'Active'),(2,'Inactive'),(3,'Deleted');
/*!40000 ALTER TABLE `package_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pickup_locations`
--

DROP TABLE IF EXISTS `pickup_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickup_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(450) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `customer_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pickup_locations_customer1_idx` (`customer_id`),
  CONSTRAINT `fk_pickup_locations_customer1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pickup_locations`
--

LOCK TABLES `pickup_locations` WRITE;
/*!40000 ALTER TABLE `pickup_locations` DISABLE KEYS */;
INSERT INTO `pickup_locations` VALUES (1,'Cargills Distribution Centre','6WH6+QM7, Negombo - Mirigama Rd, Miriswatte, Sri Lanka',1);
/*!40000 ALTER TABLE `pickup_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `privilage`
--

DROP TABLE IF EXISTS `privilage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `privilage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `privi_select` varchar(45) NOT NULL,
  `privi_insert` varchar(45) NOT NULL,
  `privi_update` varchar(45) NOT NULL,
  `privi_delete` varchar(45) NOT NULL,
  `role_id` int NOT NULL,
  `module_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_privilage_role1_idx` (`role_id`),
  KEY `fk_privilage_module1_idx` (`module_id`),
  CONSTRAINT `fk_privilage_module1` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`),
  CONSTRAINT `fk_privilage_role1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `privilage`
--

LOCK TABLES `privilage` WRITE;
/*!40000 ALTER TABLE `privilage` DISABLE KEYS */;
INSERT INTO `privilage` VALUES (13,'1','1','1','0',1,1),(14,'1','1','1','0',1,3),(15,'1','1','1','1',1,4),(16,'1','1','1','1',1,2),(17,'1','1','0','0',2,1),(18,'1','0','0','0',2,2),(19,'1','1','0','0',2,3),(20,'1','0','0','0',2,4),(21,'0','0','0','0',3,1),(22,'0','0','0','0',3,2),(23,'0','0','0','0',3,3),(24,'1','0','0','0',3,4);
/*!40000 ALTER TABLE `privilage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Manager'),(2,'Supervisor'),(3,'Coordinator'),(4,'Admin');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) NOT NULL,
  `callingname` varchar(45) NOT NULL,
  `address` varchar(250) DEFAULT NULL,
  `nic` varchar(12) NOT NULL,
  `driving_licence_no` varchar(45) DEFAULT NULL,
  `driving_licencen_expiredate` date DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `mobileno` varchar(10) NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `bank_name` varchar(45) NOT NULL,
  `branch_name` varchar(45) NOT NULL,
  `account_no` varchar(45) NOT NULL,
  `account_holder_name` varchar(45) NOT NULL,
  `driving_status` tinyint NOT NULL,
  `supplier_status_id` int NOT NULL,
  `transportname` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `mobileno_UNIQUE` (`mobileno`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `transportname_UNIQUE` (`transportname`),
  KEY `fk_supplier_supplier_status1_idx` (`supplier_status_id`),
  CONSTRAINT `fk_supplier_supplier_status1` FOREIGN KEY (`supplier_status_id`) REFERENCES `supplier_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES (1,'Madushan Perera','Madushan','No 123 Colombo','200308401750','B52033972','2029-03-24','madushan@gmail.com','0775213345','2024-12-24 15:13:45',NULL,'2025-02-27 21:51:28',10,NULL,10,'Bank Of Ceylon','Gampaha','0112541247812','Madushan Perera',1,3,'Madusha Transport'),(2,'Amith Krishan','Amiuth','No 123 Colombo','200105874512','B52147893','2024-09-24','amith@gmail.com','0775214478','2024-12-24 15:13:45',NULL,'2025-02-27 23:14:11',10,NULL,10,'Bank Of Ceylon','Gampaha','0112541247817','Amith Krishan',1,3,'AM Transport'),(3,'Amith Krishan','','No 123','200108401750','B5207859','2025-02-01','pramod@gmail.com','0775133544','2025-02-28 12:41:53',NULL,NULL,10,NULL,NULL,'Bank Of Ceylon','Ragama','21984918','Amith Krishan',1,1,'Amith Transport'),(4,'Ishara Sheron','','No 123 Kadawatha','200108457125','B1245124','2025-02-13','ishara@gmail.com','0775213445','2025-02-28 12:48:32',NULL,NULL,10,NULL,NULL,'NSB Bank','Colombo','0112457812456','Ishara Sheron',0,1,'Ishara Transport'),(5,'Deshan Perara','','No 123 Colombo','200108401754','B5207859','2025-02-15','deshan@gmail.com','0775245789','2025-02-28 13:00:38',NULL,NULL,10,NULL,NULL,'Seylan Bank','Jaela','12245124785','Deshan Peraera',0,1,'Denu Transport'),(6,'Nihal Senanayaka','','No 123 Werhara','200108401755','B1245129','2025-02-13','nial@gmail.com','0775133541','2025-02-28 13:08:00',NULL,NULL,10,NULL,NULL,'DFCC Bank','Kandana','112021425412','Nihal Senanayaka',1,1,'Nihal Transport'),(7,'Vimukthi Shehan','Shehan','No 123','200108401752','B5207814','2025-01-29','ravu@gmail.com','0775874581','2025-02-28 17:54:47',NULL,NULL,10,NULL,NULL,'People\'s Bank','Colombo','21984918','Vimukthi Shehan',1,1,'VM Transport'),(8,'Isuru Udanaaa','Isuru','No 123 Colombo','200108401787','B5207841','2025-02-07','ravu78@gmail.com','0775874501','2025-02-28 18:06:50','2025-02-28 22:16:35',NULL,10,10,NULL,'Seylan Bank','Ragama','06515616123165654','Amith Krishanass',1,2,'Udana Transport'),(9,'Ishara Sheron','Ishara','No 123 Ampara','200124514781',NULL,NULL,'kasun@gmail.com','0775214589','2025-02-28 22:35:19',NULL,NULL,10,NULL,NULL,'DFCC Bank','Ampara','1213181651168','Ishara Sheron',0,1,'IS transport'),(10,'Akash Perera','Akash','No 123','200145478453','B4578458','2025-03-07','akash@gmail.com','0784578457','2025-03-01 22:23:26',NULL,NULL,10,NULL,NULL,'Amana Bank','Wattala','012458787','Akash Perera',1,1,'Akash Transport'),(11,'Nuwan Bandara','Bandara','No 564 Gamapaha','199752145522','B4512365','2025-03-20','nuwan@gmail.com','0775845123','2025-03-02 20:57:48',NULL,NULL,10,NULL,NULL,'Amana Bank','Ragama','20145632148458','Nuwan Bnadara',0,1,'Nuwan Transport'),(12,'Asitha Sampath','Asitha','No 123 Yakkala','200105478412','B4562133','2025-03-24','asitha@gmail.com','0785424123','2025-03-02 21:11:48',NULL,NULL,10,NULL,NULL,'Bank Of Ceylon','Ragama','06151981484','Asitha Sampath',1,1,'Asitha Transport');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_agreement`
--

DROP TABLE IF EXISTS `supplier_agreement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_agreement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agreement_date` date NOT NULL,
  `agreement_period` varchar(45) NOT NULL,
  `agreement_end_date` date NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `agreement_charge` decimal(10,2) DEFAULT NULL,
  `additional_charge` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `supplier_id` int NOT NULL,
  `supplier_agreement_status_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  `package_id` int NOT NULL,
  `sup_agreement_no` char(8) NOT NULL,
  `special_note` varchar(500) DEFAULT NULL,
  `approval_note` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agreement_no_UNIQUE` (`sup_agreement_no`),
  KEY `fk_supplier_agreement_supplier1_idx` (`supplier_id`),
  KEY `fk_supplier_agreement_supplier_agreement_status1_idx` (`supplier_agreement_status_id`),
  KEY `fk_supplier_agreement_vehicle1_idx` (`vehicle_id`),
  KEY `fk_supplier_agreement_package1_idx` (`package_id`),
  CONSTRAINT `fk_supplier_agreement_package1` FOREIGN KEY (`package_id`) REFERENCES `package` (`id`),
  CONSTRAINT `fk_supplier_agreement_supplier1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`),
  CONSTRAINT `fk_supplier_agreement_supplier_agreement_status1` FOREIGN KEY (`supplier_agreement_status_id`) REFERENCES `supplier_agreement_status` (`id`),
  CONSTRAINT `fk_supplier_agreement_vehicle1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_agreement`
--

LOCK TABLES `supplier_agreement` WRITE;
/*!40000 ALTER TABLE `supplier_agreement` DISABLE KEYS */;
INSERT INTO `supplier_agreement` VALUES (2,'2024-03-24','06 months','2024-03-24','2025-03-05 23:24:03',NULL,'2025-03-13 09:10:09',10,NULL,10,NULL,NULL,NULL,12,4,1,1,'SUP00001',NULL,NULL),(3,'2025-03-01','06 months','2025-03-01','2025-03-12 18:20:06','2025-03-28 16:47:01',NULL,10,10,NULL,NULL,NULL,NULL,12,2,4,45,'SUP00002',NULL,'Approved'),(4,'2025-03-01','06 months','2025-03-01','2025-03-13 09:26:43','2025-03-15 11:35:56',NULL,10,10,NULL,NULL,NULL,NULL,12,2,3,1,'SUP00003','Package changed','Aprroved'),(5,'2025-02-28','06 months','2025-03-01','2025-03-13 09:58:27','2025-03-13 11:00:41',NULL,10,10,NULL,NULL,NULL,NULL,10,2,2,44,'SUP00004',NULL,'Approved');
/*!40000 ALTER TABLE `supplier_agreement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_agreement_status`
--

DROP TABLE IF EXISTS `supplier_agreement_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_agreement_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_agreement_status`
--

LOCK TABLES `supplier_agreement_status` WRITE;
/*!40000 ALTER TABLE `supplier_agreement_status` DISABLE KEYS */;
INSERT INTO `supplier_agreement_status` VALUES (1,'Pending'),(2,'Approved'),(3,'Expired'),(4,'Deleted'),(5,'Reject');
/*!40000 ALTER TABLE `supplier_agreement_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_payment`
--

DROP TABLE IF EXISTS `supplier_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_no` char(10) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `due_amount` decimal(10,2) NOT NULL,
  `current_payment` decimal(10,2) NOT NULL,
  `method` varchar(45) NOT NULL,
  `added_datetime` datetime NOT NULL,
  `added_user_id` int NOT NULL,
  `balance_amount` decimal(10,2) NOT NULL,
  `supplier_agreement_id` int NOT NULL,
  `supplier_agreement_id1` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `distance_UNIQUE` (`bill_no`),
  KEY `fk_supplier_payment_supplier_agreement1_idx` (`supplier_agreement_id1`),
  CONSTRAINT `fk_supplier_payment_supplier_agreement1` FOREIGN KEY (`supplier_agreement_id1`) REFERENCES `supplier_agreement` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_payment`
--

LOCK TABLES `supplier_payment` WRITE;
/*!40000 ALTER TABLE `supplier_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_status`
--

DROP TABLE IF EXISTS `supplier_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_status`
--

LOCK TABLES `supplier_status` WRITE;
/*!40000 ALTER TABLE `supplier_status` DISABLE KEYS */;
INSERT INTO `supplier_status` VALUES (1,'Active'),(2,'Inactive'),(3,'Delete');
/*!40000 ALTER TABLE `supplier_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(400) NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `note` varchar(400) DEFAULT NULL,
  `status` varchar(45) NOT NULL,
  `employee_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_employee1_idx` (`employee_id`),
  CONSTRAINT `fk_user_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (10,'Admin','admin@okidoki.com','$2a$10$jaBDPqPSaASJXzLcPh8xKeJ9Nfufk8scEyA2YtKDEWz.pCwpPsOGS','2025-02-20 16:50:53',NULL,NULL,NULL,'1',NULL),(11,'pramod@gmail.com','pramod@gmail.com','$2a$10$uEefZYc/9hXPKZ.JdbJ90u7vSGvxrTWyOhZAWgm5o.l1wWSYdJBG2','2025-02-20 17:07:18',NULL,'2025-03-10 12:17:11',NULL,'1',12),(50,'amith@gmail.com','amith@gmail.com','$2a$10$3mKezfogApK.54z4CvTzkOZRqzM.6Ljwqy5mxuJjWy29eqkiLArOK','2025-03-10 12:16:47',NULL,NULL,NULL,'1',22),(51,'isuru1@gmail.com','isuru@gmail.com','$2a$10$mDQ80sVFxt2/yV.QZI/nyOmEbQLxybrwjLyNJv1Hgk023bgVgr/Ya','2025-03-10 16:00:55','2025-03-10 17:34:57',NULL,'true','1',NULL),(52,'achiniruvishani009@gmail.com','achiniruvishani009@gmail.com','$2a$10$BgN31sKg4gc2kgDbNl8xZ.tL4Z/XfbBjO9z202IIrcOC3BTicJE86','2025-03-15 20:17:19',NULL,NULL,NULL,'1',NULL),(53,'achiniruvishani009@gmail.com','achiniruvishani009@gmail.com','$2a$10$04.0MK5AlrL8PauBmpRyV.xbtUm7MaBb5mKAgqv6er8ExkwMte/VO','2025-03-15 20:17:37','2025-03-30 21:52:02',NULL,'true','1',24);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_has_role`
--

DROP TABLE IF EXISTS `user_has_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_has_role` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_has_role_role1_idx` (`role_id`),
  KEY `fk_user_has_role_user1_idx` (`user_id`),
  CONSTRAINT `fk_user_has_role_role1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`),
  CONSTRAINT `fk_user_has_role_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_has_role`
--

LOCK TABLES `user_has_role` WRITE;
/*!40000 ALTER TABLE `user_has_role` DISABLE KEYS */;
INSERT INTO `user_has_role` VALUES (10,1),(11,1),(50,1),(52,1),(53,1),(51,2),(53,2),(51,3),(53,3);
/*!40000 ALTER TABLE `user_has_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle`
--

DROP TABLE IF EXISTS `vehicle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_no` varchar(11) NOT NULL,
  `model` varchar(45) NOT NULL,
  `make_year` date NOT NULL,
  `insurance_expire_date` date NOT NULL,
  `revenu_license_expire_date` date NOT NULL,
  `startup_meter_reading` int DEFAULT NULL,
  `current_meter_reading` int NOT NULL,
  `supplier_id` int NOT NULL,
  `added_datetime` datetime NOT NULL,
  `updated_datetime` datetime DEFAULT NULL,
  `deleted_datetime` datetime DEFAULT NULL,
  `added_user_id` int NOT NULL,
  `updated_user_id` int DEFAULT NULL,
  `deleted_user_id` int DEFAULT NULL,
  `vehicle_status_id` int NOT NULL,
  `vehicle_type_id` int NOT NULL,
  `vehicle_make_id` int NOT NULL,
  `category` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_no_UNIQUE` (`vehicle_no`),
  KEY `fk_non_own_vehicle_supplier1_idx` (`supplier_id`),
  KEY `fk_vehicle_vehicle_status1_idx` (`vehicle_status_id`),
  KEY `fk_vehicle_vehicle_type1_idx` (`vehicle_type_id`),
  KEY `fk_vehicle_vehicle_make1_idx` (`vehicle_make_id`),
  CONSTRAINT `fk_non_own_vehicle_supplier1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`),
  CONSTRAINT `fk_vehicle_vehicle_make1` FOREIGN KEY (`vehicle_make_id`) REFERENCES `vehicle_make` (`id`),
  CONSTRAINT `fk_vehicle_vehicle_status1` FOREIGN KEY (`vehicle_status_id`) REFERENCES `vehicle_status` (`id`),
  CONSTRAINT `fk_vehicle_vehicle_type1` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle`
--

LOCK TABLES `vehicle` WRITE;
/*!40000 ALTER TABLE `vehicle` DISABLE KEYS */;
INSERT INTO `vehicle` VALUES (1,'NW-DAC-7842','TATA','2025-06-25','2025-06-25','2026-01-24',451241,458745,12,'2024-12-24 15:13:45',NULL,'2025-04-04 23:19:06',10,NULL,10,3,1,1,'Own'),(2,'NW-BAA-8591','Canter','2025-02-26','2025-02-27','2025-02-24',112459,123456,10,'2025-03-10 18:29:00','2025-03-10 19:16:05',NULL,10,10,NULL,1,2,1,'Own'),(3,'CP-DAC-5893','TATA','2025-02-26','2025-02-26','2025-02-26',1111,11111,12,'2025-03-10 18:29:00',NULL,NULL,10,NULL,NULL,1,1,1,'Own'),(4,'WP-DAB-7085','TATA','2025-02-26','2025-02-26','2025-02-26',111,111,12,'2025-03-10 18:29:00',NULL,NULL,10,NULL,NULL,1,3,1,'Own'),(11,'NW-DAF-7841','Canter','2025-03-01','2025-03-29','2025-03-29',1123133,1231213,5,'2025-03-13 09:57:09',NULL,NULL,10,NULL,NULL,1,3,1,'Non Own'),(12,'NW-PC-8591','Caliber','2025-03-01','2025-03-29','2025-03-29',112459,123456,6,'2025-03-13 09:57:40',NULL,NULL,10,NULL,NULL,1,4,1,'Non Own');
/*!40000 ALTER TABLE `vehicle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_make`
--

DROP TABLE IF EXISTS `vehicle_make`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_make` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_make`
--

LOCK TABLES `vehicle_make` WRITE;
/*!40000 ALTER TABLE `vehicle_make` DISABLE KEYS */;
INSERT INTO `vehicle_make` VALUES (1,'Mitsubishi');
/*!40000 ALTER TABLE `vehicle_make` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_status`
--

DROP TABLE IF EXISTS `vehicle_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_status`
--

LOCK TABLES `vehicle_status` WRITE;
/*!40000 ALTER TABLE `vehicle_status` DISABLE KEYS */;
INSERT INTO `vehicle_status` VALUES (1,'Active'),(2,'Inactive'),(3,'Deleted');
/*!40000 ALTER TABLE `vehicle_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_type`
--

DROP TABLE IF EXISTS `vehicle_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_type`
--

LOCK TABLES `vehicle_type` WRITE;
/*!40000 ALTER TABLE `vehicle_type` DISABLE KEYS */;
INSERT INTO `vehicle_type` VALUES (1,'7.5ft'),(2,'10.5ft'),(3,'14.5ft'),(4,'16.5ft'),(5,'18.5ft'),(6,'20ft'),(7,'22.5ft');
/*!40000 ALTER TABLE `vehicle_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-05 12:25:47
