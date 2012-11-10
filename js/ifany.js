define(["domReady!", "size", "jquery", "smugmug", "cookie"], function(domReady, size, $, smugmug, cookie) {

	// Init frontpage
	frontpage = {};

	frontpage.display = function() {

		// Move content to appropriate position on frontpage
		adjustContent();
		// And make it move again on resize
		$(window).resize(function() {
			adjustContent();
		});


		// Add scrollDown to frontpage
		$("#listAlbums").click(function(e) {
			showDiv("All albums", "Hide albums", "#listAlbums", "div.albums", 570) 
			e.preventDefault();
		});


		// add About to frontpage
		$("#about").click(function(e) { 
			showDiv("About", "About", "#about", "div.about", 100) 
			e.preventDefault();
		});


		// Get frontpage images
		getImgs();

		// Hide horizontal scrollbar
		$("body").css("overflow-x","hidden");
	}


	// Adjusts content on reload and resize
	var adjustContent = function() {
		
		// adjust frontpage
		$("#content").css("left",getContentPosX());

		// Save screen size in cookie
		cookie.set("width", size.getWidth(),1);
		cookie.set("height", size.getHeight(),1);

	}



	// Loads new frontpage image
	var reloadImg = function() {
		
		// If images did load, then make new image ajax
		$("#newImage").click(function(e) {
			e.preventDefault();

			// Move image from cache1 to img
			copyRandImg("#cache1","#frontpageImg");

			// Rotate cache
			copyRandImg("#cache2","#cache1");

			// Load new image in last cache
			loadRandImg("#cache2");

		});
	}

	// Loads a random image and inserts it at id
	var loadRandImg = function(id) {

		// Load a random image until we have one that hasn't been used
		do {
			i = getRandImg(window.images);
			if (i == null) return null;
		} while (window.cycled.indexOf(i.id) != -1);

		// Add this image to the already cycled ones
		window.cycled.push(i.id);

		// Check that we haven't used all the images
		if (window.cycled.length >= window.images.length) window.cycled = [];

		// Now insert image
		src = i.MediumURL;
		alt = "Picture " + i.id;
		href = "album.php?id=" + i.Album.id + "&key=" + i.Album.Key;
		insertRandImg(src,alt,href,id);
	}

	// Inserts a random image at the position of the id
	var insertRandImg = function(src,alt,href,id) {
		$(id).parent().attr("href",href);
		$(id).attr("src",src).attr("alt",alt);
	}

	// This will copy a random image between the two id's
	var copyRandImg = function(old,n) {
		src = $(old).attr("src");
		alt = $(old).attr("alt");
		href = $(old).parent().attr("href");
		insertRandImg(src,alt,href,n);
	}


	// Given a list of images, this function will pick one of them at random
	var getRandImg = function(imgs) {
		if (imgs == null || 0 == imgs.length) return null;
		var num = Math.floor(Math.random()*imgs.length);
		return imgs[num];
	}

	// Loads the frontpage images as well as album images
	var getImgs = function() {
		smugmug.login.anonymously(function() {
			smugmug.images.get({AlbumID:"12121179",AlbumKey:"C3Ks6",Heavy:true},function(data) { 
				window.images = data.Album.Images;		
				window.cycled = [];
				loadRandImg("#cache1");
				loadRandImg("#cache2");
				reloadImg();
				getAlbums();
			});
		});
	}

	// Takes care of loading all album images
	var getAlbums = function() {
		$(".albumBox").each(function() { 
			var key = $(this).attr("key"); 
			var id = $(this).attr("id");
			var desc = $(this).attr("desc");
			var cat = $(this).attr("cat");
			var time = $(this).attr("time");
			smugmug.images.get({AlbumID:id,AlbumKey:key,Heavy:true}, function(data) {
				var img = getRandImg(data.Album.Images);
				if (img == null) return null;
				var url = img.ThumbURL;
				$("#" + id).children("a").first().append("<img alt=\"" + desc + "\" src=\"" + url + "\" />");

			});
		});
	}
										


	var showDiv = function(hidetext, showtext, clickid, divid, scroll) {
		$(clickid).empty().append(showtext)
		$(clickid).unbind();
		$(clickid).click(function (e) { 
			e.preventDefault();
			hideDiv(hidetext, showtext, clickid, divid, scroll) 
		});
		$(divid).fadeIn(400,function() {
			$("body").animate({ scrollTop: scroll }, 400)
		});
	}

	var hideDiv = function(hidetext, showtext, clickid, divid, scroll) {
		$(clickid).empty().append(hidetext)
		$(clickid).unbind();
		$(clickid).click(function (e) { 
			e.preventDefault();
			showDiv(hidetext, showtext, clickid, divid, scroll) 
		});
		$("body").animate({ scrollTop: 0 }, 400, function() {
			$(divid).fadeOut();
		});

	}



	var getContentPosX = function() {
		result = size.getWidth() - 604 - 200;
		if (result < 0) return 10;
		else return result;
	}


	// Return the frontpage
	return frontpage;
});
