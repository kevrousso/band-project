<?php
require_once 'database.class.php';

class Conversations {
	private $db;
	
	public function __construct($db) {
		$this->db = $db;
		
		if (isset($_POST['action']) && !empty($_POST['action'])) {
			$action = $_POST['action'];
			switch($action) {
				case 'getConversations': $this->getConversations(); break;
				case 'postComment': 
				if (isset($_POST['_data']) && !empty($_POST['_data'])) {
					$data = json_decode($_POST["_data"]);
					$this->postComment($data);
				}
				break;
			}
		}
	}

	//get conversations from files
	public function getConversations() {
		//order by asc(default)
		$this->db->query('SELECT * FROM conversations ORDER BY timestamp');
		$convos = $this->db->resultSet();
		echo json_encode($convos);
	}

	public function postComment($data) {
		$username = $data->username;
		$fileID = $data->fileID;
		$comment = $data->comment;

		$this->db->query('INSERT INTO conversations (username, file_id, comment, timestamp) 
											VALUES (:username, :file_id, :comment, TIME_FORMAT(NOW(), "%H:%i"))');
		$this->db->bind(":username", $username);
		$this->db->bind(":file_id", $fileID);
		$this->db->bind(":comment", $comment);
		$this->db->execute();

		//return row
		$this->db->query('SELECT * FROM conversations WHERE id = :id');
		$this->db->bind(":id", $this->db->lastInsertID());
		$convo = $this->db->single();
		$convo["timestamp"] = date("H:i", strtotime($convo["timestamp"]));
		echo json_encode($convo);
	}
}
?>