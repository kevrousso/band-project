<?php

require_once 'database.class.php';
require_once 'user.class.php';
require_once 'auth.class.php';

class UserTools {
	private $db;
	private $auth;
	private $user;

	public function __construct($db, $auth, $user) {
		$this->db = $db;

		$this->user = $user;
		$this->auth = $auth;

		if (isset($_POST['action']) && !empty($_POST['action'])) {
			$action = $_POST['action'];
			switch($action) {
				case 'createUser': 	$this->createUser();  break;
				/*Not tested yet*/
				case 'update': 	   $this->update();	    break;
				/*Not tested yet*/
				case 'delete': 	   $this->delete();	    break;
			}
		}
	}

	public function updateAuthKey() {
		$this->db->query('UPDATE users SET auth_key = :auth_key WHERE name = :username');
		$this->db->bind(':username', $this->user->username);
		$this->db->bind(':auth_key', $this->user->auth_key);
		$this->db->execute();
	}

	public function updateStatus($status) {
		$this->db->query('UPDATE users SET status = :status WHERE name = :username');
		$this->db->bind(':username', $this->user->username);
		$this->db->bind(':status', $status);
		$this->db->execute();
	}

	// Update an existing user's password
	public function update() {
		if (!empty($_POST['password']) && !empty($_POST['newPassword'])) {
			$this->user->password = $this->hashData($_POST['password']);

			if ($this->auth->verifyUser()) {
				$this->user->password = $this->hashData($_POST['newPassword']);
				$this->db->query('UPDATE users SET password = :password WHERE name = :name');
				$this->db->bind(":name", $this->user->username);
				$this->db->bind(":password", $this->user->password);

				if ($this->db->single()) {
					$this->auth->msg = 'Your password has been changed successfully.';
				} else {
					$this->auth->error = 'Something went wrong. Please, try again later.';
				}
			}
		}
		
		$this->auth->updateMessages();
	}

	//shown only once to users
	public function createUser() {
		$data = json_decode($_POST["_data"]);
		$this->user->username = $data->username;
		$rawPass = $data->password;

		//Generate user salt only once, and store it in the DB
		$salt = $this->randomString(50);
		$this->user->salt = $salt;

		$this->user->password = $this->hashData($rawPass);

		if ($this->usernameExist()) {
			$this->auth->error = 'Username already exists.';
			$this->auth->updateMessages();
		} else {
			$this->db->query('INSERT INTO users (name, password, salt, auth_key, status) 
												VALUES (:username, :password, :salt, :auth_key, :status)');
			$this->db->bind(':username', $this->user->username);
			$this->db->bind(':password', $this->user->password);
			$this->db->bind(':salt', $this->user->salt);
			$this->db->bind(':auth_key', "");
			$this->db->bind(':status', "");
			$this->db->execute();

			$this->auth->error = "";
		}
	}

	public function usernameExist() {
		$this->db->query("SELECT name FROM users WHERE name = :username");
		$this->db->bind(':username', $this->user->username);
		return $this->db->single();
	}
	public function delete() {
		$this->db->query('DELETE FROM users WHERE name = :name');
		$this->db->bind(":name", $this->user->username);
		return ($this->db->single());
	}

	public function hashData($data) {
		return hash_hmac('sha512', $data, $this->user->salt);
	}

	//generates a random string based on length desired
	public function randomString($len) {
		$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%?&*()-_=+^;,.:<>{}[]';

		$size = strlen($chars);
		$str = '';
		for ( $i = 0; $i < $len; $i++ ) {
			$str .= $chars[ rand( 0, $size - 1 ) ];
		}
		return $str;
	}
}
?>