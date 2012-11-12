<?php

// Get key and id
$id = isset($_GET["id"]) ? $_GET["id"] : "12121179";
$key = isset($_GET["key"]) ? $_GET["key"] : "C3Ks6";
$reload = !(isset($_COOKIE["width"]) || isset($_GET["w"]));
$facebook = strstr($_SERVER['HTTP_USER_AGENT'],'facebook');

// If we need to reload, let's do it at once:
if ($reload && !$facebook) {
	echo "<html><head>";
	echo "<script type=\"text/javascript\" src=\"js/size.js\"></script>";
	echo "<script type=\"text/javascript\">reloadWithSize()</script>";
	echo "</head><body>redirecting...</body></html>";
	exit("Reloading...");
}

// Since all is well, let's proceed as normal
require_once("phpSmug/phpSmug.php");
require_once("gallery.php");

// Login to smugmug
$s		= new SmugGallery(); 
$title	= "&laquo; If Any &raquo; ".$s->getAlbumTitle($id,$key);
$og		= $s->getOGHeaders($title, $id, $key);

// Get Gallery
$html	= $s->displayNewAlbum($id,$key);


?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!DOCTYPE html>
<html>
   <head>
	  <title><?php echo $title; ?></title>
		<?php echo $og; ?>
	  <link rel="icon" type="image/png" href="favicon.png">
		<link href="reset.css" rel="stylesheet" type="text/css">
		<link href="style.css" rel="stylesheet" type="text/css">
		<script type="text/javascript" src="js/curl.js"></script>

		<script>
		// Set up curl
		curl(

			// Set up the configuration
			{
				baseUrl: 'js',
				paths: {
					"Example": "lib/example"
				},
			}, 

			// Set up the required modules
			["album"],

			// The call back function
			function(album) {
				// Nothing
			}
		)
		</script>

		<!--
		<script type="text/javascript" src="js/size.js"></script>
		<script type="text/javascript" src="js/jquery.js"></script>
		<script type="text/javascript" src="js/jquery-smugmug-1.0.0.js"></script>
		<script type="text/javascript" src="js/jquery.scrollTo-min.js"></script>
		<script type="text/javascript" src="js/cookie.js"></script>
		<script type="text/javascript" src="js/history.js"></script>
		<script type="text/javascript" src="js/album.js"></script>
		-->
   </head>
   <body>

		<?php
			// Echo out page
			echo $html;
		?>
   </body>
		<script type="text/javascript">
			// Google analytics code
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-380027-3']);
			_gaq.push(['_trackPageview']);

			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();

		</script>
</html>



