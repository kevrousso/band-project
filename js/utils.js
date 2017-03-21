var app = app || {};
app.Utils = {
	//@param action: String
	//@param data: String
	//@param callback: Function
	postData: function(action, data, callback) {
		var that = this;
		data = typeof data === "object" ? JSON.stringify(data) : data;
		$.ajax({
			url: 'api/app.php',
			type: 'POST',
			data: {action: action, _data: data},
			success: function(response, textStatus, jqXHR) {
				that.handleError(response, textStatus, jqXHR);
				if (_.isFunction(callback)) {
					callback(response, textStatus, jqXHR);
				}
			},
			error: function(response, textStatus, jqXHR) {
				that.handleError(response, textStatus, jqXHR);
			}
		});
	},
	//Took from: https://gist.github.com/hoanvuso/502e6d5c084ea7b7763b
	//@param views: String or Array
	//@param callback: function
	loadTemplate: function(views, callback) {
		var deferreds = [];
		views = typeof views === "array" ? views : [views];
		$.each(views, function(index, view) {
			if (app[view]) {
				deferreds.push($.get('tpl/' + view + '.html', function(data) {
					app[view].prototype.template = _.template(data);
				}));
			} else {
				alert(view + " not found");
			}
		});
		$.when.apply(null, deferreds).done(callback);
	},
	
	//Took from: https://gist.github.com/hoanvuso/502e6d5c084ea7b7763b
	//CHECK OUT ALSO: https://blueimp.github.io/jQuery-File-Upload

	//TODO: use this instead of submitting the form for addFile
	uploadFile: function (action, form, callback) {
		var that = this;
		var data = new FormData(form);
		data.append('action', action);
		$.ajax({
			url: 'api/app.php',
			type: 'POST',
			data: data,
			enctype: 'multipart/form-data',
			processData: false,
			cache: false,
			contentType: false,
			success: function(response, textStatus, jqXHR) {
				that.handleError(response, textStatus, jqXHR);
				if (_.isFunction(callback)) {
					callback(response, textStatus, jqXHR);
				}
			},
			error: function(response, textStatus, jqXHR) {
				that.handleError(response, textStatus, jqXHR);
			}
		});
	},
	handleError: function(response, textStatus, jqXHR) {
		response = this.isJSON(response) ? JSON.parse(response) : response;
		if (response.message) {
			//TODO: add severity levels for errors
			bootbox.alert('<span class="warning">'+response.message+'</span>');
			console.log(response.message);
		}
		if (response.error && _.isString(response.error)) {
			//TODO: add severity levels for errors
			bootbox.alert('<span class="error">'+response.error+'</span>');
			console.warn(response.error);
		}
		if (response.responseText) {
			//TODO: add severity levels for errors
			bootbox.alert(response.responseText);
			console.log(response.responseText);
		}
	},
	//@param str: String
	cleanUpSpecialChars: function(str) {
		return str.replace(/[ÀÁÂÃÄÅ]/g, "A").replace(/[àáâãäå]/g, "a")
				  .replace(/[ÈÉÊË]/g, "E").replace(/[èéêë]/g, "e")
				  .replace(/[ÌÍĨÎÏ]/g, "I").replace(/[ìíĩîï]/g, "i")
				  .replace(/[ÒÓÔÕÖ]/g, "O").replace(/[òóôõö]/g, "o")
				  .replace(/[ÙÚÛŨÜ]/g, "U").replace(/[ùúûũü]/g, "u")
				  .replace(/[ÝŸ]/g, "Y").replace(/[ýÿ]/g, "y")
				  .replace(/ /g, "_");
	},
	isJSON: function(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	},
	//Not used
	bytesToSize: function(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) {
			return '0 Byte';
		}
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	},

	showLoadingBox: function() {
		$.blockUI({ message: '<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>' });
	},
	hideLoadingBox: function() {
		$.unblockUI();
	}
}
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}