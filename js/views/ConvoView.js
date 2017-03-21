var app = app || {};

app.ConvoView = Backbone.View.extend({
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
		this.$mainContent = $('#mainContent');
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

		this.collection = new app.ConvoList();
		//load proper template
		app.utils.loadTemplate("ConvoView");

		this.getConversations();

		this.on("change:updateView", this.updateView, this);

		app.AppView.updateWelcomeMsg(this.user);

		return this;
	},
	//only render when a file is selected
	render: function() {
		var that = this,
			filtered = this.findConvoByFileID(this.fileID);

		this.filteredList = new app.ConvoList(filtered);

		//render in html
		this.updateConversations();
		
		return this;
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
	postComment: function() {
		var that = this, comment = $.trim(this.$comment.val());
		app.utils.postData("postComment", {username: this.user, fileID: this.fileID, comment: comment}, 
			function(data, textStatus, jqXHR) {
				if (textStatus === "success") {
					var data = JSON.parse(data);

					//add in models
					var newConvo = new app.Convo({
						id: data.id,
						fileID: data.file_id,
						username: data.username),
						comment: data.comment,
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
	findConvoByFileID: function(fileID) {
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
				html +=		'Your browser doesn\' support the <code>audio</code> element.';
				html += 	'<source src="'+data.src+'" type="audio/mp3">';
				html +=	'</audio>';
				this.$formConvo.show();
				this.hasPlayer = true;
				align = "top";
			break;
			case "video":
				html += '<video id="player-video" controls="controls" preload="metadata">';
				html +=		'Your browser doesn\' support the <code>video</code> element.';
				html += 	'<source src="'+data.src+'.mp4" type="video/mp4">';
				html += 	'<source src="'+data.src+'.webm" type="video/webm">';
				html += 	'<source src="'+data.src+'.ogv" type="video/ogg">';
				html +=	'</video>';
				this.$formConvo.show();
				this.hasPlayer = true;
				align = "top";
			break;
			case "image":
				html += '<a href="#" class="preview"><img src="'+ data.src +'"/></a>';
				html += '<div class="full-img"><a href="#" class="fullscreen"><img src="" alt="" /></a></div>';
				this.$formConvo.show();
				this.hasPlayer = false;
				align = "top";
			break;
			//default for unknown file extention
			default:
				html += "<h3 class='noPreview'>No preview availlable for that type of file yet.</h3>";
				this.$formConvo.hide();
				this.hasPlayer = false;
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
			that.$data.html("").append(html);

			that.$spinner.fadeOut(250, function() {
				that.$mainContent.fadeIn(250);
			});
		});
		
		this.render();
	},
	updateConversations: function() {
		var that = this;
		this.$comments.html("");
		if (this.filteredList.length) {
			this.filteredList.each(function(convo) {
				//format only if a player is present
				if (that.hasPlayer) {
					convo.set("comment", that.formatMessageTimestampReference(convo));
				}
				that.$comments.append( that.template({item: convo.toJSON()}) );
			});
			this.$scrollable.perfectScrollbar('update');
		} else {
			this.$comments.html("<p>No comments yet. Be the first!</p>");
		}
	},
	formatMessageTimestampReference: function(convo) {
		/*
		Format: Lorem ipsum #12:55 dolor sit 
			->  Lorem ipsum <a href="#" class="timestamp">12:55</a> dolor sit
		*/
		return convo.get("comment").replace(/#\d{1,2}:\d{2}/, function(timestamp) {
			return "<a href='#' class='timestamp'>" + timestamp.replace("#", "") + "</a>";
		});
	},
	updateTimestamp: function() {
		var time = $(this).text(),
			audioPlayer = $('#player-audio')[0];
		if (audioPlayer.src !== "") {
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
				.attr("src", $imgSrc)
				.fadeIn("fast");
			this.isFullScreen = true;
		} else {
			$fullImg.fadeOut("fast");
			this.isFullScreen = false;
		}
		return false;
	}
});