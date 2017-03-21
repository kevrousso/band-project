<?php 

	if(isset($_POST['action']) && !empty($_POST['action'])) {
	    $action = $_POST['action'];
	    switch($action) {
	        case 'getFolders': 
	        	getFolders();
	        break;
	        case 'getFiles': 
	        	getFiles();
	        break;
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