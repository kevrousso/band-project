var app = app || {};

	app.FolderList = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.Folder,
		//url: "foldersOutput.json",		//test without DB
		url: "api/app.php",
		comparator: "name"
	});