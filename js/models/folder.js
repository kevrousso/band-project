 var app = app || {};

	app.Folder = Backbone.Model.extend({
		defaults: {
			id: 0,
			name: 'Folder name',
			machineName: 'Folder_Name',
			files: []
		}
	});