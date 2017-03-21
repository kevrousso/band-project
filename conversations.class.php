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
				case 'postMessage': 
				if (isset($_POST['_data']) && !empty($_POST['_data'])) {
					$data = json_decode($_POST["_data"]);
					$this->postMessage($data);
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

	public function postMessage($data) {
		$username = $data->username;
		$fileID = $data->fileID;
		$message = $data->message;

		$this->db->query('INSERT INTO conversations (username, file_id, message, timestamp) 
											VALUES (:username, :file_id, :message, NOW())');
		$this->db->bind(":username", $username);
		$this->db->bind(":file_id", $fileID);
		$this->db->bind(":message", $message);
		$this->db->execute();

		//return row
		$this->db->query('SELECT * FROM conversations WHERE id = :id');
		$this->db->bind(":id", $this->db->lastInsertID());
		$convo = $this->db->single();
		echo json_encode($convo);
	
	}
}
?>