<?php

/**
 * album class for displaying galleries in diverse ways
 */
class SmugGallery {
	private $phpSmug;
	private $images;
	private $album;
	private $albums;


	function __construct() {
		$this->phpSmug = new phpSmug("APIKey=CXsQWfZPNH6Tw6k0MpbTdHJAHcs9MJfG", "AppName=Gnurf");
		$this->phpSmug->login();
		// Set caching
		$this->phpSmug->enableCache("type=fs", "cache_dir=tmp", "cache_expire=86400" );
	}


	public function getAlbumTitle($albumId,$albumKey) {

		$album = $this->getAlbum($albumId, $albumKey);

		return $album['Title'];
	}

	/**
	 * Fetches album from smugmug
	 */
	public function getAlbum($albumId,$albumKey) {

		// Check if we already have album
		if (!$this->album) {

			// Get Album
			$this->album = $this->phpSmug->albums_getInfo("AlbumID={$albumId}", "AlbumKey={$albumKey}");
		}

		return $this->album;
	}

	/**
	 * Fetches images from smugmug
	 */
	public function getImages($albumId,$albumKey) {

		// Check if we already have the images
		if (!$this->images) {

			// Get images
			$this->images = $this->phpSmug->images_get("AlbumID={$albumId}", "AlbumKey={$albumKey}", "Heavy=1");
		}

		return $this->images;
	}

	public function getOGHeaders($title, $id = "12121179", $key = "C3Ks6") {
		$url 	 = (!empty($_SERVER['HTTPS'])) ? "https://" . $_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'] : "http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
		$imgs	 = $this->getImages($id,$key);
		//$img 	 = $this->getRandImg($id,$key,true);
		$html	 = "<meta property=\"og:title\" content=\"".$title."\"/>";
		$html	.= "<meta property=\"fb:admins\" content=\"741506273\" />";
		$html	.= "<meta property=\"og:type\" content=\"website\"/>";
		//$html	.= "<meta property=\"og:image\" content=\"".$img['ThumbURL']."\"/>";
		$html	.= "<meta property=\"og:url\" content=\"".$url."\"/>";
		foreach ($imgs as $i) {
			$html	.= "<meta property=\"og:image\" content=\"".$i['ThumbURL']."\"/>";
		}
		return $html;
	}

	/**
	 * Display an album, but new function
	 */
	public function displayNewAlbum($albumId,$albumKey) {

		// Fetch Album
		$album = $this->getAlbum($albumId,$albumKey);

		// Fetch Images
		$images = $this->getImages($albumId,$albumKey);

		// Create album index
		$html	= $this->albumIndex($album, $images);


		// Create imageDisplay
		$html	.= $this->imageBox($images);

		return $html;

	}

	private function imageBox($images) {

		// Get screen dimensions minus border margins
		$h = $this->getHeight() - 4;
		$w = $this->getWidth() - 4; // 4 is arbitrary margin as well

		// Initially we work with the first image
		$n		 = 0;
		$i		 = $images[$n];
		$info	 = $this->getImageData($i);

		// Calculate how much we need to shrink it
		$height  = $info["height"];
		$width	 = $info["width"];

		// Display box for images
		$html	 = "<div id=\"displaybox\">";

		// Initially we display the first picture of the album
		$html	.= "<img id=\"display\" imgId=\"".$i["id"]."\" height=\"$height\" width=\"$width\" src=\"".$i[$info['size']]."\" />";

		// Semitransperant box for Caption and next / prev links
		$html	.= "<div id=\"caption\">";
		$html	.= "<div id=\"navPrev\" class=\"nav\"><p><a href=\"#next\">&laquo;</a></p></div>";
		$html	.= "<div id=\"captionText\"><p>" . $i["Caption"] ."</p></div>";
		$html	.= "<div id=\"navNext\" class=\"nav\"><p><a title=\"Use arrow keys to browse album\" href=\"#next\">&raquo;</a></p></div>";
		$html	.= "</div>";

		// End display box for images
		$html	.= "</div>"; 

		// A div for cached images
		$html	.= "<div id=\"cache\"></div>";

		return $html;

	}

