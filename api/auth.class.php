<?php

require_once 'database.class.php';
require_once 'user.class.php';
require_once 'usertools.class.php';
require_once 'utils.class.php';

class Auth {
	private $db;

	public function __construct($db) {
		$this->db = $db;
		$this->utils = new Utils();

		//don't create a new user if one already exist..
		$this->user = (isset($this->user) ? $this->user : new User($this->db));
		$this->userTools = new UserTools($this->db, $this, $this->user);

		if (isset($_POST['action']) && !empty($_POST['action'])) {
			$action = $_POST['action'];
			switch($action) {
				case 'isLogged':   $this->isLogged();	break;
				case 'login':
					if (isset($_POST["_data"]) && !empty($_POST["_data"])) {
						$data = json_decode($_POST["_data"]);
						$this->login($data);
					}
				break;
				case 'logout':     $this->logout();   	break;
			}
		}
	}

	public function verifyUser() {
		$this->db->query("SELECT * FROM users WHERE name = :name AND password = :password");
		$this->db->bind(":name", $this->user->username);
		$this->db->bind(":password", $this->user->password);
		return $this->db->single();
	}

	public function isLogged() {
		//check for loggued user
		if (!empty($_SESSION['username']) && isset($_SESSION['is_logged'])) {
			$this->user->username = $_SESSION['username'];
			//Update User Status
			$this->userTools->updateStatus('online');
			echo $this->user->username;
		} elseif (isset($_COOKIE['login_info'])) {
			$biscuit = json_decode($_COOKIE['login_info']);

			$possibleUser = $this->user->getUserInfo($biscuit->name);
			$unsafeKey = $biscuit->auth_key;

			//validate that the user has been found in DB
			if (!empty($possibleUser) && isset($possibleUser)
				&& $unsafeKey == $possibleUser["auth_key"]) 
			{				
				$this->user->username = $possibleUser["name"];
				//Update User Status
				$this->userTools->updateStatus('online');
				//reset the expiration time
				//so that users don't get disconnected online
				setcookie('login_info', $_COOKIE['login_info'], time() + 86400); //Expires after 24 hours
				echo $this->user->username;
			}
		} else {
			return false;
		}
	}

	public function login($data) {
		$this->user->username = $data->username;
		$userSalt = $this->user->getSalt();

		//check user salt before, so that we can compare password hashed
		if ($userSalt["salt"]) {
			$this->user->salt = $userSalt["salt"];
			$this->user->password = $this->userTools->hashData($data->password);
			$row = $this->verifyUser();

			if (!empty($row) && count($row) > 0) {
				$this->utils->error = "";
				session_regenerate_id(true);
				$_SESSION['id'] = session_id();
				$_SESSION['username'] = $this->user->username;
				$_SESSION['is_logged'] = true;

				if ($data->rememberMe == 1) {
					// Generate new auth key for each log in 
					// (so old auth key can not be used multiple times in case of cookie hijacking)
					$cookie_auth = $this->userTools->randomString(50);
					$this->user->auth_key = $this->userTools->hashData($cookie_auth);
					$this->userTools->updateAuthKey();

					$cookie = array(
						'name' => $this->user->username,
						'auth_key' => $this->user->auth_key
					);

					setcookie('login_info', json_encode($cookie), time() + 86400); //Expires after 24 hours
				}

				//Update User Status
				$this->userTools->updateStatus('online');

				echo $this->user->username;
			}
		} else {
			$this->utils->error = 'Wrong username or password.';
			$this->utils->updateMessages();
		}
	}
	public function logout() {
		//Update User Status
		$this->user->username = $this->user->getUsername();
		$this->userTools->updateStatus('offline');

		session_unset();
		session_destroy();
		setcookie('login_info', '', time()-86400);
	}
}
?>