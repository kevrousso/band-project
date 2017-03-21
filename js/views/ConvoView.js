var app = app || {};

	app.ConvoView = Backbone.View.extend({
		el: ".main-container",
		events: {
			'click a.timestamp': 'updateTimestamp',
			'click a.fullscreen': 'toggleFullscreen',
			'submit': 'postMessage'
		},
		initialize: function (data) {
			var that = this;

			this.user = data.user;
			this.$el.fadeIn(250).css("display", "table-cell");

			this.$title = $('.header-container h1.title');
			this.$mainContent = $('#mainContent');

			this.$noSelection = this.$mainContent.find(".noSelection");

			this.$data = this.$mainContent.find("#data");
			this.$comments = this.$mainContent.find("#comments");
			this.$formConvo = $("#addComment");
			this.$message = this.$formConvo.find("#comment");
			this.$spinner = this.$el.find(".spinner");

			this.collection = new app.ConvoList();
			//load proper template
			app.utils.loadTemplate("ConvoView");

			this.getConversations();

			this.on("change:updateView", this.updateView, this);

			this.updateWelcomeMsg();

			return this;
		},
		//only render when a file is selected
		render: function() {
			var that = this,
				filtered = this.getFilteredByFileID(this.fileID);

			this.filteredList = new app.ConvoList(filtered);

			//render in html
			this.updateConversations();

			return this;
		},
		updateWelcomeMsg: function() {
			this.$title.html("Welcome " + this.user.capitalize() + "!");
		},
		//returns all the conversations
		getConversations: function() {
			var that = this;
			this.collection.fetch({
				data: {action: 'getConversations'},
				type: "POST",
				success: function(model, response) {

				},
				error: function(resp) {
					console.log(resp);
				}
			});
		},
		postMessage: function() {
			var that = this, message = this.$message.val();
			app.utils.postData("postMessage", {username: this.user, fileID: this.fileID, message: message}, 
				function(data, textStatus, jqXHR) {
					if (textStatus === "success") {
						var data = JSON.parse(data);

						//add in models
						var newConvo = new app.Convo({
							id: data.id,
							fileID: data.file_id,
							username: data.username,
							message: data.message,
							timestamp: data.timestamp
						});
						that.collection.models.push(newConvo);
						that.resetForm();
						that.render();
					}
				}
			);
			return false;
		},
		resetForm: function() {
			this.$formConvo.trigger("reset");
		},
		//filter the conversations with the appropriate file_id
		//@param fileID: String
		getFilteredByFileID: function(fileID) {
			var that = this;
			return _.filter(that.collection.models, function(mod) {
				return mod.get("fileID") === fileID;
			});
		},
		//called from NavView
		//@param data: Object {id, src, type}
		updateView: function(data) {
			var html = "", that = this, align = "";
			data.src = data.src.substring(1);

			this.fileID = data.fileID;

			switch (data.type) {
				case "audio":
					html += '<audio id="player-audio" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>audio</code> element.';
					html += 		'<source src="'+data.src+'" type="audio/mp3">';
					html +=	'</audio>';
					this.$formConvo.show();
					align = "top";
				break;
				case "video":
					html += '<video id="player-video" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>video</code> element.';
					html += 		'<source src="'+data.src+'.mp4" type="video/mp4">';
					html += 		'<source src="'+data.src+'.webm" type="video/webm">';
					html += 		'<source src="'+data.src+'.ogv" type="video/ogg">';
					html +=	'</video>';
					this.$formConvo.show();
					align = "top";
				break;
				case "image":
					html += '<a href="#" class="fullscreen"><img src="'+ data.src +'"/></a>';
					html += '<div class="full-img"><a href="#" class="fullscreen"><img src="" alt="" /></a></div>';
					this.$formConvo.show();
					align = "top";
				break;
				case "file":
					html += "<h3 class='noPreview'>No preview availlable</h3>";
					this.$formConvo.hide();
					align = "middle";
				break;
			}
			this.$noSelection.hide();
			this.$mainContent.fadeOut(0, function (){
				//TODO: updateSpinner()
				that.$spinner.show().css("display", "table-cell");

				//set proper align to conversations el
				that.$el.css("vertical-align", align);

				//reset data elem and append new one
				that.$data.html("").append(html).stop(true, true);

				that.$spinner.fadeOut(250, function() {
					that.$mainContent.fadeIn(250);
				});
			});
			
			this.render();
		},
		updateConversations: function() {
			var that = this;
			this.$comments.html("");
			if ( this.filteredList.length ) {
				this.filteredList.each(function(convo) {
					that.$comments.append( that.template( {item: convo.toJSON()} ) );
				});
			}
		},
		updateTimestamp: function() {
			var time = $(this).text(),
				audioPlayer = $('#player-audio')[0];
			if (audioPlayer.src !== "") {
				audioPlayer.currentTime = this._formatTimestamp(time);	// in seconds
				audioPlayer.play();
			}
		},
		//@param time: String "mi:ss"
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