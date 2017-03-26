var app = app || {};

app.AppView = Backbone.View.extend({
	el: "#page-wrap",
	events: {
		'click a.logout': 'logout'
	},
	initialize: function () {
		var that = this;

		config = app.Config;
		utils = app.Utils;

		//disable blockUI default css
		$.blockUI.defaults.css = {};

		this.$headerContainer = this.$el.find('.header-container');
		this.$container = this.$el.find("#container");
		this.$footerContainer = $('.footer-container');

		AppRouter = new app.Router();
		LoginView = new app.LoginView({
			//TODO: so wrong... 
			//		should throw an event in the vent instead,
			//		and the appView should listen to it
			appView: this
		});

		//set proper heights on init
		this.resize();

		this.loadThemeCSS(config.theme);

		$(window).on("resize", _.bind(this.resize, this));
		$(window).bind("beforeunload", this.updateStatus);
	},
	resize: function() {
		var hdrHeight = this.$headerContainer.outerHeight(),
			ftrHeight = this.$footerContainer.outerHeight(),
			newHeight = window.innerHeight - hdrHeight - ftrHeight;

		this.$container.css("min-height", newHeight);
	},
	logout: function() {
		utils.postData("logout", {}, function(data, textStatus, jqXHR) {
			if (textStatus === "success") {
				window.location = "index.html";
			}
		});
	},
	//triggered when user closes tab/window
	updateStatus: function() {
		utils.postData("updateStatus", {status: "offline"});
	},
	loadThemeCSS: function(href) {
		if (config.theme !== "") {
			//append theme to page
			$("head").append("<link rel='stylesheet' type='text/css' href='"+ href +"' />");
		}
	}
});