var app = app || {};
app.Router = Backbone.Router.extend({
	routes:{
		'' : 'home',
		'uploads/:folder/:file': 'urlNav',
		'filter/:type': 'setFilter'
	},
	home: function () {
		
	},

	urlNav: function(folder, file) {
		NavView.filePath = folder+"/"+file;
		path = NavView.filePath;

		$('a[href$="'+ path +'"]').closest("li.dir").find("a.hasContent").trigger("click", true);
		
		//this calls NavView.showContent() under the hood
		//TODO: Re-factor showContent()
		$('a[href$="'+ path +'"]').trigger("click", true);
	},
	setFilter: function(type) {
		NavView.filterType = type;
		NavView.trigger('change:filterByType');
	}
});