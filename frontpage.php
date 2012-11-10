<?php

   require_once("phpSmug/phpSmug.php");
   require_once("gallery.php");

   // Get gallery
   $s = new SmugGallery(); 

	// Get title
	$title = "&laquo; If Any &raquo; Photos by Jonas Arnfred";


?>


<html>
   <head>
	  <title><?php echo $title; ?></title>
		<link href="reset.css" rel="stylesheet" type="text/css">
		<link href="style.css" rel="stylesheet" type="text/css">
		<script type="text/javascript" src="js/jquery.js"></script>
		<script type="text/javascript" src="js/jquery.scrollTo-min.js"></script>
		<script type="text/javascript" src="js/ifany.js"></script>
   </head>
   <body>

	  <?php


		 $html = $s->frontpage();
		echo $html;

	  ?>
   </body>
</html>



