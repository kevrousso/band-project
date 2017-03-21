var app = app || {};

app.FileCommentsView = Backbone.View.extend({
	el: ".main-container",
	events: {
		'click a.timestamp': 'updateTimestamp',
		'click a.preview': 'toggleFullscreen',
		'click a.fullscreen': 'toggleFullscreen',
		'submit': 'postComment'
	},
	initialize: function (data) {
		var that = this;

		this.user = data.user;

		this.$el.fadeIn(250).css("display", "table-cell");

		this.$title = $('.header-container h1.title');
		this.$mainContent = this.$el.find('#mainContent');
		this.$scrollable = this.$mainContent.find(".scrollable");
		this.$scrollable.perfectScrollbar({
			suppressScrollX: true,
			minScrollbarLength: 100,
			useKeyboard: false
		});

		this.$noSelection = this.$mainContent.find(".noSelection");

		this.$data = this.$mainContent.find("#data");

		this.$comments = this.$scrollable.find("#comments");
		this.$formConvo = this.$scrollable.find("#addComment");
		this.$comment = this.$formConvo.find("#comment");

		this.$spinner = this.$el.find(".spinner");

		this.collection = new app.FileCommentsList();
		//load proper template
		app.utils.loadTemplate("FileCommentsView");

		this.getFileComments();

		this.on("change:updateView", this.updateView, this);

		this.updateWelcomeMsg(this.user);

		return this;
	},
	//only render when a file is selected
	render: function() {
		var that = this,
			filtered = this.findCommentByFileID(this.fileID);

		this.filteredList = new app.FileCommentsList(filtered);

		//render in html
		this.updateFileComments();
		
		return this;
	},
	//returns all the comments
	getFileComments: function() {
		var that = this;
		this.collection.fetch({
			data: {action: 'getFileComments'},
			type: "POST"
		});
	},
	postComment: function() {
		var that = this, comment = $.trim(this.$comment.val());
		app.utils.postData("postComment", {username: this.user, fileID: this.fileID, comment: comment}, 
			function(data, textStatus, jqXHR) {
				if (textStatus === "success") {
					var data = JSON.parse(data);

					//add in models
					var newComment = new app.FileComment({
						id: data.id,
						fileID: data.file_id,
						username: data.username,
						comment: data.comment,
						timestamp: data.timestamp
					});
					that.collection.models.push(newComment);
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
	//filter the Comments with the appropriate file_id
	//@param fileID: String
	findCommentByFileID: function(fileID) {
		var that = this;
		return _.filter(that.collection.models, function(mod) {
			return mod.get("fileID") === fileID;
		});
	},
	//called from NavView
	//@param data: Object {id, src, type}
	updateView: function(data) {
		var html = "", that = this;

		this.fileID = data.fileID;

		switch (data.type) {
			case "audio":
				html += '<audio id="player-audio" controls="controls" preload="metadata">';
				html +=		'Your browser doesn\' support the <code>audio</code> element.';
				html += 	'<source src="'+data.src+'" type="audio/mp3">';
				html +=	'</audio>';
				this.hasPlayer = true;
			break;
			case "video":
				html += '<video id="player-video" controls="controls" preload="metadata">';
				html +=		'Your browser doesn\' support the <code>video</code> element.';
				html += 	'<source src="'+data.src+'.mp4" type="video/mp4">';
				html += 	'<source src="'+data.src+'.webm" type="video/webm">';
				html += 	'<source src="'+data.src+'.ogv" type="video/ogg">';
				html +=	'</video>';
				this.hasPlayer = true;
			break;
			case "image":
				html += '<a href="#" class="preview"><img src="'+ data.src +'"/></a>';
				html += '<div class="full-img"><a href="#" class="fullscreen"><img src="" alt="" /></a></div>';
				this.hasPlayer = false;
			break;
			//default for unknown file extention
			default:
				html += "<h3 class='noPreview'>No preview availlable for that type of file yet.</h3>";
				this.hasPlayer = false;
			break;
		}
		this.$formConvo.show();
		this.$noSelection.hide();
		this.$mainContent.fadeOut(0, function (){
			//TODO: updateSpinner()
			that.$spinner.show().css("display", "table-cell");

			//set proper align to conversations el
			that.$el.css("vertical-align", "top");

			//reset data elem and append new one
			that.$data.html("").append(html);

			that.$spinner.fadeOut(250, function() {
				that.$mainContent.fadeIn(250);
			});
		});
		
		this.render();
	},
	updateFileComments: function() {
		var that = this;
		this.$comments.html("");
		if (this.filteredList.length) {
			this.filteredList.each(function(comment) {
				//format only if a player is present
				if (that.hasPlayer) {
					comment.set("comment", that.formatMessageTimestampReference(comment));
				}
				that.$comments.append( that.template({item: comment.toJSON()}) );
			});
			this.$scrollable.perfectScrollbar('update');
		} else {
			this.$comments.html("<p>No comments yet. Be the first!</p>");
		}
	},
	formatMessageTimestampReference: function(comment) {
		/*
		Format: Lorem ipsum #12:55 dolor sit 
			->  Lorem ipsum <a href="#" class="timestamp">12:55</a> dolor sit
		*/
		return comment.get("comment").replace(/\@\d{1,2}:\d{2}/, function(timestamp) {
			return "<a href='"+timestamp.replace("@", "#")+"' class='timestamp'>" + timestamp.replace("@", "") + "</a>";
		});
	},
	updateTimestamp: function(e) {
		var time = $(e.target).text(),
			audioPlayer = $('#player-audio')[0];
		if (audioPlayer.src !== "" || audioPlayer.currentSrc !== "") {
			audioPlayer.currentTime = this._formatTimestampForPlayer(time);	// in seconds
			audioPlayer.play();
		}
	},
	//@param time: String "mi:ss"
	_formatTimestampForPlayer: function(time) {
		var ts = time.trim(), minSec = ts.split(":");
		// rule: min * 60 + sec
		return parseInt(minSec[0]) * 60 + parseInt(minSec[1]);
	},
	//TODO: trigger("change:toggleFullScreen")
	toggleFullscreen: function(e) {
		var $this = $(e.target),
			$imgSrc = $this.attr("src"),
			$fullImg = $(".full-img");

		if (!this.isFullScreen) {
			$fullImg
				.find("img")
				.attr("src", $imgSrc);
			$fullImg.fadeIn("fast").css("display", "table");
			this.isFullScreen = true;
		} else {
			$fullImg.fadeOut("fast");
			this.isFullScreen = false;
		}
		return false;
	},
	//@param username: String
	updateWelcomeMsg: function(username) {
		this.$title.html("Welcome " + username.capitalize() + "!");
	}
});