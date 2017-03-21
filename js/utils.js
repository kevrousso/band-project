var app = app || {};
	app.utils = {
		//@param action: string
		//@param data: string
		//@param callback: function
		postData: function(action, data, callback) {
			$.ajax({
				url: 'app.php',
				type: 'POST',
				data: {action: action, _data: data},
				success: function(data, textStatus, jqXHR) {
					if (callback) {
						callback(data, textStatus, jqXHR);
					}
				}
			});
		},
		//@param views: string or array
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
		//TODO: use this instead of submitting the form for addFile
		uploadFile: function (file, callbackSuccess) {
			var self = this;
			var data = new FormData();
			data.append('file', file);
			$.ajax({
				url: 'api/upload.php',
				type: 'POST',
				data: data,
				processData: false,
				cache: false,
				contentType: false
			})
			.done(function () {
				console.log(file.name + " uploaded successfully");
				callbackSuccess();
			})
			.fail(function () {
				self.showAlert('Error!', 'An error occurred while uploading ' + file.name, 'alert-error');
			});
		},
		cleanUpSpecialChars: function(str) {
			return str.replace(/[ÀÁÂÃÄÅ]/g, "A").replace(/[àáâãäå]/g, "a")
					  .replace(/[ÈÉÊË]/g, "E").replace(/[èéêë]/g, "e")
					  .replace(/[ÌÍĨÎÏ]/g, "I").replace(/[ìíĩîï]/g, "i")
					  .replace(/[ÒÓÔÕÖ]/g, "O").replace(/[òóôõö]/g, "o")
					  .replace(/[ÙÚÛŨÜ]/g, "U").replace(/[ùúûũü]/g, "u")
					  .replace(/[ÝŸ]/g, "Y").replace(/[ýÿ]/g, "y")
					  .replace(/ /g, "_");
		}
	}