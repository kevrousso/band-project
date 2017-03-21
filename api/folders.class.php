<?php
require_once 'database.class.php';

class Folders {
	private $db;

	public function __construct($db) {
		$this->db = $db;

		if (isset($_POST['action']) && !empty($_POST['action'])) {
			$action = $_POST['action'];
			switch($action) {
				case 'getFolders':   $this->getFolders();	break;
				case 'postFolder':   $this->postFolder();	break;
				case 'deleteFolder': $this->deleteFolder();	break;
				case 'renameFolder': $this->renameFolder();	break;
			}
		}
	}
	public function getFolders() {
		$this->db->query('SELECT * FROM folders ORDER BY name');
		$this->db->execute();
		echo json_encode($this->db->resultSet());
	}
	public function postFolder() {
		$newFolder = json_decode($_POST["_data"]);

		//Model info
		$folderName = $newFolder->name;
		$folderMachineName = $newFolder->machineName;

		$this->db->query('INSERT INTO folders (name, machine_name) VALUES (:folderName, :folderMachineName)');
		$this->db->bind(':folderName', $folderName);
		$this->db->bind(':folderMachineName', $folderMachineName);
		$this->db->execute();
	}
	public function renameFolder() {
		//Folder data
		$data = json_decode($_POST["_data"]);
		$oldName = $data->oldName;
		$newName = $data->newName;
		$id = $data->id;

		$this->db->query('UPDATE folders SET name = :name, machine_name = :machineName WHERE id = :id');
		$this->db->bind(':name', $newName);
		$this->db->bind(':machineName', $newName);
		$this->db->bind(':id', $id);
		$this->db->execute();

		//replace old folder name by new one
		$this->db->query('UPDATE files SET path = REPLACE(path, :oldName, :newName) WHERE folder_id = :id');
		// add a / in case the folder name exist also in file name...
		$this->db->bind(':oldName', $oldName."/");	
		$this->db->bind(':newName', $newName."/");
		$this->db->bind(':id', $id);
		$this->db->execute();

		// uploads."/".folderName
		$oldPath = UPLOAD_DIR."/".$oldName;
		$newPath = UPLOAD_DIR."/".$newName;

		//rename in directory uploads
		rename($oldPath, $newPath);
	}
	public function deleteFolder() {
		$data = json_decode($_POST["_data"]);
		$machineName = $data->machineName;
		$id = $data->id;

		//delete folder
		$this->db->query('DELETE FROM folders WHERE machine_name = :machineName');
		$this->db->bind(':machineName', $machineName);
		$this->db->execute();

		//delete files referencing to that folder
		$this->db->query('DELETE FROM files WHERE folder_id = :id');
		$this->db->bind(':id', $id);
		$this->db->execute();
	}
}

?>