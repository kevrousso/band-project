var app = app || {};

app.LoginView = Backbone.View.extend({
	el: ".login-container",
	events: {
		"submit form": "login"
	},
	initialize: function (options) {
		var that = this;

		config = app.Config;
		utils = app.Utils;

		this.appView = options.appView;

		this.$form = this.$el.find('form');
		this.$username = this.$form.find("#username");
		this.$password = this.$form.find("#password");
		this.$rememberMe = this.$form.find("#rememberMe");
		this.$submitBtn = this.$form.find("input[type=submit]");
		this.$warning = this.$form.find(".warning");
		this.$invalid = this.$form.find(".invalid");

		this.isLogged();
		
		return this;
	},
	isLogged: function() {
		var that = this;
		utils.postData("isLogged", {}, function(username, textStatus, jqXHR) {
			if (username) {
				//init Navigation View
				NavView = new app.NavView({
					appView: that.appView,
					user: username
				});
				FileCommentsView = new app.FileCommentsView({user: username});
			} else {
				//not logged-in, show the form
				that.$el.show();
				return false;
			}
		});
	},
	login: function() {
		var that = this,
			username = $.trim(escape(this.$username.val())),
			password = this.$password.val(),
			rememberMe = this.$rememberMe.is(":checked");

		this.$invalid.fadeOut('fast');
		
		utils.showLoadingBox();

		utils.postData("login", {username: username, password: password, rememberMe: rememberMe}, 
			function(response, textStatus, jqXHR) {
				utils.hideLoadingBox();

				response = utils.isJSON(response) ? JSON.parse(response) : response;
				if (!response.error) {
					that.$el.fadeOut(250, function() {
						//init Navigation View
						NavView = new app.NavView({
							appView: that.appView,
							user: response
						});
						FileCommentsView = new app.FileCommentsView({user: response});
					});
				} else {
					that.updateMessage(response);
				}
			}
		);
		return false;
	},
	//@param data: Object
	updateMessage: function(data) {
		var msg = "", $el, message = data.message, error = data.error;
		this.$username.focus();
		if (message) {
			//append the messages

			//for (var i = 0; i < data.errors.length; i++) {
			this.$warning.html("");
			this.$warning.html("<span class='message'>"+message+"</span>");
			//};
			
			this.$warning.fadeIn("fast").css("display", "table");
		} else if (error) {
			//append the errors

			//for (var i = 0; i < data.errors.length; i++) {
			this.$invalid.html("");
			this.$invalid.append("<span class='error'>"+error+"</span>");
			//};
			
			this.$invalid.fadeIn("fast").css("display", "table");
		} else {
			this.$warning.html("").hide();
			this.$invalid.html("").hide();
		}
	}
});