$(document).ready(function() {

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


});


// Adjusts content on reload and resize
function adjustContent() {
	
	// adjust frontpage
	$("#content").css("left",getContentPosX());

	// Save screen size in cookie
	setCookie("width", getWidth(),1);
	setCookie("height", getHeight(),1);

}



// Loads new frontpage image
function reloadImg() {
	
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
function loadRandImg(id) {

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
function insertRandImg(src,alt,href,id) {
	$(id).parent().attr("href",href);
	$(id).attr("src",src).attr("alt",alt);
}

// This will copy a random image between the two id's
function copyRandImg(old,n) {
	src = $(old).attr("src");
	alt = $(old).attr("alt");
	href = $(old).parent().attr("href");
	insertRandImg(src,alt,href,n);
}


// Given a list of images, this function will pick one of them at random
function getRandImg(imgs) {
	if (imgs == null || 0 == imgs.length) return null;
	var num = Math.floor(Math.random()*imgs.length);
	return imgs[num];
}

// Loads the frontpage images as well as album images
function getImgs() {
	$.smugmug.login.anonymously(function() {
		$.smugmug.images.get({AlbumID:"12121179",AlbumKey:"C3Ks6",Heavy:true},function(data) { 
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
function getAlbums() {
	$(".albumBox").each(function() { 
		var key = $(this).attr("key"); 
		var id = $(this).attr("id");
		var desc = $(this).attr("desc");
		var cat = $(this).attr("cat");
		var time = $(this).attr("time");
		$.smugmug.images.get({AlbumID:id,AlbumKey:key,Heavy:true}, function(data) {
			var img = getRandImg(data.Album.Images);
			if (img == null) return null;
			var url = img.ThumbURL;
			$("#" + id).children("a").first().append("<img alt=\"" + desc + "\" src=\"" + url + "\" />");

		});
	});
}
									


function showDiv(hidetext, showtext, clickid, divid, scroll) {
	$(clickid).empty().append(showtext)
	$(clickid).unbind();
	$(clickid).click(function (e) { 
		e.preventDefault();
		hideDiv(hidetext, showtext, clickid, divid, scroll) 
	});
	$(divid).fadeIn(400,function() {
		$.scrollTo({top:scroll, left:0},400);
	});
}

function hideDiv(hidetext, showtext, clickid, divid, scroll) {
	$(clickid).empty().append(hidetext)
	$(clickid).unbind();
	$(clickid).click(function (e) { 
		e.preventDefault();
		showDiv(hidetext, showtext, clickid, divid, scroll) 
	});
	$.scrollTo({top:0, left:0},400,{ onAfter:function() {
		$(divid).fadeOut();
	}});

}



function getContentPosX() {
	result = getWidth() - 604 - 200;
	if (result < 0) return 10;
	else return result;
}

