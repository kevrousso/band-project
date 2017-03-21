<?php 
	$uploads_dir = 'uploads';

	if (isset($_POST['action']) && !empty($_POST['action'])) {
		$action = $_POST['action'];
		switch($action) {
			case 'getFolders':   getFolders();    break;
			case 'getFiles':     getFiles();      break;
			case 'postFile':   	 postFile();     break;
			case 'postFolder':   postFolder();    break;
			case 'deleteFile':   deleteFile();    break;
			case 'deleteFolder': deleteFolder();  break;
			case 'renameFile':   renameFile();    break;
			case 'renameFolder': renameFolder();  break;
			case 'createUser':   createUser();    break;
			case 'login': 			login();  		  break;
			case 'isLogguedIn': 	isLogguedIn();   break;
			case 'getConversations': getConversations();  break;
		}
	}

	function getFolders() {
		$db = getConnection();

		$stmt = $db->prepare('SELECT * FROM folders ORDER BY name');
		$stmt->execute();
		$folders = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode($folders);
	}
	function getFiles() {
		$db = getConnection();

		$stmt = $db->prepare('SELECT * FROM files ORDER BY name');  
		$stmt->execute();
		$files = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode($files);
	}

	function getConversations() {
		$db = getConnection();

		$user = json_decode($_POST["_data"]);
		$id = $user->id;

		//TODO: check for ?date_created?
		$stmt = $db->prepare('SELECT * FROM conversations ORDER BY date_created');
		$stmt->execute();
		$row = $stmt->fetch(PDO::FETCH_OBJ);
		echo json_encode($row);

		$db = null;
	}

	function getOnlineUsers() {
		$db = getConnection();
	/* Pseudo-code
		$stmt = $db->prepare('SELECT * FROM users WHERE state = `online` ORDER BY name');
		$stmt->execute();
		$row = $stmt->fetch(PDO::FETCH_OBJ);

		echo json_encode($row);
	*/
		$db = null;
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
				$stmt->execute();
			} else {
				echo 'An error occured while the file was being uploaded. '
					. 'Error code: '. intval($_FILES['uploaded_file']['error']);
			}
		 
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

		$stmt = $db->prepare('INSERT INTO folders (name, machine_name) VALUES (:folderName, :folderMachineName)');
		$stmt->bindParam(':folderName', $folderName);
		$stmt->bindParam(':folderMachineName', $folderMachineName);
		$stmt->execute();

		$db = null;
	}
	function renameFile() {
		global $uploads_dir;

		$db = getConnection();

		// File data
		$data = json_decode($_POST["_data"]);
		$oldName = $data->oldName;
		$newName = $data->newName;
		$newMachineName = $data->newMachineName;
		$id = $data->id;


		$stmt = $db->prepare("UPDATE files SET name = :name, machine_name = :machineName, path = (path, :oldName, :newName) WHERE id = :id");
		$stmt->bindParam(':name', $newName);
		$stmt->bindParam(':machineName', $newMachineName);
		$stmt->bindParam(':oldName', $oldName."/");	
		$stmt->bindParam(':newName', $newName."/");
		$stmt->bindParam(':id', $id);
		$stmt->execute();

		//get correct folder name based on folder id
		$stmt = $db->prepare("SELECT machine_name FROM folders WHERE id = :folderID");
		$stmt->bindParam(':folderID', $id);
		$stmt->execute();
		$row = $stmt->fetch(PDO::FETCH_OBJ);

		// uploads."/".folderName."/".oldFilename-newFilename
		$oldPath = $uploads_dir."/".$row->machine_name."/".$oldName;
		$newPath = $uploads_dir."/".$row->machine_name."/".$newName;

		//rename in directory uploads
		rename($oldPath, $newPath);

		$db = null;
	}
	function renameFolder() {
		global $uploads_dir;

		$db = getConnection();

		//Folder data
		$data = json_decode($_POST["_data"]);
		$oldName = $data->oldName;
		$newName = $data->newName;
		$id = $data->id;

		$stmt = $db->prepare("UPDATE folders SET name = :name, machine_name = :machineName WHERE id = :id");
		$stmt->bindParam(':name', $newName);
		$stmt->bindParam(':machineName', $newName);
		$stmt->bindParam(':id', $id);
		$stmt->execute();

		//replace old folder name by new one
		$stmt = $db->prepare("UPDATE files SET path = REPLACE(path, :oldName, :newName) WHERE folder_id = :id");
		// add a / in case the folder name exist also in file name...
		$stmt->bindParam(':oldName', $oldName."/");	
		$stmt->bindParam(':newName', $newName."/");
		$stmt->bindParam(':id', $id);
		$stmt->execute();

		// uploads."/".folderName
		$oldPath = $uploads_dir."/".$oldName;
		$newPath = $uploads_dir."/".$newName;

		//rename in directory uploads
		rename($oldPath, $newPath);

		$db = null;
	}

	function deleteFile() {
		global $uploads_dir;

		$db = getConnection();

		$machineName = $_POST["_data"];
		$stmt = $db->prepare("DELETE FROM files WHERE machine_name = :machineName");
		$stmt->bindParam(':machineName', $machineName);
		$stmt->execute();

		$db = null;

		//delete file in directory
		unlink($uploads_dir."/".$machineName);
	}
	function deleteFolder() {
		$db = getConnection();

		$data = json_decode($_POST["_data"]);
		$machineName = $data->machineName;
		$id = $data->id;

		//delete folder
		$stmt = $db->prepare("DELETE FROM folders WHERE machine_name = :machineName");
		$stmt->bindParam(':machineName', $machineName);
		$stmt->execute();

		//delete files referencing to that folder
		$stmt = $db->prepare("DELETE FROM files WHERE folder_id = :id");
		$stmt->bindParam(':id', $id);
		$stmt->execute();

		$db = null;
	}

	//check out: http://stackoverflow.com/questions/1354999/keep-me-logged-in-the-best-approach
	function isLogguedIn() {
		$db = getConnection();

		session_start();

		//check for session
		if (isset($_SESSION['userData'])) {
			$info = array(
				'id' => $_SESSION["userData"]['id'],
				'name' => $_SESSION["userData"]['name']
			);

			//UPDATE users SET state = `online` WHERE id = $row->id

			echo json_encode($info);

			//check for cookie
		} else if (isset($_COOKIE['login_info'])) {
			$biscuit = json_decode($_COOKIE['login_info']);

			$salt = "_S-c-Ee36F;)Ap!";

			$stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
			$stmt->bindParam(':id', $biscuit->id);
			$stmt->execute();
			$row = $stmt->fetch(PDO::FETCH_ASSOC);

			//is this the same cookie we set earlier ?
			$unsafeKey = $biscuit->auth_key;
			if ($unsafeKey == $row["auth_key"]) {
				$info = array(
					'id' => $row['id'],
					'name' => $row['name']
				);		

				//UPDATE users SET state = `online` WHERE id = $row->id

				echo json_encode($info);
			}
		}
		$db = null;
	}

	//validate on form submit
	function login() {
		$db = getConnection();

		$data = json_decode($_POST["_data"]);

		$username = $data->username;
		$pass = $data->pass;

		$salt = "_S-c-Ee36F;)Ap!";

		$encrypted = md5($pass . $salt);

		$stmt = $db->prepare("SELECT * FROM users WHERE name = :username");
		$stmt->bindParam(':username', $username);
		$stmt->execute();
		$row = $stmt->fetch(PDO::FETCH_OBJ);

		//check if found a user
		if (!empty($row) && count($row) > 0) {
			//password is valid?
			if ($row->pass === $encrypted) {

				//took from: http://blog.themeforest.net/tutorials/working-with-sessions-and-cookies-in-php-and-mysql/
				
				// Generate new auth key for each log in 
				// (so old auth key can not be used multiple times in case of cookie hijacking)
				$cookie_auth = rand_string(10);

				//use instead: hash('sha512', someStr);
				$auth_key = md5($salt . $cookie_auth);

				$stmt = $db->prepare("UPDATE users SET auth_key = '" . $auth_key . "' WHERE name = :username");
				$stmt->bindParam(':username', $username);
				$stmt->execute();

				$cookie = array(
					'id' => $row->id,
					'auth_key' => $auth_key
				);

				setcookie('login_info', json_encode($cookie), time() + 7200);	//Expires after 2 hours

				//prevent security holes
				session_regenerate_id(true);

				$_SESSION['userData']['id'] = $row->id;
				$_SESSION['userData']['name'] = $row->name;
				$_SESSION['userData']['lastactive'] = time();	

				$info = array(
					'id' => $row->id,
					'name' => $row->name
				);		

				//UPDATE users SET state = `online` WHERE id = $row->id

				echo json_encode($info);

			} else {
				echo '{"invalid": "password"}';
			}
		} else {
			echo '{"invalid": "username"}';
		}

		$db = null;
	}

	function logout() {

		//remove cookie
		//setcookie('login_info', '', time() - 7200);

		//remove session
		//unset($_SESSION['userData']);
		//session_unset();
		//session_destroy(); 

		//make user offline
		//UPDATE users SET state = `offline` WHERE id = $row->id
	}



	function createNewSession() {
		//TODO: make code more structured for when session and cookie needs to be instanciated
	}
	function createUser() {
		$db = getConnection();

		$username = $_POST["username"];
		$pass = $_POST["pass"];

		$salt = "_S-c-Ee36F;)Ap!";
		
		//use instead: hash('sha512', someStr);
		$encrypted = md5($pass . $salt);
		$stmt = $db->prepare("INSERT INTO users (name, pass) VALUES (:username, :pass)");
		//create( 'users', ['name'=>$username, 'pass'=>$encrypted] );
		$stmt->bindParam(':username', $username);
		$stmt->bindParam(':pass', $encrypted);
		$stmt->execute();

		$db = null;

		//send to login page
		header('Location: index.html');
	}

	/*UTILS Functions*/
	function getConnection() {
		$host = "127.0.0.1";
		$db_username = "root";
		$db_password = "";
		$database = "innervate";
		$dsn = ("mysql:host=$host;dbname=$database");

		$dbh = new PDO( $dsn, $db_username, $db_password );	
		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		return $dbh;
	}

	//usage: create( 'users', ['name'=>'val1','pass'=>'val2'] );
	function create($tablename, $data) {
		$db = getConnection();

		$keys = array_keys($data);
		$fields = '`'.implode('`, `',$keys).'`';

		$placeholder = substr(str_repeat('?,',count($keys),0,-1));
		
		$stmt = $db->prepare("INSERT INTO $tablename ($fields) VALUES ($placeholder)");
		$stmt->execute(array_values($data));

		$db = null;
	}
	//usage: read( ['name', 'pass'], 'users', ????? )
	function read($fields, $tablename, $wheres) {
		$db = getConnection();
		$stmt = $db->prepare("SELECT " . implode('`, `', $fields) . " FROM $tablename WHERE $wheres");
		$stmt->execute();

		$db = null;
		return $stmt->fetchAll(PDO::FETCH_OBJ);
	}
	function update($tablename, $sets, $wheres) {
		$db = getConnection();

		$db = null;
	}
	function delete($tablename, $wheres) {
		$db = getConnection();

		$db = null;
	}
	

	//generates a random string based on length desired
	function rand_string( $len ) {
		$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%?&*()-_=+^;,.:<>{}[]';

		$size = strlen( $chars );
		$str = '';
		for( $i = 0; $i < $len; $i++ ) {
			$str .= $chars[ rand( 0, $size - 1 ) ];
		}

		return $str;
	}
?>