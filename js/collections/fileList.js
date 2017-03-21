var app = app || {};

	app.FileList = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.File,
		//url: "filesOutput.json",				//test without DB
		url: "api/app.php",
		parse: function(response) {
			return _.map(response, function(item, index) {
				return {
					id: item.id,
					folderID: item.folder_id,
					name: item.name,
					machineName: item.machine_name,
					type: item.type,
					path: item.path,
					dateCreated: item.date_created
				};
			});
		}
	});