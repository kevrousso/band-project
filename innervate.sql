-- phpMyAdmin SQL Dump
-- version 4.2.7.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2014 at 03:42 AM
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
-- Table structure for table `filecomments`
--

CREATE TABLE IF NOT EXISTS `filecomments` (
`id` int(11) NOT NULL,
  `username` varchar(10) NOT NULL,
  `file_id` int(11) NOT NULL,
  `comment` varchar(500) NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Depository' AUTO_INCREMENT=1 ;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE IF NOT EXISTS `folders` (
`id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `machine_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `status`, `salt`, `auth_key`) VALUES
(1, 'keven', 'a23620d48bf8f2879238af58b50ca5efaad0f86acc1ee625b4db00b3522a70ba01feef69500e52a109a56c3e485aab1b53fdebfc0352b8c5ae32bed2379a6e1c', 'online', 'j*9QDKWPc?vGAg1m@eawJ.w6>H!^K7u)LTm]hlzD>tcEmbr[ut', '4162192048ebbc9f5fca16d9c81e1a0a7797fe06cbc1c58d3c59bc24b508e42bd23765b24fb8254a11d7d114c9ce1eb1335d294f9d5efcd49cc0d0006094fefc');

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
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
