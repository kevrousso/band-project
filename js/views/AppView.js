var app = app || {};

	app.AppView = Backbone.View.extend({
		el: "#container",
		events: {},
		initialize: function () {
			var that = this;

			this.$headerContainer = $('.header-container');
			this.$footerContainer = $('.footer-container');
			this.$logout = this.$headerContainer.find("a.logout");

			this.$logout.on("click", this.logout);
			LoginView = new app.LoginView();

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
		logout: function() {
			app.utils.postData("logout", {}, function(data, textStatus, jqXHR) {
				if (textStatus === "success") {
					window.location = "index.html";
				}
			});
		}
	});