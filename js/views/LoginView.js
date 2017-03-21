var app = app || {};

app.LoginView = Backbone.View.extend({
	el: ".login-container",
	events: {
		"submit form": "login"
	},
	initialize: function () {
		var that = this;
		this.$form = this.$el.find('form');
		this.$username = this.$form.find("#username");
		this.$password = this.$form.find("#password");
		this.$rememberMe = this.$form.find("#rememberMe");
		this.$submitBtn = this.$form.find("input[type=submit]");
		this.$warning = this.$form.find(".warning");
		this.$invalid = this.$form.find(".invalid");
		this.$spinner = this.$el.find(".spinner");

		this.isLogged();
		
		return this;
	},
	isLogged: function() {
		var that = this;
		app.utils.postData("isLogged", {}, function(data, textStatus, jqXHR) {
			if (data) {
				//init Navigation View
				NavView = new app.NavView();
				ConvoView = new app.ConvoView({user: data});
			} else {
				//not logged-in, show the form
				that.$el.show();
				return false;
			}
		});
	},
	login: function() {
		var that = this,
			username = this.$username.val(),
			password = this.$password.val(),
			rememberMe = this.$rememberMe.is(":checked");

		this.$invalid.fadeOut('fast');
		//TODO: updateSpinner()
		this.$spinner.fadeIn("fast", function() {
			app.utils.postData("login", {username: username, password: password, rememberMe: rememberMe}, 
				function(data, textStatus, jqXHR) {
					that.$spinner.fadeOut("slow", function() {
						if (app.utils.isJson(data)) {
							data = JSON.parse(data);
						}
						if (!data.error) {
							that.$el.fadeOut(250, function() {
								//init Navigation View
								NavView = new app.NavView();
								ConvoView = new app.ConvoView({user: data});
							});
						} else {
							that.updateMessage(data);
						}
					});
				}
			);
		});
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