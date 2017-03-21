var app = app || {};

	app.FileCommentsList = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.FileComment,
		url: "api/app.php"
	});