<?php

class Utils {
	public $msg = '';
	public $error = '';
	private $info;

	public function __construct(){

	}
	public function sendLogInfos() {
		$this->info = array(
			'message' => $this->msg,
			'error' => $this->error
		);

		if (!empty($this->msg) || !empty($this->error)) {
			echo json_encode($this->info);
		}
	}
}
?>