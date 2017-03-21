var app = app || {};

	app.LoginView = Backbone.View.extend({
		el: ".login-container",
		events: {
			"submit form": "validate"
		},
		initialize: function () {
			var that = this;

			this.$form = this.$el.find('form');
			this.$username = this.$form.find("#username");
			this.$pass = this.$form.find("#pass");
			this.$submitBtn = this.$form.find("input[type=submit]");
			this.$invalid = this.$form.find(".invalid");
			this.$error = this.$invalid.find(".error");

			this.$spinner = this.$el.find(".spinner");

			this.tries = 0;

			return this;
		},
		validate: function() {
			var that = this,
				username = this.$username.val(),
				pass = this.$pass,
				isValid;

			this.$spinner.fadeIn("fast", function() {
				isValid = true;
				//isValid = app.utils.postData("validUser", {username: username, pass: pass}, function() {
					that.$spinner.fadeOut("slow", function() {
						if (isValid) {
							that.$el.fadeOut(250, function() {
								//init Navigation View
								NavView = new app.NavView({ folder: new app.Folder(), file: new app.File() });
								ConvoView = new app.ConvoView();
							});
						} else {
							that.tries++;
							that.showErrorMsg(that.tries);
						}
					});
				//});
			});
			return false;
		},
		showErrorMsg: function(tries) {
			this.$invalid.show().css("display", "table");
			if (tries >= 2) {
				this.$error.text('YOU ARE INVALID.');
			} else {
				this.$error.text('Invalid credentials, try again.');
			}
		}
	});