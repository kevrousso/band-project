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
		$this->db->query('SELECT * FROM filecomments ORDER BY datetime ASC');
		$comments = $this->db->resultSet();
		foreach ($comments as $key => $comment) {
			//TODO: add format based on language
			$comment['datetime'] = $this->formatDateTo($comment['datetime']);
			$comments[$key] = $comment;
		}

		echo json_encode($comments, JSON_NUMERIC_CHECK);
	}

	public function postFileComment($data) {
		$username = $data->username;
		$fileID = $data->fileID;
		$comment = $data->comment;

		$this->db->query('INSERT INTO filecomments (username, fileID, comment, datetime) 
											VALUES (:username, :fileID, :comment, NOW())');
		$this->db->bind(":username", $username);
		$this->db->bind(":fileID", $fileID);
		$this->db->bind(":comment", $comment);
		$this->db->execute();

		//return row
		$this->db->query('SELECT id, username, fileID, comment, datetime FROM filecomments WHERE id = :id');
		$this->db->bind(":id", $this->db->lastInsertID());
		$comment = $this->db->single();

		//Format date to correct language
		$comment['datetime'] = $this->formatDateTo($comment['datetime']);

		echo json_encode($comment, JSON_NUMERIC_CHECK);
	}

	public function deleteFileComments($fileID) {
		$this->db->query('DELETE FROM filecomments WHERE fileID = :fileID');
		$this->db->bind(':fileID', $fileID);
		$this->db->execute();
	}

	public function formatDateTo($datetime) {
		//format to french date "YYYY-DD-MM hh:mm:ss" -> "DD-MM-YYYY hh:mm:ss"
		//http://php.developpez.com/faq/?page=dates#date_mysqlfr
		$now = $datetime;
		list($date, $time) = explode(" ", $now);
		list($year, $month, $day) = explode("-", $date);
		list($hour, $min, $sec) = explode(":", $time);
		$now = "$day/$month/$year $time";

		$months = array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");
		
		//check if comment was posted today
		$todayDay = date("j") - 1;
		$todayMonth = date("n");
		$todayYear = date("Y");
		$parsedDate = '';
		//echo "$day  $todayDay  $month  $todayMonth  $year  $todayYear";
		if ($day != $todayDay || $month != $todayMonth || $year != $todayYear) {
			$parsedDate = $parsedDate . "$day " . $months[$month-1] . " " . $year . ", à ";
		}
		return $parsedDate . "${hour}h${min}";
	}
}
?>