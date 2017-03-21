<?php 
	$uploads_dir = 'uploads';

	if (isset($_POST['action']) && !empty($_POST['action'])) {
	    $action = $_POST['action'];
	    switch($action) {
	        case 'getFolders': 
	        	getFolders();
	        break;
	        case 'getFiles': 
	        	getFiles();
	        break;
	        case 'postFolder': 
	        	postFolder();
	        break;
	        case 'deleteFile': 
	        	deleteFile();
	        break;
	        case 'deleteFolder': 
	        	deleteFolder();
	        break;
	        case 'renameFile': 
	        	renameFile();
	        break;
	        case 'renameFolder': 
	        	renameFolder();
	        break;
	        //NOTE: since we need to get the tmp_name of the uploaded file, 
	        // the method postFile is triggered on form submit
	    }
	}

	function getFolders() {
		//echo '{}';
		$sql = "SELECT * FROM folders ORDER BY name";
		try {
			$db = getConnection();
			$stmt = $db->query($sql);  
			$folders = $stmt->fetchAll(PDO::FETCH_OBJ);
			$db = null;
			// echo '{"folders": ' . json_encode($folders) . '}';
			echo json_encode($folders);
		} catch(PDOException $e) {
			echo '{"error":{"text":'. $e->getMessage() .'}}'; 
		}
	}
	function getFiles() {
		//echo '{}';
		$sql = "SELECT * FROM files ORDER BY name";
		try {
			$db = getConnection();
			$stmt = $db->query($sql);  
			$files = $stmt->fetchAll(PDO::FETCH_OBJ);
			$db = null;
			// echo '{"files": ' . json_encode($files) . '}';
			echo json_encode($files);
		} catch(PDOException $e) {
			echo '{"error":{"text":'. $e->getMessage() .'}}'; 
		}
	}

	if ( isset($_FILES['uploaded_file']) ) {
		postFile();
	}
	function postFile() {
		global $uploads_dir;

		if ( isset($_FILES['uploaded_file']) ) {
			// Make sure the file was sent without errors
			if ($_FILES['uploaded_file']['error'] == 0) {

				 // Connect to the database
				$db = getConnection();

				//Model info
				$fileName = $_POST["fileName"];
				$fileMachineName = $_POST["fileMachineName"];
				$fileFolderID = $_POST["fileFolderID"];
				$fileType = $_POST["fileType"];

				$hashUrl = $_POST["hashUrl"];

				//$_FILES info
				$pathToFile = "$uploads_dir/$fileMachineName";
				$tmp_name = $_FILES["uploaded_file"]["tmp_name"];

				//store file into domain url
				move_uploaded_file($tmp_name, $pathToFile);
				
				$stmt = $db->prepare("INSERT INTO files (
						name, machine_name, folder_id, type, path, date_created
					) VALUES (
						:fileName, :fileMachineName, :fileFolderID, :fileType, :pathToFile, NOW()
					)"
				);
				$stmt->bindParam(':fileName', $fileName);
				$stmt->bindParam(':fileMachineName', $fileMachineName);
				$stmt->bindParam(':fileFolderID', $fileFolderID);
				$stmt->bindParam(':fileType', $fileType);
				$stmt->bindParam(':pathToFile', $pathToFile);
		 
				// Execute the query
				$stmt->execute();
			} else {
				echo 'An error accured while the file was being uploaded. '
				   . 'Error code: '. intval($_FILES['uploaded_file']['error']);
			}
		 
			// Close the mysql connection
			$db = null;
			header('Location: index.html');
		} else {
			echo 'Error! A file was not sent!';
		}
	}
	function postFolder() {
		$db = getConnection();

		$newFolder = json_decode($_POST["_data"]);

		//Model info
		$folderName = $newFolder->name;
		$folderMachineName = $newFolder->machineName;

		$stmt = $db->prepare("INSERT INTO folders (
				name, machine_name
			) VALUES (
				:folderName, :folderMachineName
			)"
		);
		$stmt->bindParam(':folderName', $folderName);
		$stmt->bindParam(':folderMachineName', $folderMachineName);

		// Execute the query
		$stmt->execute();

		// Close the mysql connection
		$db = null;
	}
	function renameFile() {
		global $uploads_dir;

		$db = getConnection();

		$data = json_decode($_POST["_data"]);

		//TODO: Be more specific on where to rename: uploads/folderName/filename
		$oldName = $data->oldName;
		$newName = $data->newName;

		$oldPath = $uploads_dir."/".$oldName;
		$newPath = $uploads_dir."/".$newName;

		$stmt = $db->prepare("UPDATE files SET machine_name = :machineName, path = :path WHERE id = :id");
		$stmt->bindParam(':machineName', $newName);
		$stmt->bindParam(':path', $newPath);
		$stmt->bindParam(':id', $id);

		// Execute the query
		$stmt->execute();

		rename($oldPath, $newPath);

		$db = null;
	}
	function renameFolder() {
		$db = getConnection();
	}

	function deleteFile() {
		global $uploads_dir;

		$db = getConnection();

		$machineName = $_POST["_data"];
		$stmt = $db->prepare("DELETE FROM files WHERE machine_name = :machineName");
		$stmt->bindParam(':machineName', $machineName);

		// Execute the query
		$stmt->execute();

		// Close the mysql connection
		$db = null;

		//delete file in directory
		unlink($uploads_dir."/".$machineName);
	}
	function deleteFolder() {
		$db = getConnection();

		$machineName = $_POST["_data"];
		$stmt = $db->prepare("DELETE FROM folders WHERE machine_name = :machineName");
		$stmt->bindParam(':machineName', $machineName);

		// Execute the query
		$stmt->execute();

		// Close the mysql connection
		$db = null;
	}

	function getConnection() {
		/* DB SETTINGS */
		$host = "127.0.0.1";
		$db_username = "root";
		$db_password = "";
		$database = "innervate";
		$dsn = ("mysql:host=$host;dbname=$database");

		$dbh = new PDO( $dsn, $db_username, $db_password );	
		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		return $dbh;
	}
?>