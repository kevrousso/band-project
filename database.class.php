<?php 
//Took from: http://culttt.com/2012/10/01/roll-your-own-pdo-php-class/
require_once 'config.php';

class Database {
	private $host = DB_HOST;
	private $user = DB_USER;
	private $pass = DB_PASS;
	private $dbname = DB_NAME;

	private $dbh;
	private $error;

	public function __construct() {
		// Set DSN
		$dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->dbname;
		// Set options
		$options = array(
			PDO::ATTR_PERSISTENT	=> true,
			PDO::ATTR_ERRMODE		=> PDO::ERRMODE_EXCEPTION
		);
		// Create a new PDO instanace
		try {
			$this->dbh = new PDO($dsn, $this->user, $this->pass, $options);
		}
		catch(PDOException $e) {
			$this->error = $e->getMessage();
		}
	}

	public function query($query) {
		//error? stm is not defined as variable at top of class?
		$this->stmt = $this->dbh->prepare($query);
	}
	public function bind($param, $value, $type = null) {
		if (is_null($type)) {
			switch (true) {
				case is_int($value):
					$type = PDO::PARAM_INT;
					break;
				case is_bool($value):
					$type = PDO::PARAM_BOOL;
					break;
				case is_null($value):
					$type = PDO::PARAM_NULL;
					break;
				default:
					$type = PDO::PARAM_STR;
			}
		}
		$this->stmt->bindValue($param, $value, $type);
	}
	//Used to check if Insert worked also
	public function execute() {
		return $this->stmt->execute();
	}
	public function resultSet() {
		$this->execute();
		return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
	}
	public function single() {
		$this->execute();
		return $this->stmt->fetch(PDO::FETCH_ASSOC);
	}
	public function rowCount() {
		return $this->stmt->rowCount();
	}
	public function lastInsertId() {
		return $this->dbh->lastInsertId();
	}

	//Insert multiple records using a Transaction
	public function beginTransaction() {
	    return $this->dbh->beginTransaction();
	}
	//End Transaction when done with query
	public function endTransaction(){
	    return $this->dbh->commit();
	}
	public function cancelTransaction(){
	    return $this->dbh->rollBack();
	}
}
?>