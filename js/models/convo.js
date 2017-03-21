 var app = app || {};

	app.Convo = Backbone.Model.extend({
		defaults: {
			//TODO: make proper defaults
			id: 0,
			userID: 0
		}
	});