	/**
	 * Display the index of an album, with thumbnails, etc
	 */
	private function albumIndex($album, $images) {

		// Create info box
		$date	 = new DateTime($album['LastUpdated'],new DateTimeZone("Europe/Copenhagen"));
		$update	 = $date->format('F jS Y');
		$desc	 = htmlspecialchars(strip_tags($this->trimDescription($album)));

		// Display information about the album
		$html	 = $this->albumInfo($album, $desc);

		// List album
		$html	.= $this->listAlbumThumbnails($images);

		return $html;
	}

	private function listAlbumThumbnails($images) {

		// Open div containing album
		$html	 = "<div class=\"albums\" id=\"albums\">";

		// Which side are we using
		$col = 1;

		// Go through albums, displaying information for each
		foreach ($images as $k=>$i) {
			
			// List album
			$html .= $this->listImage($i,$k,$col);
			$col = ($col == 3) ? 1 : $col+1;

		}

		// Add a little extra space down by the bottom
		$html .= "<div class=\"col1\">&nbsp;</div>";
		$html .= "<div class=\"col1\">&nbsp;</div>";

		// End album
		$html .= "</div>";

		return $html;
	}


	private function listImage($i,$k,$col) {


		// Get info and construct link
		$info	 = $this->getImageData($i);
		$html	 = "<a class=\"albumLink\" href=\"".$i[$info["size"]]."\">";

		$html	.= "<div class=\"albumBox col".$col."\" index=\"$k\" id=\"".$i['id']."\" 
					original=\"".$i["OriginalURL"]."\" icon=\"".$i["TinyURL"]."\" 
					originalSize=\"".$i["Width"]."x".$i["Height"]."\" desc=\"".$i['Caption']."\" key=\"".$i['Key']."\"
					realHeight=\"".$info["height"]."\" realWidth=\"".$info["width"]."\">";
		$html	.= "<img src=\"".$i['ThumbURL']."\" />";
		$html	.= "</div></a>\n";
		return $html;
	}

	private function albumInfo($album, $desc) {

		$date 	= new DateTime($album['LastUpdated'],new DateTimeZone("America/Santiago"));
		$albums	= $this->getAlbums();
		$update = $albums[$album['id']]['Category']['Name'].", uploaded on ".$date->format('d/m/Y');
		$html	 = "<div class=\"info\" >";
		$html	.= "<h2 id=\"scrollingDiv\">".$album["Title"]."</h2>";
		$html	.= "<p class=\"date\">$update</p>";
		$html	.= "<p class=\"desc\">$desc</p>";
		$html	.= "<p class=\"me\">Jonas Arnfred</p>";
		$html	.= "<a class=\"prevAlbum\" <a class=\"fp\" href=\"index.php?show=true\">&laquo; Frontpage</a>";

		// Display links to next and previous albums
		$html	.= $this->nextPrevAlbums($album['id']);

		// Display information about the image
		$html	.= $this->imageInfo();

		// Closing Info box
		$html	.= "</div>";

		return $html;
	}


