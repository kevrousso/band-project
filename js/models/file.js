 var app = app || {};

	app.File = Backbone.Model.extend({
		defaults: {
			id: 0,
			name: 'File name',
			machineName: 'File_Name',
			folderID: 0,
			type: 'file',	//file, audio, video, image
			content: '',
			dateCreated: ''
		}
	});