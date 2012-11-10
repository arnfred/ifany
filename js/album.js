define(["domReady!", "size", "jquery", "smugmug", "history", "cookie"], function(domReady, size, $, smugmug, history, cookie) {

	// Init album
	album = {};

	album.display = function() {

		// Set everything that needs to be set, and make sure to update it on resize
		onResizeAndLoad();

		// Check if we want to navigate to a specific image
		if (document.URL.split("&img").length > 1) openOverlay(window.location.hash.substr(1));

		// Make sure we load the EXIF data for each image
		getEXIF();

		// Fill in info when hovering over an image
		showImgInfo();

		// Initiate overlay
		initOverlay();

		// Goes through all thumbnails and makes sure a click will open full size image
		clickThumb();

		// When the next or prev arrows are clicked in the overlay
		onImageChange();

		// Cache all images
		cacheAll();

	}


	// Load image exif data
	function getEXIF() {
		smugmug.login.anonymously(function() {
			var mouseoverSet = false;
			$(".albumBox").each(function() { 
				var key = $(this).attr("key"); 
				var id = $(this).attr("id");
				smugmug.images.getEXIF({ImageID:id,ImageKey:key}, function(data) {

					// Focal Length
					var lens = data["Image"]["FocalLength"].split('/');
					$("#" + id).attr("lens",lens[0]/lens[1] + " mm");

					// Aperture
					var fstop = data["Image"]["Aperture"].split('/');
					$("#" + id).attr("aperture","f " + fstop[0]/fstop[1]);

					// Shutter speed
					$("#" + id).attr("shutter",data["Image"]["ExposureTime"] + " s");

						// Date
					$("#" + id).attr("date",data["Image"]["DateTimeOriginal"]);

					// Select the first image
					if (!mouseoverSet) {
						$(".albumBox").first().children("img").mouseover();
						mouseoverSet = true;
					}
				});
			});
		});
	}

	// On resize do the following:
	function onResizeAndLoad() {

		// Set position of albums and info
		setContentPos();

		$(window).resize(function() {

			// Set content position
			setContentPos();

			// Change the size of the image on display and it's caption
			setImageSize();
			setCaptionSize();

			// including cookies
			cookie.set("width", size.getWidth());
			cookie.set("height", size.getHeight());
		});
	}

	function setContentPos() {

		var factor = 0.6;
		var margin = (size.getWidth() - $(".albums").width() - $(".info").width()) * factor;
		if (margin < 20) margin = 20;

		$(".info").css("margin-left", margin);
		$(".albums").css("margin-left", margin + $(".info").width());
	}

	// Make images show information when mouse-over
	function showImgInfo() {
		$(".albumBox").each(function() { 

			// Record variables
			var id = $(this).attr("id");

			// When mouse enters, do...
			$(this).children("img").mouseover(function () {

				// Color of old current photo to normal
				$(".current").removeClass("current");

				// Color frame of photo white
				$(this).addClass("current");

				// Get date
				var mdate = $("#" + id).attr("date");
				var date = mdate ? mdate.split(" ")[0] : "";
				var d = parseISO8601(date);

				// Focal Length, Aperture, Shutter speed, Date, Download link and description
				$("#iiFocalLength div.iiField").text($("#" + id).attr("lens"));
				$("#iiAperture div.iiField").text($("#" + id).attr("aperture"));
				$("#iiShutterSpeed div.iiField").text($("#" + id).attr("shutter"));
				$("#iiDateTaken div.iiField").text(d.format('longDate'));
				$("#iiOriginal div.iiField a").attr("href",$("#" + id).attr("original"));
				$("#iiDescription").text($("#" + id).attr("desc"));

				// Fadein the original box
				$(".imageStat").fadeIn(300);
			});
		});
	}

	/*
	 * Create links to overlay
	 */
	function initOverlay() {

		// Make image close when esc is pressed and open on enter
		$(document).keyup(function(e) { 
			// If we capture escape (27)
			if (e.which == 27) { closeOverlay(); }
			// Or enter
			if (e.which == 13) { $(".current").parent().parent().click(); }
		});

		// Make arrow keys work on album
		navigateAlbums();

		// Make it close when image is clicked
		$("#display").click(function() { closeOverlay(); });
	}

	/*
	 * Activate keys for navigating in between album thumbnails
	 */
	function navigateAlbums() {

		// Move to next image or prev image on arrow key press
		$(window).keydown(function(e){

			// For when we have the display window open
			if ($("#display").is(":visible")) {
				if (e.keyCode == 37 || e.keyCode == 8) $("#navPrev").find("a").click();
				else if ((e.keyCode == 39) || (e.keyCode == 32) || (e.keyCode == 13)) $("#navNext").find("a").click();
			}

			// For when it's closed
			else {

				var id = $(".current").parent().attr("id");
				var pa = $("#" + id).parent();
				// Left
				if (e.keyCode == 37) changeToThumb(e,pa.prev().find("img"));
				// Up
				else if (e.keyCode == 38) changeToThumb(e,pa.prev().prev().prev().find("img"));
				// Right
				else if (e.keyCode == 39) changeToThumb(e,pa.next().find("img"));
				// Down
				else if (e.keyCode == 40) changeToThumb(e,pa.next().next().next().find("img"));
			}
		});
	}

	function changeToThumb(e,elem) {
		if (elem.length > 0) {
			scroll = elem.parent().position().top - 100;
			$("body").animate({ scrollTop: scroll }, 400)
			//$.scrollTo(elem, 250, { axis:'y',offset:-100 });
			e.preventDefault();
			elem.mouseover();
		}
	}

	function clickThumb() {

		// When a thumbnail is clicked, the corresponding overlay is opened
		$(".albumLink").click(function(e) {
			openOverlay($(this).children(".albumBox").attr("index"));
			e.preventDefault();
			return false;
		});

	}

	// When page is loaded we need to prepare click functions to open overlay
	function openOverlay(index) {

		// Get box with info
		var albumBox = $(".albumBox[index=" + index +"]");

		// If albumBox doesn't exist, abort
		if (albumBox[0] == undefined) return false;

		// Get url and id
		var s = albumBox.parent().attr("href"); 
		var id = albumBox.attr("id");

		// Change to new image
		$("#display").attr('src',s)

		// Hide scrollbar
		$("body").css("overflow-y","hidden");

		// Change id of image
		$("#display").attr("imgid", id);

		// Update size of new image
		setImageSize();

		// Then fade in overlay
		$("#displaybox").fadeIn(); 

		// Set caption
		updateCaption(albumBox);
		$("#caption").fadeIn();

		// Get the new url and push to history
		var newUrl = document.URL.split("&img")[0] + "&img=" + index;
		history.pushState(null, null, newUrl);
	}

	// What to do when the overlay is closed
	function closeOverlay() {

		// Fade out image
		$("#displaybox").fadeOut(function () {

			// Show scrollbar
			$("body").css("overflow-y","visible");
		});

		// Hide caption
		$("#caption").css("display:none");

		// Get the new url and push to history
		var newUrl = document.URL.split("&img")[0];
		history.pushState(null, null, newUrl);

		// Update url
		//window.history.replaceState({}, document.title, originalURL);
		//window.location.hash = "";

	}

	// Add caption
	function setCaptionSize() {

		// Get variables
		var imgW	= $("#display").attr("width");
		var imgH	= $("#display").attr("height");

		// Set width
		$("#caption").css("width", imgW);
		$("#captionText").css("width", imgW - 60);

		// Set link height and margin
		$(".nav").css("height", $("#captionText").height());
		$(".nav p").css("line-height", $("#captionText").height() + "px");

		var left	= Math.ceil((size.getWidth() - imgW) / 2);
		var height = size.getHeight();
		var caption = $("#caption").height();
		// Set horizontal and vertical position
		var top  = parseInt(size.getHeight() - imgH) / parseInt(2) + parseInt(imgH) - parseInt($("#caption").height());
		$("#caption").css("left", left);
		$("#caption").css("top", top);
	}

	// Update caption
	function updateCaption(albumbox) {

		// Set caption text
		$("#captionText p").text(albumbox.attr("desc"));

		// Get prev and next links
		var albumlink	= $(albumbox).parent();
		var p			= $(albumlink).prev(".albumLink");
		var n			= $(albumlink).next(".albumLink");
		var pid			= p.find(".albumBox").attr("id");
		var nid			= n.find(".albumBox").attr("id");

		// If Previous link exists
		if (p.length != 0)	$("#navPrev p a").attr("href", p.attr("href")).attr("imgid",pid).css("visibility","visible");
		else				$("#navPrev p a").css("visibility","hidden");

		// If Next link exists
		if (n.length != 0)	$("#navNext p a").attr("href", n.attr("href")).attr("imgid",nid).css("visibility","visible");
		else				$("#navNext p a").css("visibility","hidden");

		// Set size in the end
		setCaptionSize();
	}




	// Function to correctly determine the size of the image in the displaybox
	function setImageSize() {

		// Get image id
		var id				= $("#display").attr("imgid");

		// Get data
		var orientation		= $("#" + id).attr("orientation");
		var imgH			= $("#" + id).attr("realHeight");
		var imgW			= $("#" + id).attr("realWidth");
		var screenH			= size.getHeight() - 4;
		var screenW			= size.getWidth() - 4;

		// Get screen and image ratio
		// The smaller the rate, the flatter the image and screen space is
		var screenRatio		= size.getHeight()/size.getWidth();
		var imageRatio		= imgH/imgW;

		// Now figure out if the screen is flatter than the image
		if (screenRatio < imageRatio)	var shrink = screenH/imgH; // restriction is vertical
		else							var shrink = screenW/imgW;

		// Calculate the new image size
		var newH			= Math.floor(imgH*shrink);
		var newW			= Math.floor(imgW*shrink);

		// Check if we are going beyond original image size
		if (newH > imgH) {
			newH = imgH;
			newW = imgW;
		}

		// Now that we know with how much the image should be resized, we can do it
		$("#display").attr("height", newH);
		$("#display").attr("width", newW);

		// Set top margin
		var topmargin		= (screenH - newH)/2;
		$("#display").css("margin-top", topmargin);

	}


	function onImageChange() {

		$(".nav").click(function (e) {
			// Make sure the link doesn't open
			e.preventDefault();

			// Now get the id, url and albumbox
			var id			= $(this).find("a").attr("imgid");
			var albumBox	= $("#" + id);
			var index		= albumBox.attr("index");

			imageChange(index);

			// Get the new url and push to history
			var newUrl = document.URL.split("&img")[0] + "&img=" + index;
			history.pushState(null, null, newUrl);

			// Update url
			// window.history.replaceState({}, document.title, originalURL + "&img=" + index);
			// window.location.hash = '#' + index;
		});
	}

	function imageChange(index) {

		// Get box with info
		var albumBox = $(".albumBox[index=" + index +"]");
		var id = albumBox.attr("id");

		// Get url
		var url = albumBox.parent().attr("href"); 

		// Make things change in the background
		albumBox.find("img").mouseover();

		// Update display id
		$("#display").attr("imgid",id);

		// Set image and caption
		$("#display").hide().attr("src", url);
		setImageSize();
		updateCaption(albumBox);
		$("#display").show();

		// Update caption
		updateCaption(albumBox);
	}


	function cacheAll() {
		$(window).load(function () {
			$(".albumBox").each(function () { cache($(this).attr("id")); });
		});
	}

	function cache(id) {
		var url	= $("#" + id).parent().attr("href");
		$("#display").clone().attr("id","cache" + id).attr("imgid",id).attr("src",url).appendTo("#cache");
	}

	/**Parses string formatted as YYYY-MM-DD to a Date object.
	 * If the supplied string does not match the format, an 
	 * invalid Date (value NaN) is returned.
	 * @param {string} dateStringInRange format YYYY-MM-DD, with year in
	 * range of 0000-9999, inclusive.
	 * @return {Date} Date object representing the string.
	 */
	function parseISO8601(dateStringInRange) {
		var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,
		date = new Date(NaN), month,
		parts = isoExp.exec(dateStringInRange);

		if(parts) {
			month = +parts[2];
			date.setFullYear(parts[1], month - 1, parts[3]);
			if(month != date.getMonth() + 1) {
				date.setTime(NaN);
			}
		}
		return date;
	}


	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */

	var dateFormat = function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			if (isNaN(date)) return "No Date"

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
		d = date[_ + "Date"](),
		D = date[_ + "Day"](),
		m = date[_ + "Month"](),
		y = date[_ + "FullYear"](),
		H = date[_ + "Hours"](),
		M = date[_ + "Minutes"](),
		s = date[_ + "Seconds"](),
		L = date[_ + "Milliseconds"](),
		o = utc ? 0 : date.getTimezoneOffset(),
		flags = {
			d:    d,
			dd:   pad(d),
			ddd:  dF.i18n.dayNames[D],
			dddd: dF.i18n.dayNames[D + 7],
			m:    m + 1,
			mm:   pad(m + 1),
			mmm:  dF.i18n.monthNames[m],
			mmmm: dF.i18n.monthNames[m + 12],
			yy:   String(y).slice(2),
			yyyy: y,
			h:    H % 12 || 12,
			hh:   pad(H % 12 || 12),
			H:    H,
			HH:   pad(H),
			M:    M,
			MM:   pad(M),
			s:    s,
			ss:   pad(s),
			l:    pad(L, 3),
			L:    pad(L > 99 ? Math.round(L / 10) : L),
			t:    H < 12 ? "a"  : "p",
			tt:   H < 12 ? "am" : "pm",
			T:    H < 12 ? "A"  : "P",
			TT:   H < 12 ? "AM" : "PM",
			Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}();

	// Some common format strings
	dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};

	// Internationalization strings
	dateFormat.i18n = {
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};

	// For convenience...
	Date.prototype.format = function (mask, utc) {
		return dateFormat(this, mask, utc);
	};


	// Return the album
	return album

});