	private function imageInfo() {

		// Information about the image currently under the cursor
		$html	 = "<div  class=\"imageStat\" style=\"display:none\">";
		//$html	.= "<img id=\"icon\" src=\"". $i["TinyURL"] ."\" width=\"20px\" height=\"20px\" />";
		$html	.= "<h3 id=\"iiTitle\">";
		//$html	.= "<img id=\"icon\" src=\"". $i["TinyURL"] ."\" width=\"20px\" height=\"20px\" />";
		$html	.= "<p>Image Info</p></h3>";
		//$html	.= "<div class=\"ii\" id=\"iiCamera\"><div class=\"iiLabel\">Camera:</div><div class=\"iiField\"></div></div>";
		$html	.= "<div class=\"ii\" id=\"iiFocalLength\"><div class=\"iiLabel\">Focal Length:</div><div class=\"iiField\"></div></div>";
		$html	.= "<div class=\"ii\" id=\"iiAperture\"><div class=\"iiLabel\">Aperture:</div><div class=\"iiField\"></div></div>";
		$html	.= "<div class=\"ii\" id=\"iiShutterSpeed\"><div class=\"iiLabel\">Shutter Speed:</div><div class=\"iiField\"></div></div>";
		//$html	.= "<div class=\"ii\" id=\"iiISO\"><div class=\"iiLabel\">ISO Speed:</div><div class=\"iiField\"></div></div>";
		$html	.= "<div class=\"ii\" id=\"iiDateTaken\"><div class=\"iiLabel\">Date Taken:</div><div class=\"iiField\"></div></div>";
		//$html	.= "<div class=\"ii\" id=\"iiSize\"><div class=\"iiLabel\">Original Size:</div><div class=\"iiField\"></div></div>";
		$html	.= "<div class=\"ii\" id=\"iiOriginal\"><div class=\"iiLabel\">Download:</div><div class=\"iiField\"><a title=\"Right click and choose 'save as'\" href=\"\">Original Size</a></div></div>";
		$html	.= "</br><div class=\"ii\" id=\"iiDescription\"></div>";

		// Close imageStat
		$html	.= "</div>";

		return $html;
	}


	private function albumLink($album,$text) {

		// If album is null we return an empty string
		if (!$album) return "";

		// Get random image
		$img	= $this->getRandImg($album['id'],$album['Key']);

		// Get date
		$date 	= new DateTime($album['LastUpdated'],new DateTimeZone("America/Santiago"));
		$update = $album['Category']['Name'].", ".$date->format('d/m/Y');

		// Blocks with links
		$block	= "<div class=\"albumNavLink\">";
		$block .= "<a href=\"album.php?id=".$img['Album']['id']."&key=".$img['Album']['Key']."\">\n";
		$block .= "<img id=\"nextAlbum\" src=\"".$img['TinyURL']."\" alt=\"Picture ".$img['id']."\" /></a>\n";
		$block .= "<h4>$text</h4>";
		$block .= "<a href=\"album.php?id=".$img['Album']['id']."&key=".$img['Album']['Key']."\">\n";
		$block .= "<p>".$album['Title']."</p></a>";
		$block .= "<p class=\"date\">".$update."</p></a>";
		$block .= "</div>";

		return $block;
	}


	private function nextPrevAlbums($albumId) {
		// Get galleries
		$albums		= $this->getAlbums();
		$current	= $albums[$albumId];
		$next		= ($current['next'] !== null) ? $albums[$current['next']] : null;
		$prev		= ($current['prev'] !== null) ? $albums[$current['prev']] : null;
		$random		= $albums[array_rand($albums)];

		// Header
		$header		= "<div id=\"navigation\">";
		$header	   .= "<h3>Browse Albums</h3>";

		// Assemble the blocks
		$html		= $this->albumLink($next,"Next Album").$this->albumLink($prev,"Previous Album").$this->albumLink($random, "Random Album");

		// Footer
		$footer		= "</div>";

		return $header.$html.$footer;
		
	}

	private function getAlbums() {

		if ($this->albums !== null) return $this->albums;

		// Get galleries
		$albums = $this->phpSmug->albums_get('NickName=arnfred','Heavy=1');	
		$result = array();

		foreach ($albums as $i => $a) {
			$prev = ($i+1 == sizeof($albums)) ? null : $i+1;
			$next = ($i == 0) ? null : $i-1;
			$a['next'] = ($next !== null) ? $albums[$next]['id'] : null;
			$a['prev'] = ($prev !== null) ? $albums[$prev]['id'] : null;
			$result[$a['id']] = $a;
		}

		$this->albums = $result;

		return $result;
	}


