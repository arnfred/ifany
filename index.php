<?php

require_once("phpSmug/phpSmug.php");
require_once("gallery.php");

// Figure out if we show albums or not
$show	= isset($_GET["show"]) ? $_GET["show"] : false;

// Get gallery
$s		= new SmugGallery(); 
$title	= "&laquo; If Any &raquo; Photos by Jonas Arnfred";
$og		 = $s->getOGHeaders($title);
$html 	= $s->frontpage($show);
   

// If facebook, just give a few bit's of info

// Get homepage

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
   <head>
	  <title><?php echo $title; ?></title>
	  <link rel="icon" type="image/png" href="favicon.png">
		<?php echo $og; ?>
		<link href="reset.css" rel="stylesheet" type="text/css">
		<link href="style.css" rel="stylesheet" type="text/css">
		<script type="text/javascript" src="js/curl.js"></script>
		   <script type="text/javascript">

			// Curl
			curl(

				// Set up the configuration
				{
					baseUrl: 'js',
					paths: {
						"Example": "lib/example"
					},
				}, 

				// Set up the required modules
				["ifany"],

				// The call back function
				function(frontpage) {
					frontpage.display();
				}
			);
			

			// Google analytics
		   var _gaq = _gaq || [];
		   _gaq.push(['_setAccount', 'UA-380027-3']);
		   _gaq.push(['_trackPageview']);

		   (function() {
			   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			   ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		   })();

		   </script>
<!--
		<script type="text/javascript" src="js/size.js"></script>
		<script type="text/javascript" src="js/jquery.js"></script>
		<script type="text/javascript" src="js/jquery.scrollTo-min.js"></script>
		<script type="text/javascript" src="js/ifany.js"></script>
		<script type="text/javascript" src="js/jquery-smugmug-1.0.0.js"></script>
-->
   </head>
   <body>

	  <?php


		echo $html;

	  ?>
   </body>
</html>

