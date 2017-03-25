-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Dec 21, 2015 at 01:58 AM
-- Server version: 10.1.9-MariaDB
-- PHP Version: 5.6.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bandster`
--

-- --------------------------------------------------------

--
-- Table structure for table `filecomments`
--

CREATE TABLE `filecomments` (
  `id` int(11) NOT NULL,
  `username` varchar(10) NOT NULL,
  `fileID` int(11) NOT NULL,
  `comment` varchar(500) NOT NULL,
  `datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Depository';

--
-- Dumping data for table `filecomments`
--

INSERT INTO `filecomments` (`id`, `username`, `fileID`, `comment`, `datetime`) VALUES
(1, 'kev', 1, 'this is a comment', '2015-12-13 13:56:52'),
(2, 'kev', 1, 'This is another comment', '2015-12-13 13:57:04'),
(3, 'mitch', 1, 'Hello', '2015-12-13 13:57:48'),
(4, 'mitch', 1, 'Lorem ipsum dolor sit amet', '2015-12-13 13:58:43'),
(5, 'kev', 1, 'Check out at 1:44. The progression is sick!', '2015-12-13 14:23:11'),
(6, 'kev', 1, 'Test aujourd''hui', '2015-12-20 18:15:31'),
(7, 'kev', 1, 'Ã©Ã¨Ã Ã§^ppo,....-="''Ã‰ÃˆÃ‡Â¨Ã€:;*/-+\\|', '2015-12-20 18:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `machineName` varchar(200) NOT NULL,
  `folderID` int(11) NOT NULL,
  `type` varchar(10) NOT NULL,
  `path` varchar(200) NOT NULL,
  `dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `name`, `machineName`, `folderID`, `type`, `path`, `dateCreated`) VALUES
(1, 'changeLog.txt', 'changeLog.txt', 5, 'file', 'uploads/Documents/changeLog.txt', '2015-12-13 17:48:09'),
(3, 'KevenRousseau_CV_EN_ privÃ©.doc', 'KevenRousseau_CV_EN__prive.doc', 3, 'file', 'uploads/Textes/KevenRousseau_CV_EN__prive.doc', '2015-12-20 19:54:37'),
(4, 'bgUser2.jpg', 'bgUser2.jpg', 3, 'image', 'uploads/Textes/bgUser2.jpg', '2015-12-20 19:55:10'),
(5, '8TSZiui.jpg', '8TSZiui.jpg', 3, 'image', 'uploads/Textes/8TSZiui.jpg', '2015-12-20 19:55:33'),
(6, 'user@2x_trans.png', 'user@2x_trans.png', 1, 'image', 'uploads/Videos/user@2x_trans.png', '2015-12-20 20:00:13'),
(9, 'ascalonian-ruins-1.jpg', 'ascalonian-ruins-1.jpg', 1, 'image', 'uploads/Videos/ascalonian-ruins-1.jpg', '2015-12-20 20:01:05'),
(10, 'backgroundDefault.jpg', 'backgroundDefault.jpg', 1, 'image', 'uploads/Videos/backgroundDefault.jpg', '2015-12-20 21:05:17'),
(11, 'LambOfGodLaidToRest.mp3', 'LambOfGodLaidToRest.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest.mp3', '2015-12-21 00:23:12'),
(12, 'LambOfGodLaidToRest1.mp3', 'LambOfGodLaidToRest1.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest1.mp3', '2015-12-21 00:27:27'),
(13, 'LambOfGodLaidToRest2.mp3', 'LambOfGodLaidToRest2.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest2.mp3', '2015-12-21 00:30:23'),
(15, 'LambOfGodLaidToRest3.mp3', 'LambOfGodLaidToRest3.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest3.mp3', '2015-12-21 00:32:12'),
(16, 'LambOfGodLaidToRest4.mp3', 'LambOfGodLaidToRest4.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest4.mp3', '2015-12-21 00:33:32'),
(17, 'LambOfGodLaidToRest5.mp3', 'LambOfGodLaidToRest5.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest5.mp3', '2015-12-21 00:34:03'),
(18, 'LambOfGodLaidToRest6.mp3', 'LambOfGodLaidToRest6.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest6.mp3', '2015-12-21 00:35:08'),
(19, 'LambOfGodLaidToRest7.mp3', 'LambOfGodLaidToRest7.mp3', 2, 'audio', 'uploads/Audios/LambOfGodLaidToRest7.mp3', '2015-12-21 00:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE `folders` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `machineName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `folders`
--

INSERT INTO `folders` (`id`, `name`, `machineName`) VALUES
(1, 'Videos', 'Videos'),
(2, 'Audios', 'Audios'),
(3, 'Textes', 'Textes'),
(5, 'Documents', 'Documents');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(10) NOT NULL,
  `password` varchar(128) NOT NULL,
  `status` varchar(10) NOT NULL COMMENT 'Online/Away',
  `salt` varchar(500) NOT NULL COMMENT 'salt per user',
  `authKey` varchar(500) NOT NULL COMMENT 'auth key stored in cookie'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `status`, `salt`, `authKey`) VALUES
(2, 'kev', '175c2fc8c65535265072c68e8d1004d85ca75eee0f1229c57abad4469bed03b1de528bb08b563e837b8fdddd5e3e1cc1c606602bf5140b5ae68ab68502cae02c', 'online', 'eS,hICP]nfBRK>xW?774CRJ#6j%z,@2zZhBq=H7{zFff}tBQS8', 'ada9cd45027df8fe7aa18aac6859e43c3c40179adb939d1b402167035548eaa696d6b87599b234e9a3808df31fcba04171c2a898651d3492f12a9e5f74f71d9f'),
(3, 'mitch', 'a598ac3535ddaff9cadb5bbf3bf770ea0db014f6f0d14dfeae51ab3d207a6883d0c7a7f87e42aea0347daff82d7ec3f9e7a924a3fe66374ac7fee88d81b06b15', 'offline', 'zjDy;L^27],Vk+3;q5?bENX$X_9NB:L>WAM0?e}u:&@rPY>EId', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `filecomments`
--
ALTER TABLE `filecomments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `filecomments`
--
ALTER TABLE `filecomments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