	/**
	 * Display album list
	 */
	public function listAlbums($show = false) {

		// Get galleries
		$albums = $this->getAlbums();

		// Decide if albums are shown or not
		$display = $show ? "block" : "none";

		// Create html
		$html = "<div style=\"display:".$display.";\" class=\"albums\" id=\"albums\">";

		// Which side are we using
		$col = 1;

		// Set timezone
		//date_default_timezone_set('copenhagen');

		// Go through albums, displaying information for each
		foreach ($albums as $a) {
			// Trim copyright info from description
			$desc = $this->trimDescription($a);

			
			// List album
			$html .= $this->listAlbum($a,$col);
			$col = ($col == 3) ? 1 : $col+1;

		}

		// Add a little extra space down by the bottom
		$html .= "<div class=\"col1\">&nbsp;</div>";
		$html .= "<div class=\"col1\">&nbsp;</div></div>";

		return $html;
	}

	private function listAlbum($a,$col) {
		$date = new DateTime($a['LastUpdated'],new DateTimeZone("America/Santiago"));
		$update = $a['Category']['Name'].", ".$date->format('d/m/Y');
		$desc  = htmlspecialchars(strip_tags($this->trimDescription($a)));
		$link  = "<a class=\"albumLink\" href=\"album.php?id=".$a['id']."&key=".$a['Key']."\">";

		$html  = "<div class=\"albumBox col".$col."\" id=\"".$a['id']."\" key=\"".$a['Key']."\" desc=\"".$desc."\" cat=\"".$a['Category']['Name']."\" time=\"".$update."\">\n";
		$html .= $link."</a>\n";
		$html .= $link."<p>".$a['Title']." </p></a>\n";
		$html .= "<p class=\"date\">$update</p>\n";
		$html .= "</div>\n";
		return $html;
	}



	private function trimDescription($album) {
		$desc = $album['Description'];
		$n = strpos($desc,"Photos are under a");
		$desc = ($n > 0) ? trim(substr($desc,0,$n)) : $desc;
		return $desc;
	}


	/**
	 * Display Frontpage
	 */
	public function frontpage($show) {
		// Pick random photo from frontpage album
		$id = "12121179";
		$key = "C3Ks6";

		// Get random image
		$img = $this->getRandImg($id,$key);

		// Display frontpage
		$html  = "<div id=\"content\" class=\"content\"><div class=\"frontImg\">\n";
		$html .= "<a id=\"albumImgLink\" href=\"album.php?id=".$img['Album']['id']."&key=".$img['Album']['Key']."#".$img['Key']."\">\n";
		$html .= "<img id=\"frontpageImg\" src=\"".$img['MediumURL']."\" alt=\"Picture ".$img['id']."\" />\n";
		$html .= "</a></div>\n";
		$html .= "<div class=\"frontText frontInfo\">\n";
		$html .= "<p>&laquo; If Any &raquo; is a site by &nbsp;<a href=\"mailto:jonas@ifany.org\">Jonas Arnfred</a></p>\n";
		$html .= "</div><div class=\"frontMenu frontInfo\">\n";
		$html .= "<a href=\"index.php\" id=\"newImage\" title=\"New Image\">New image</a> &middot; \n";
		$html .= "<a href=\"list.php\" id=\"listAlbums\" title=\"Show all Photo albums\">All albums</a> &middot; \n";
		$html .= "<a href=\"about.php\" id=\"about\" title=\"About me\">About</a>\n";
		$html .= "</div>";

		// Create a cache for images
		$html .= "<div class=\"cache\" style=\"display:none\"><a href=\"\"><img id=\"cache1\" src=\"\"/></a><a href=\"\"><img id=\"cache2\" src=\"\"/></a></div>\n";

		// Display About
		$html .= $this->about();

		// Display Galleries
		$html .= $this->listAlbums($show);

		// End frontpage
		$html .= "</div>";

		// Return html
		return $html;

	}

