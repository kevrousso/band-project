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
			this.$username = this.$form.find("#username");
			this.$pass = this.$form.find("#pass");
			this.$submitBtn = this.$form.find("input[type=submit]");
			this.$invalid = this.$form.find(".invalid");
			this.$error = this.$invalid.find(".error");
			this.$spinner = this.$el.find(".spinner");

			this.isLogguedIn();
			return this;
		},
		isLogguedIn: function() {
			var that = this;
			app.utils.postData("isLogguedIn", {}, function(data, textStatus, jqXHR) {
				data = data !== "" ? JSON.parse(data) : false;
				if (data) {
					//init Navigation View
					NavView = new app.NavView();
					ConvoView = new app.ConvoView({user: data});
				} else {
					that.$el.show();
					return false;
				}
			});
		},
		validate: function() {
			var that = this,
				username = this.$username.val(),
				pass = this.$pass.val();

			this.$invalid.fadeOut('fast');
			this.$spinner.fadeIn("fast", function() {
				app.utils.postData("login", {username: username, pass: pass}, 
					function(data, textStatus, jqXHR) {
						that.$spinner.fadeOut("slow", function() {
							data = JSON.parse(data);
							if (!data.invalid) {
								that.$el.fadeOut(250, function() {
									//init Navigation View
									NavView = new app.NavView();
									ConvoView = new app.ConvoView({user: data});
								});
							} else {
								that.showErrorMsg(data);
							}
						});
					}
				);
			});
			return false;
		},
		//@param data: Object
		showErrorMsg: function(data) {
			var msg = "", $el, invalid = data.invalid;
			if (invalid) {
				if (invalid === "username") {
					$el = this.$username;
				} else if (invalid === "password") {
					$el = this.$pass;
				}
				$el[0].setSelectionRange(0, $el.val().length);
				$el.focus();
				this.$error.text("Invalid "+ app.utils.capitalize(invalid));
				this.$invalid.fadeIn("fast").css("display", "table");
			}
		}
	});