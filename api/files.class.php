<?php 
require_once 'database.class.php';
require_once 'utils.class.php';

class Files {
	private $db;

	public function __construct($db) {
		$this->db = $db;
		$this->utils = new Utils();

		if (isset($_POST['action']) && !empty($_POST['action'])) {
			$action = $_POST['action'];
			switch($action) {
				case 'getFiles':   $this->getFiles();   break;
				case 'postFile':   $this->postFile();   break;
				case 'deleteFile': $this->deleteFile(); break;
				case 'renameFile': $this->renameFile(); break;
			}
		}
	}

	public function getFiles() {
		$this->db->query('SELECT * FROM files ORDER BY name');
		$files = $this->db->resultSet();
		echo json_encode($files);
	}
	public function postFile() {
		if ( isset($_FILES['uploaded_file']) ) {
			// Make sure the file was sent without errors
			if ($_FILES['uploaded_file']['error'] == 0) {

				//Model info
				$fileName = $_POST["fileName"];
				$fileMachineName = $_POST["fileMachineName"];
				$fileFolderID = $_POST["fileFolderID"];
				$fileType = $_POST["fileType"];

				//$_FILES info
				$pathToFile = UPLOAD_DIR."/$fileMachineName";
				$tmp_name = $_FILES["uploaded_file"]["tmp_name"];

				//store file into domain url
				move_uploaded_file($tmp_name, $pathToFile);
				
				$this->db->query('INSERT INTO files (
						name, machine_name, folder_id, type, path, date_created
					) VALUES (
						:fileName, :fileMachineName, :fileFolderID, :fileType, :pathToFile, NOW()
					)'
				);
				$this->db->bind(':fileName', $fileName);
				$this->db->bind(':fileMachineName', $fileMachineName);
				$this->db->bind(':fileFolderID', $fileFolderID);
				$this->db->bind(':fileType', $fileType);
				$this->db->bind(':pathToFile', $pathToFile);
				$this->db->execute();
			} else {
				$this->utils->error = 'An error occured while the file was being uploaded. '
					. 'Error code: '. intval($_FILES['uploaded_file']['error']);
				$this->utils->updateMessages();				
			}
		 
			header('Location: index.html');
		} else {
			$this->utils->error = 'Error! A file was not sent!';
			$this->utils->updateMessages();
		}
	}
	public function renameFile() {
		// File data
		$data = json_decode($_POST["_data"]);
		$oldName = $data->oldName;
		$newName = $data->newName;
		$newMachineName = $data->newMachineName;
		$id = $data->id;

		$this->db->query("UPDATE files SET name = :name, machine_name = :machineName, path = (path, :oldName, :newName) WHERE id = :id");
		$this->db->bind(':name', $newName);
		$this->db->bind(':machineName', $newMachineName);
		$this->db->bind(':oldName', $oldName."/");	
		$this->db->bind(':newName', $newName."/");
		$this->db->bind(':id', $id);
		$this->db->execute();

		//get correct folder name based on folder id
		$this->db->query("SELECT machine_name FROM folders WHERE id = :folderID");
		$this->db->bind(':folderID', $id);
		$row = $this->db->single();

		// uploads."/".folderName."/".oldFilename-newFilename
		$oldPath = UPLOAD_DIR."/".$row->machine_name."/".$oldName;
		$newPath = UPLOAD_DIR."/".$row->machine_name."/".$newName;

		//rename in directory uploads
		rename($oldPath, $newPath);
	}
	public function deleteFile() {
		$machineName = $_POST["_data"];
		$this->db->query("DELETE FROM files WHERE machine_name = :machineName");
		$this->db->bind(':machineName', $machineName);
		$this->db->execute();

		//delete file in directory
		unlink(UPLOAD_DIR."/".$machineName);
	}
}
?>