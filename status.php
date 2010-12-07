<?php
	session_start(); // start up your PHP session! 
	if(isset($_SESSION['user'])) {	
		echo json_encode(array('status'=>'ok','user'=>$_SESSION['user']));		
	} else {
		echo json_encode(array('status'=>'ok'));		
	};

?>