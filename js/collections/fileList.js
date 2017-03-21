var app = app || {};

	app.FileList = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.File,
		//url: "filesOutput.json",				//test without DB
		url: "api/app.php",
		comparator: "name"
	});