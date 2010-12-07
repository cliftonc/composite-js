<?php	
	session_start(); // start up your PHP session! 
	unset($_SESSION['user']);
	echo json_encode(array('status'=>'ok'));	

?>