	public function about($show = false) {
		$display = $show ? "visible" : "none";
		$html = "<div style=\"display:$display\" class=\"about\">\n";
		$html .= "<p>The photos on this site are an ongoing collection of things, people and places that happen to stand in my way the moment I press the shutter. They are licensed under a copyleft license (<a href=\"http://creativecommons.org/licenses/by-sa/3.0/\" alt=\"Creative Commons CC-BY-SA\">CC-BY-SA</a>) which means that as long as you credit me and keep any deriviative work under the same license, you can use the photos for whatever you want. </p>\n";
		$html .= "<p>All photos are available in full resolution. In case you want to save a photo, navigate to the gallery containing it and click on 'Original'. Once the image has loaded, you can right click on it and save it on your computer. If you have any questions send them to <a href=\"mailto:jonas@ifany.org\" alt=\"jonas@ifany.org\">jonas@ifany.org</a>.\n";
		$html .= "</div>\n";
		return $html;
	}


	/**
	 * Get random img from album
	 */
	private function getRandImg($albumId, $albumKey, $current = false) {

		// Get photos in album
		$images = $current ? $this->getImages($albumId, $albumKey) : $this->phpSmug->images_get("AlbumID={$albumId}", "AlbumKey={$albumKey}", "Heavy=1");

		// Get number of photos
		$total = count($images);

		// get random number between 0 and the number of images -1
		$n = rand(0,$total-1);

		// Get random image
		return $images[$n];
	}
		

	private function indexNav($visible,$total) {
		if ($total > $visible) {
			$html  = "<span id=\"indexFrom\">0</span>";
			$html .= " to <span id=\"indexTo\">$visible</span>";
			$html .= " ($total total).";
			$html .= " Scroll: <a href=\"\">Down</a> - <a href=\"\">Up</a>";
		} else {
			$html = "$total pictures.";
		}
		return $html;
	}

	private function getHeight() {
		if (isset($_COOKIE["height"])) { return $_COOKIE["height"]; }
		else if (isset($_GET["h"])) { return $_GET["h"]; }
		else return 0;
	}

	private function getWidth() {
		if (isset($_COOKIE["width"])) { return $_COOKIE["width"]; }
		else if (isset($_GET["w"])) { return $_GET["w"]; }
		else return 0;
	}

	private function getImageData($i) {

		$o = ($i['Height'] < $i['Width']) ? "horizontal" : "vertical";
		$r = ($i['Height'] / $i['Width']);
		$h = $this->getHeight() - 4;
		$w = $this->getWidth() - 4; // 4 is arbitrary margin as well
		$maxH = 600;
		$maxW = 800;
		$result = array();

		if (($o == "vertical" && $h > 1200 && $w > 1200/$r) || ($o == "horizontal" && $w > 1600 && $h > 1600*$r)) {
			$result["size"] = 'OriginalURL';
			$maxH = 2592;
			$maxW = 2592;
		} else if (($o == "vertical" && $h > 960 && $w > 960/$r) || ($o == "horizontal" && $w > 1280 && $h > 1280*$r)) {
			$result["size"] = 'X3LargeURL';
			$maxH = 1200;
			$maxW = 1600;
		} else if (($o == "vertical" && $h > 768 && $w > 768/$r) || ($o == "horizontal" && $w > 1024 && $h > 1024*$r)) {
			$result["size"] = 'X2LargeURL';
			$maxH = 960;
			$maxW = 1280;
		} else if (($o == "vertical" && $h > 600 && $w > 600/$r) || ($o == "horizontal" && $w > 800 && $h > 800*$r)) {
			$result["size"] = 'XLargeURL';
			$maxH = 768;
			$maxW = 1024;
		} else if (($o == "vertical" && $h > 450 && $w > 450/$r) || ($o == "horizontal" && $w > 600 && $h > 600*$r)) {
			$result["size"] = 'LargeURL';
			$maxH = 600;
			$maxW = 800;
		} else {
			$result["size"] = 'MediumURL';
			$maxH = 450;
			$maxW = 600;
		}

		if ($o == "vertical") {
			$result["width"] = floor($maxH / $r);
			$result["height"] = $maxH;
		} else {
			$result["width"] = $maxW;
			$result["height"] = round($maxW * $r);
		}

		$result["orientation"] = $o;

		return $result;
	}





}

?>
