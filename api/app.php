<?php 

//from this file..
define("UPLOAD_DIR", "uploads");

require_once 'database.class.php';

require_once 'user.class.php';
require_once 'auth.class.php';

require_once 'folders.class.php';


$database = new Database();

$auth = new Auth($database);

$folders = new Folders($database);

?>