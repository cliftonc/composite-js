<?php
	session_start(); // start up your PHP session! 
	$_SESSION['user'] = $_REQUEST['user'];
	echo json_encode(array('status'=>'ok','user'=>$_SESSION['user']));	

?>