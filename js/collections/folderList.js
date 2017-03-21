var app = app || {};

	app.FolderList = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.Folder,
		//url: "foldersOutput.json",		//test without DB
		url: "api/app.php",
		parse: function(response) {
			return _.map(response, function(item, index) {
				return {
					id: item.id,
					name: item.name,
					machineName: item.machine_name
				};
			});
		},
		comparator: "name"
	});