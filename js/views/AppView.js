var app = app || {};

	app.AppView = Backbone.View.extend({
		el: "#container",
		events: {},
		initialize: function () {
			var that = this;

			this.$headerContainer = $('.header-container');
			this.$footerContainer = $('.footer-container');

			//init Navigation View
			NavView = new app.NavView({ folder: new app.Folder(), file: new app.File() });

			//set proper heights on init
			this.resize();
			$(window).on("resize", _.bind(this.resize, this));
		},
		resize: function() {
			var hdrHeight = this.$headerContainer.outerHeight(),
				ftrHeight = this.$footerContainer.outerHeight(),
				newHeight = window.innerHeight - hdrHeight - ftrHeight;

			this.$el.css("min-height", newHeight);
		},
	});