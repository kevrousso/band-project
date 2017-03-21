<?php
	/* DB SETTINGS */
	$host = "localhost";
	$db_username = "root";
	$db_password = "";
	$database = "innervate";
	$dsn = ("mysql:host=$host;dbname=$database");

	TRY {
		$connex = new PDO( $dsn, $db_username, $db_password );
		$connex->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		if (isset($_POST['submit'])) {
			$username = $_POST['username'];
			$msg = $_POST['message'];
			//$time = time();


			// Here's how it should works:
			// GETs
			//    SELECT convoID FROM conversations WHERE convoID = fileID
			//if (isset($_POST['userID'])) {
				/*echo "UPDATE";
				$id = $_POST['userID'];

				$sql = "UPDATE conversations SET"
					. "username=".$connex->quote($username)
					. "message".$connex->quote($msg)
					. " WHERE userID = ".$connex->quote($id);
				$conversations = $connex->query($sql);*/
			//} else {

				

				$sql = "INSERT INTO conversations("
									."username, message, timestamp"
					." ) VALUES ("
						.$connex->quote($username).","
						.$connex->quote($msg).", now()"
				.")";
				$conversations = $connex->query($sql);
			//}
		}
	} catch (PDOException $e) {
		exit("connexection failed: " . $e->getMessage());
	}
?>