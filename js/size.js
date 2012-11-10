 /**
  * Get size of browser window
  */
function getWidth() {
  var myWidth = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    myWidth = document.body.clientWidth;
  }
  return myWidth;
}

function getHeight() {
  var myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    myHeight = document.body.clientHeight;
  }
  return myHeight;
}

function getImageSize(img) {
	var h = getHeight() - 20; // 20 is arbitrary margin
	var w = getWidth() - 40; // 40 is arbitrary margin as well
	var o = img.orientation;
	var r = img.ratio;
	var maxH = 600;
	var maxW = 800;
	var result = new Object();

	if ((o == "v" && h > 960 && w > 960/r) || (o == "h" && w > 1280 && h > 1280*r)) {
		result.size = 'X2';
		maxH = 960;
		maxW = 1280;
	} else if ((o == "v" && h > 768 && w > 768/r) || (o == "h" && w > 1024 && h > 1024*r)) {
		result.size = 'XL';
		maxH = 768;
		maxW = 1024;
	} else if ((o == "v" && h > 600 && w > 600/r) || (o == "h" && w > 800 && h > 800*r)) {
		result.size = 'L';
		maxH = 600;
		maxW = 800;
	} else {
		result.size = 'M';
		maxH = 450;
		maxW = 600;
	}

	if (o == "v") {
		result.width = Math.floor(maxH / r);
		result.height = maxH;
	} else {
		result.width = maxW;
		result.height = Math.round(maxW * r);
	}

	var end = "-" + result.size + ".jpg";
	result.url = img.url.replace("-L.jpg", end);
	result.orientation = img.orientation;

	return result;
}

function reloadWithSize() {
	var h = getHeight();
	var w = getWidth();

	setCookie("width", w, 1);
	setCookie("height", h, 1);

	// Check that cookie is set and if not, use GET
	if (getCookie("width") == "") {
		var parts = window.location.href.split("#");
		var hash = (parts.length > 1) ? "#" + parts[1] : "";
		var url = parts[0] + "&h=" + h + "&w=" + w + hash;
		window.location.href=url;
	}

	// reload with cookies set
	window.location.reload();
}

function setCookie(c_name,value,expiredays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
}

function getCookie(c_name) {
	if (document.cookie.length>0)
	{
		c_start=document.cookie.indexOf(c_name + "=");
		if (c_start!=-1)
		{
			c_start=c_start + c_name.length+1;
			c_end=document.cookie.indexOf(";",c_start);
			if (c_end==-1) c_end=document.cookie.length;
			return unescape(document.cookie.substring(c_start,c_end));
		}
	}
	return "";
}

function setCookie(c_name,value,expiredays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
}

function getCookie(c_name) {
	if (document.cookie.length>0)
	{
		c_start=document.cookie.indexOf(c_name + "=");
		if (c_start!=-1)
		{
			c_start=c_start + c_name.length+1;
			c_end=document.cookie.indexOf(";",c_start);
			if (c_end==-1) c_end=document.cookie.length;
			return unescape(document.cookie.substring(c_start,c_end));
		}
	}
	return "";
}
