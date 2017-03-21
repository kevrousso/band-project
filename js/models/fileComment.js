 var app = app || {};

	app.FileComment = Backbone.Model.extend({
		defaults: {
			id: 0,
			fileID: 0,
			username: "",
			comment: "",
			datetime: ""
		}
	});