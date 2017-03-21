<?php 
require_once 'database.class.php';
require_once 'utils.class.php';
require_once 'fileComments.class.php';

class Files {
	private $db;
	public $fileComments;

	public function __construct($db) {
		$this->db = $db;
		$this->utils = new Utils();
		$this->fileComments = new FileComments($db);

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
		$this->db->query('SELECT * FROM files ORDER BY id');
		$files = $this->db->resultSet();
		echo json_encode($files, JSON_NUMERIC_CHECK);
	}
	public function postFile() {
		if ( isset($_FILES['uploaded_file']) ) {
			// Make sure the file was sent without errors
			if ($_FILES['uploaded_file']['error'] == 0) {

				//Model info
				$fileName = $_POST["fileName"];
				$fileMachineName = $_POST["fileMachineName"];
				$folderID = $_POST["folderID"];
				$fileType = $_POST["fileType"];
				$folderMachineName = $_POST["folderMachineName"];

				//$_FILES info
				$pathToFile = UPLOAD_DIR."/".$folderMachineName."/".$fileMachineName;
				$tmp_name = $_FILES["uploaded_file"]["tmp_name"];

				//store file into domain url
				move_uploaded_file($tmp_name, "../".$pathToFile);
				
				$this->db->query('INSERT INTO files (
						name, machineName, folderID, type, path, dateCreated
					) VALUES (
						:fileName, :fileMachineName, :folderID, :fileType, :pathToFile, NOW()
					)'
				);
				$this->db->bind(':fileName', $fileName);
				$this->db->bind(':fileMachineName', $fileMachineName);
				$this->db->bind(':folderID', $folderID);
				$this->db->bind(':fileType', $fileType);
				$this->db->bind(':pathToFile', $pathToFile);
				$this->db->execute();

				//return row
				$this->db->query('SELECT * FROM files WHERE id = :id');
				$this->db->bind(":id", $this->db->lastInsertID());
				$file = $this->db->single();
				echo json_encode($file, JSON_NUMERIC_CHECK);
			} else {
				$max_upload = $this->getMaxFileSizeUpload();
				if ($_FILES['uploaded_file']['size'] == 0) {
					$this->utils->error = 'Error code: '. intval($_FILES['uploaded_file']['error']) .
						'<br />Unable to upload file. Uploaded file size is greater than the max file size upload of ' . $max_upload . 'MB.';
				} else {
					//throw generic error
					$this->utils->error = 'An error occured while the file was being uploaded. '
					. 'Error code: '. intval($_FILES['uploaded_file']['error']);
				}
				$this->utils->sendLogInfos();				
			}
		} else {
			$this->utils->error = 'Error! A file was not sent!';
			$this->utils->sendLogInfos();
		}
	}
	public function renameFile() {
		// File data
		$data = json_decode($_POST["_data"]);
		$oldMachineName = $data->oldMachineName;
		$newName = $data->newName;
		$newMachineName = $data->newMachineName;
		$fileID = $data->id;
		$folderID = $data->folderID;


		$this->db->query('UPDATE files SET name = :name, machineName = :machineName, path = REPLACE(path, :oldMachineName, :newMachineName) WHERE id = :fileID');
		$this->db->bind(':name', $newName);
		$this->db->bind(':machineName', $newMachineName);
		$this->db->bind(':oldMachineName', $oldMachineName);	
		$this->db->bind(':newMachineName', $newMachineName);
		$this->db->bind(':fileID', $fileID);
		$this->db->execute();

		//get correct folder name based on folder id
		$this->db->query('SELECT machineName FROM folders WHERE id = :folderID');
		$this->db->bind(':folderID', $folderID);
		$row = $this->db->single();

		$folderMachineName = $row['machineName'];

		$oldPath = UPLOAD_DIR."/".$folderMachineName."/".$oldMachineName;
		$newPath = UPLOAD_DIR."/".$folderMachineName."/".$newMachineName;


		$file = array(
			'newName' => $newName,
			'newMachineName' => $newMachineName,
			'path' => $newPath
		);
		echo json_encode($file, JSON_NUMERIC_CHECK);

		//rename in directory uploads
		$renamed = rename("../".$oldPath, "../".$newPath);
	}
	public function deleteFile() {
		$data = json_decode($_POST["_data"]);
		$fileID = $data->fileID;
		$fileMachineName = $data->fileMachineName;
		$folderMachineName = $data->folderMachineName;

		$this->db->query("DELETE FROM files WHERE id = :fileID");
		$this->db->bind(':fileID', $fileID);
		$this->db->execute();

		$this->fileComments->deleteFileComments($fileID);

		$pathToFile = "../".UPLOAD_DIR."/".$folderMachineName."/".$fileMachineName;

		//delete file in directory
		unlink($pathToFile);
	}

	public function getMaxFileSizeUpload() {
		$max_upload = (int)(ini_get('upload_max_filesize'));
		$max_post = (int)(ini_get('post_max_size'));
		$memory_limit = (int)(ini_get('memory_limit'));
		$upload_mb = min($max_upload, $max_post, $memory_limit);
		return $upload_mb;
	}
}
?>