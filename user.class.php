<?php
//Took from: https://github.com/davidlpz/php-user-class/blob/master/classes/class.user.php
//Inspiration: http://www.dreamincode.net/forums/topic/247188-user-authentication-class/

require_once 'database.class.php';
require_once 'auth.class.php';

class User {
	private $db;
	public $username;
	public $salt;
	public $auth_key;

	public function __construct($db) {
		session_start();
		$this->db = $db;

		return $this;
	}

	public function getUsername() {
		if (!empty($_SESSION["username"]) && !isset($_SESSION["username"])) {
			$this->username = $_SESSION["username"];
			return $this->username;
		} elseif (isset($_COOKIE['login_info'])) {
			$biscuit = json_decode($_COOKIE['login_info']);
			$possibleUser = $this->getUserInfo($biscuit->name);

			$this->username = $possibleUser["name"];
			return $this->username;
		}
	}
	/*TODO: not sure that those are very useful...since we can just call: $this->user->username*/
	public function getAuthKey()  { return $this->auth_key; }

	public function getSalt() {
		$this->db->query('SELECT salt FROM users WHERE name = :name');
		$this->db->bind(":name", $this->username);
		return $this->db->single();
	}
	
	//Will be useful for chat
	public function getOnlineUsers() {
		$this->db->query('SELECT * FROM users WHERE status = "online"');
		return $this->db->resultSet();
	}

	public function getUserInfo($name) {
		$this->db->query('SELECT * FROM users WHERE name = :name');
		$this->db->bind(":name", $name);
		return $this->db->single();
	}

	public function getUsers() {
		$this->db->query('SELECT * FROM users');
		return $this->db->resultSet();
	}
}
?>