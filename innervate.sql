-- phpMyAdmin SQL Dump
-- version 4.2.7.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Nov 27, 2014 at 09:57 PM
-- Server version: 5.6.20
-- PHP Version: 5.5.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `innervate`
--

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE IF NOT EXISTS `conversations` (
`id` int(11) NOT NULL,
  `username` varchar(10) NOT NULL,
  `file_id` int(11) NOT NULL,
  `message` varchar(500) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Depository' AUTO_INCREMENT=31 ;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `username`, `file_id`, `message`, `timestamp`) VALUES
(30, 'keven', 3, 'Oh hello there', '2014-11-27 20:56:23');

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE IF NOT EXISTS `files` (
`id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `machine_name` varchar(200) NOT NULL,
  `folder_id` int(11) NOT NULL,
  `type` varchar(10) NOT NULL,
  `path` varchar(200) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `name`, `machine_name`, `folder_id`, `type`, `path`, `date_created`) VALUES
(1, 'TODO.txt', 'TODO.txt', 1, 'file', 'uploads/TODO.txt', '2014-11-25 19:56:07'),
(3, 'guildwars2_WP.jpg', 'guildwars2_WP.jpg', 3, 'image', 'uploads/guildwars2_WP.jpg', '2014-11-25 19:58:05'),
(4, 'Kalimba.mp3', 'Kalimba.mp3', 2, 'audio', 'uploads/Kalimba.mp3', '2014-11-25 20:16:34');

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE IF NOT EXISTS `folders` (
`id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `machine_name` varchar(50) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=16 ;

--
-- Dumping data for table `folders`
--

INSERT INTO `folders` (`id`, `name`, `machine_name`) VALUES
(1, 'TestFolder', 'TestFolder'),
(2, 'Test2', 'Test2'),
(3, 'Test3', 'Test3'),
(4, 'test2', 'test2'),
(5, 'test3', 'test3'),
(6, 'test4', 'test4'),
(7, 'test5', 'test5'),
(8, 'test6', 'test6'),
(9, 'test7', 'test7'),
(10, 'test8', 'test8'),
(11, 'test9', 'test9'),
(12, 'test10', 'test10'),
(13, 'test11', 'test11'),
(14, 'test13', 'test13'),
(15, 'test12', 'test12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
`id` int(11) NOT NULL,
  `name` varchar(10) NOT NULL,
  `password` varchar(128) NOT NULL,
  `status` varchar(10) NOT NULL COMMENT 'Online/Away',
  `salt` varchar(500) NOT NULL COMMENT 'salt per user',
  `auth_key` varchar(500) NOT NULL COMMENT 'auth key stored in cookie'
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=52 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `status`, `salt`, `auth_key`) VALUES
(46, 'keven', 'aa186924084495364c70f130e5b7224a38605cd2908063bce2fac9412b28b5b4102e6545bc1bd92626d79bd12c1a008ef71d550e70925a8c589749be4ffb51fa', 'online', '?cw8e2FUiO4Z2;Z{=#nvRF)V&0ULL*&b4*U;o<vnqg;GNV>6or', '13be6490a9c06cad3258ba23833062d378a534b4825f3f306a3aa09e2724a0326b24b7e7068dcda6f64910a746a9817928a2b9bc989b4e8f104c341b61e65cd8'),
(51, 'michel', 'd8eac84db354425177ecf3a239f5f2ec337f1321507f84eef524398a328b2d7161d89b1e71e455c4e0a27746c65c98d37bc5cfd40cff2b6d238d6fb8da5bb030', 'offline', 'heNgA;SKUFq-Gq)%;0wr9A_0;SK<f{C6z+J&q<b#_H]S_{6Wz_', '436e15bae3b93e9f69daa675f20a1f29b78eec7b2291df4bc368f014930d459ea97b76b7dc33ecf96269fb888f96cb4e12a0d86a076c83dd6ec5d7fc1846a788');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
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
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=31;
--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=52;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
