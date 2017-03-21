var app = app || {};

	app.FolderList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: app.Folder,

		url: "getFolders.php",
		
		parse: function(response) {
			return response.dirs;
		}
	});