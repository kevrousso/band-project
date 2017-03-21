;(function ($, window, undefined) {
	$(function() {
		var $container = $("#container"),
			$headerContainer = $('.header-container'),
			$footerContainer = $('.footer-container'),
			$loginContainer = $('.login-container');
		
		$loginContainer.show();
		var resize = function() {
			var hdrHeight = $headerContainer.outerHeight(),
				ftrHeight = $footerContainer.outerHeight(),
				newHeight = window.innerHeight - hdrHeight - ftrHeight;

			$container.css("min-height", newHeight);
		};
		resize();
		$(window).on("resize", resize);

		$("#newUser").submit(function() {
			var username = $("#username").val(),
				password = $("#password").val();
			app.utils.postData("createUser", { username: username, password: password }, function(data, textStatus, jqXHR) {
				var data = data !== "" ? JSON.parse(data) : false, 
					error = data.error, 
					$invalid = $(".invalid");
				
				$invalid.html("");
				
				if (error) {
					$invalid
						.html("<span class='message'>"+data.error+"</span>")
						.fadeIn("fast").css("display", "table");
				} else {
					window.location = "index.html";
				}
			});
			return false;
		});
	});
})(jQuery, this);