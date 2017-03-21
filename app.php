<?php 

// Errors: After login, fails? not redirected to content

// ******** WILL PROBABLY HAVE ERRORS FROM Fetch(obj) and Associated **********

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