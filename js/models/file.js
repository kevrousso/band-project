 var app = app || {};

	app.File = Backbone.Model.extend({
		defaults: {
			id: 0,
			folderID: 0,
			name: 'File name',
			machineName: 'File_Name',
			path: '',
			type: 'file',	//file, audio, video, image
			dateCreated: ''
		}
	});