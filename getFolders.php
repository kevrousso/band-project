<?php

	$directory = 'box/';

	$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));
	$dirs = array();
	$title = array('title');
	$folder = array();
	$output = array('');
	foreach ($it as $key => $val) {

		if (!$it->isDot()) {

			$type = strtolower( substr($it->key(), strrpos($it->key(), '.') + 1) );
			if ( $type === 'mp3' || $type === 'wav' ) {
				$str = 'music';
			} else if ( $type === 'mp4' || $type === 'ogv' || $type === 'webm' ) {
				$str = 'video';
			} else if ( $type === 'png' || $type === 'jpg' || $type === 'jpeg' ) {
				$str = 'image';
			} else {
				$str = 'file';
			}

			//search through the files of the current directory and add them to the array
			$itsub = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory.$it->getSubPath()."/"));
			$files = array();
			foreach ($itsub as $key => $val) {
				if (!$itsub->isDot()) {
					$files[] = array("name" => $itsub->getFilename(), "path" => $itsub->key(), "type" => $str);
				}
			}
			
			//add current title and files of current folder
			$folder[] = array(
				"title" => $it->getSubPath(),
				"files" => $files
			);
		}
		$dirs['dirs'] = $folder;
		$it->next();
	}
	printf(json_encode($dirs));
?>