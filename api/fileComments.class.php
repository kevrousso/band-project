<?php
require_once 'database.class.php';

class FileComments {
	private $db;
	
	public function __construct($db) {
		$this->db = $db;
		
		if (isset($_POST['action']) && !empty($_POST['action'])) {
			$action = $_POST['action'];
			switch($action) {
				case 'getFileComments': $this->getFileComments(); break;
				case 'postFileComment': 
				if (isset($_POST['_data']) && !empty($_POST['_data'])) {
					$data = json_decode($_POST["_data"]);
					$this->postFileComment($data);
				}
				break;
			}
		}
	}

	//get comments from files
	public function getFileComments() {
		//order by asc(default)
		$this->db->query('SELECT id, username, file_id, comment, TIME_FORMAT(timestamp, "%H:%i") AS timestamp FROM fileComments ORDER BY timestamp');
		$comments = $this->db->resultSet();
		echo json_encode($comments);
	}

	public function postFileComment($data) {
		$username = $data->username;
		$fileID = $data->fileID;
		$comment = $data->comment;

		$this->db->query('INSERT INTO fileComments (username, file_id, comment, timestamp) 
											VALUES (:username, :file_id, :comment, NOW())');
		$this->db->bind(":username", $username);
		$this->db->bind(":file_id", $fileID);
		$this->db->bind(":comment", $comment);
		$this->db->execute();

		//return row
		$this->db->query('SELECT id, username, file_id, comment, TIME_FORMAT(timestamp, "%H:%i") AS timestamp FROM fileComments WHERE id = :id');
		$this->db->bind(":id", $this->db->lastInsertID());
		$comment = $this->db->single();
		echo json_encode($comment);
	}

	public function deleteFileComments($file_id) {
		$this->db->query('DELETE FROM fileComments WHERE file_id = :file_id');
		$this->db->bind(':file_id', $file_id);
		$this->db->execute();
	}
}
?>