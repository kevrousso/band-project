var app = app || {};

	app.ConvoView = Backbone.View.extend({
		el: ".main-container",
		events: {
			'click a.timestamp': 'updateTimestamp',
			'click a.fullscreen': 'toggleFullscreen'
		},
		initialize: function () {
			var that = this;

			this.$el.fadeIn(250).css("display", "table-cell");

			this.$mainContent = $('#mainContent');
			this.$formConvo = $(".addComment");

			this.on("change:updateView", this.updateView, this);

			return this;
		},
		render: function() {
			
			return this;
		},
		updateView: function(data) {
			var html = "", that = this, align = "";
			data.src = data.src.substring(1);
			switch (data.type) {
				case "audio":
					html += '<audio id="player-audio" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>audio</code> element.';
					html += 	'<source src="'+data.src+'" type="audio/mp3">';
					html +=	'</audio>';

					this.$formConvo.show();
					align = "top";
				break;
				case "video":
					html += '<video id="player-video" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>video</code> element.';
					html += 	'<source src="'+data.src+'.mp4" type="video/mp4">';
					html += 	'<source src="'+data.src+'.webm" type="video/webm">';
					html += 	'<source src="'+data.src+'.ogv" type="video/ogg">';
					html +=	'</video>';

					this.$formConvo.show();
					align = "top";
				break;
				case "image":
					html += '<a href="#" class="fullscreen"><img src="'+ data.src +'"/></a><div class="full-img"><a href="#" class="fullscreen"><img src="" alt="" /></a></div>';
					this.$formConvo.show();
					align = "top";
				break;
				case "file":
					html += "<h3 class='noPreview'>No preview availlable</h3>";

					this.$formConvo.hide();
					align = "middle";
				break;
			}
			this.$mainContent.stop(true, true).fadeOut("fast", function() {
				that.$el.css("vertical-align", align);
				that.$mainContent.html("").append(html).stop(true, true).fadeIn();
			});
			// TODO: based on what file has been selected
			//this.updateConversations();
		},
		updateConversations: function() {

		},
		updateTimestamp: function() {
			var time = $(this).text(),
				audioPlayer = $('#player-audio')[0];
			if (audioPlayer.src !== "") {
				audioPlayer.currentTime = this._formatTimestamp(time);	// in seconds
				audioPlayer.play();
			}
		},
		//@param time: string "mi:ss"
		_formatTimestamp: function(time) {
			var ts = time.trim(), minSec = ts.split(":");
			// rule: min * 60 + sec
			return parseInt(minSec[0]) * 60 + parseInt(minSec[1]);
		},
		//TODO: trigger("change:toggleFullScreen")
		toggleFullscreen: function(e) {
			var $this = $(e.target),
				$imgSrc = $this.attr("src"),
				$fullImg = $(".full-img"),
				clientWidth = document.documentElement.clientWidth,
				width = $this.width(),
				height = $this.height(),
				offset = 0.2,
				widthOffset = width * offset,
				heightOffset = height * offset,
				widthTotal = width + widthOffset,
				heightTotal = height + heightOffset;

			if (!this.isFullScreen) {
				$fullImg.find("img").attr("src", $imgSrc).width(widthTotal).height(heightTotal).css({"max-width": clientWidth});
				$fullImg.fadeIn("fast");
				this.isFullScreen = true;
			} else {
				$fullImg.fadeOut("fast");
				this.isFullScreen = false;
			}
			return false;
		}
	});