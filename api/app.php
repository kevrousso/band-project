<?php 

/* New Utils.class.php, 
	probably errors will come from Database.class*/

//TEST Welcome message
//TEST: Rename file, folder
//TEST: Default file extension (.txt, .gp5, etc)	
//TEST: add timestamp in comments: this is a comment #12:33 for Kalimba
	//TEST: check if it outputs 08:50 or 8:50 
	//if so, make modif to regex @ConvoView, formatMessageTimestampReference()

define("UPLOAD_DIR", "uploads");

require_once 'database.class.php';

require_once 'user.class.php';
require_once 'auth.class.php';

require_once 'files.class.php';
require_once 'folders.class.php';

require_once 'conversations.class.php';


$database = new Database();

$auth = new Auth($database);

$files = new Files($database);
$folders = new Folders($database);

$convos = new Conversations($database);

?>