 var app = app || {};

	app.Convo = Backbone.Model.extend({
		defaults: {
			id: 0,
			fileID: 0,
			username: "",
			comment: "",
			timestamp: ""
		}
	});