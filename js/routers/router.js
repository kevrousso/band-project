
app.Router = Backbone.Router.extend({
	routes:{
		'file/:path': 'setFilter'
	},
	setFilter: function( path ) {
		// Set the current filter to be used
		/*if (path) {
			path = path.trim();
		}*/
		//app.FolderRoute = folder + "/" + file || '';
		$('a[href$="'+ path +'"]').closest("li.dir").find("a.hasContent").trigger("click", true);
		$('a[href$="'+ path +'"]').trigger("click", true);
	}
});