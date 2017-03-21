
app.Router = Backbone.Router.extend({
	routes:{
		'uploads/:path': 'urlNav',
		'filter/:type': 'setFilter'
	},
	urlNav: function(path) {
		//alert("GFGXFGXFGZFG")
		NavView.filePath = path;

		$('a[href$="'+ path +'"]').closest("li.dir").find("a.hasContent").trigger("click", true);
		$('a[href$="'+ path +'"]').trigger("click", true);
	},
	setFilter: function(type) {
		NavView.filterType = type;
		NavView.trigger('change:filterByType');
	}
});