// From https://github.com/jmaurer/jquery-smugmug
// all credits goes to J Maurer. I've just modified the code a little
define(["jquery"], function($) {


	smugmug = function() {
		alert("Smugmug Rocks");
	}

	smugmug.APIVersion = "1.2.2";	
	smugmug.endPoint = {
		"1.2.0": "http://api.smugmug.com/hack/json/1.2.0/",
		"1.2.1": "http://api.smugmug.com/services/api/json/1.2.1/",
		"1.2.2": "https://secure.smugmug.com/services/api/json/1.2.2/"
		//"1.2.2": "http://api.smugmug.com/services/api/json/1.2.2/"
	};

	smugmug.APIKey = "CXsQWfZPNH6Tw6k0MpbTdHJAHcs9MJfG";
	smugmug.session_id = "XXX";

	smugmug.apiCall = function(method, params, callback, use_https) {
		params.method = method;
		params.APIKey = smugmug.APIKey;

		if (smugmug.session_id != "XXX") {
			params.SessionID = smugmug.session_id;
		}

		var url = smugmug.endPoint[smugmug.APIVersion];
		url += "?";
		url += $.param(params);

		if (smugmug.APIVersion > "1.2.1") url += "&Callback=?";
		else url += "&JSONCallback=?";
		//url += "&JSONCallback=?";

		if (use_https) url = url.replace(/^http:/, "https:");

		// jQuery.getJSON(url, callback);
		jQuery.get(url, null, callback, 'jsonp');
	};

	$.each([
		"albums.applyWatermark",
		"albums.changeSettings",
		"albums.create",
		"albums.delete",
		"albums.get",
		"albums.getInfo",
		"albums.removeWatermark",
		"albums.reSort",

		"albumtemplates.changeSettings",
		"albumtemplates.create",
		"albumtemplates.delete",
		"albumtemplates.get",

		"auth.checkAccessToken",
		"auth.getAccessToken",
		"auth.getRequestToken",

		"categories.create",
		"categories.delete",
		"categories.get",
		"categories.rename",

		"communities.get",

		"family.add",
		"family.get",
		"family.remove",
		"family.removeAll",

		"friends.add",
		"friends.get",
		"friends.remove",
		"friends.removeAll",

		"images.applyWatermark",
		"images.changePosition",
		"images.changeSettings",
		"images.crop",
		"images.delete",
		"images.get",
		"images.getEXIF",
		"images.getInfo",
		"images.getURLs",
		"images.removeWatermark",
		"images.rotate",
		"images.upload",
		"images.uploadFromURL",
		"images.zoomThumbnail",

		"login.anonymously",
		"login.withHash",
		"login.withPassword",

		"logout",

		"products.get",

		"sharegroups.albums.add",
		"sharegroups.albums.get",
		"sharegroups.albums.remove",
		"sharegroups.create",
		"sharegroups.delete",
		"sharegroups.get",
		"sharegroups.getInfo",

		"styles.getTemplates",

		"subcategories.create",
		"subcategories.delete",
		"subcategories.get",
		"subcategories.getAll",
		"subcategories.rename",

		"themes.get",

		"users.getDisplayName",
		"users.getTree",

		"watermarks.changeSettings",
		"watermarks.create",
		"watermarks.delete",
		"watermarks.get",
		"watermarks.getInfo"

	], function() {
		var method = this + "";
		var pos = smugmug;
		var minfo = method.split(".");
		var mname = minfo.pop();

		while (chunk = minfo.shift())
		{
			if (!pos[chunk])
			{
				// console.log("build: " + chunk);
				pos[chunk] = {};
			}
			pos = pos[chunk];
		}

		pos[mname] = function(params, callback) {
			if (!params) params = {};
			return smugmug.apiCall("smugmug." + method, params, callback);
		};
	});

	smugmug.login.withPassword = function(email, pass, callback) {
		if (typeof(email) == "object")
		{
			callback = email.callback;
			pass = email.Password;
			email = email.EmailAddress;	
		}

		smugmug.apiCall("smugmug.login.withPassword", {
			EmailAddress: email,
			Password: pass
		}, function(data) {
			smugmug.session_id = data.Login.Session.id;
			if (callback) callback();
		}, true);
	};

	smugmug.login.withHash = function(email, hash, callback) {
		if (typeof(email) == "object")
		{
			callback = email.callback;
			hash = email.PasswordHash;
			email = email.EmailAddress;	
		}

		smugmug.apiCall("smugmug.login.withPassword", {
			EmailAddress: email,
			PasswordHash: hash
		}, function(data) {
			smugmug.session_id = data.Login.Session.id;
			if (callback) callback();
		}, true);
	};

	smugmug.login.anonymously = function(callback) {
		smugmug.apiCall("smugmug.login.anonymously", {}, function(data) {
			smugmug.session_id = data.Login.Session.id;
			if (callback) callback();
		}, true);
	};


	// Return the finished object
	return smugmug;

});

