var app = app || {};

	app.FileList = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.File,
		url: "filesOutput.json",				//test without DB
		//url: "app.php",
		parse: function(response) {
			return _.map(response, function(item, index) {
				return {
					id: item.id,
					name: item.name,
					type: item.type,
					folderID: item.folder_id,
					content: item.content,
					machineName: item.machine_name,
					dateCreated: item.date_created
				};
			});
		}
	});