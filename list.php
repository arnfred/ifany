<?php

require_once("phpSmug/phpSmug.php");
require_once("gallery.php");

?>


<html>
   <head>
	  <title>&laquo; If Any &raquo; Album list</title>
		<link href="reset.css" rel="stylesheet" type="text/css">
		<link href="style.css" rel="stylesheet" type="text/css">
		<script type="text/javascript" src="js/size.js"></script>
		<script type="text/javascript" src="js/jquery.js"></script>
		<script type="text/javascript" src="js/jquery.scrollTo-min.js"></script>
		<script type="text/javascript" src="js/ifany.js"></script>
		<script type="text/javascript" src="js/jquery-smugmug-1.0.0.js"></script>
   </head>
   <body>

<?php

	$s = new SmugGallery(); 

	echo  "<div id=\"content\" class=\"content\">";
	echo "<a class=\"aboutHome\" href=\"index.php\" alt=\"Home\">Home</a>";
	echo $s->listAlbums(true);
	echo "</div>";

?>
   </body>
</html>



