var app = app || {};

app.FileCommentsView = Backbone.View.extend({
	el: ".main-container",
	events: {
		'click a.time': 'updateMessageTime',
		'click a.preview': 'toggleFullscreen',
		'click a.fullscreen': 'toggleFullscreen',
		'submit': 'postFileComment',
		'keyup': 'onKeyPostFileComment'
	},
	initialize: function (data) {
		var that = this;

		config = app.Config;
		utils = app.Utils;

		this.user = data.user;

		//TODO: get rid of css in JS...
		this.$el.fadeIn(250).css("display", "table-cell");

		this.$title = $('.header-container h1.title');
		this.$mainContent = this.$el.find('#mainContent');
		this.$content = this.$mainContent.find('.content');
		this.$scrollable = this.$mainContent.find(".scrollable");
		this.$scrollable.perfectScrollbar({
			suppressScrollX: true,
			minScrollbarLength: 100,
			useKeyboard: false
		});


		this.$data = this.$mainContent.find("#data");

		this.$comments = this.$scrollable.find("#comments");
		this.$formConvo = this.$mainContent.find("#addComment");
		this.$countDown = this.$formConvo.find(".countDown");
		this.$comment = this.$formConvo.find("#comment");
		this.$enterToSend = this.$formConvo.find("#enterToSend");

		this.collection = new app.FileCommentsList();
		//load proper template
		utils.loadTemplate("FileCommentsView");

		this.getFileComments();

		this.on("change:updateView", this.updateView, this);

		return this;
	},
	setupResizable: function() {
		var that = this;
		var mainContentHeight = this.$mainContent.outerHeight();

		this.maxHeight = Math.round(mainContentHeight * config.max_split_percent / 100);
		this.$data.resizable({
			handles: "s",
			"maxHeight": this.maxHeight,
			resize: function(e, ui) {
                that.resize();
            },
		});
		this.resizableInitialized = true;
	},
	resize: function() {
		this.$scrollable.perfectScrollbar('update');

		this.resizeScrollable();

		if (!this.resizableInitialized) {
			this.setupResizable();
		}

	},
	resizeScrollable: function() {
		var that = this;
		var dataHeight = this.$data.outerHeight();
		var mainContentHeight = this.$mainContent.outerHeight();
		var newHeight = mainContentHeight - dataHeight;

		this.$scrollable.css("max-height", newHeight);
	},
	//only render when a file is selected
	render: function() {
		var filtered = this.findCommentByFileID(this.fileID);

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
			type: "POST",
			error: function(model, response, jqXHR) {
				utils.handleError(response, "", jqXHR);
			}
		});
	},
	onKeyPostFileComment: function(e) {
		var code = e.keyCode || e.which;
		//ENTER key and SHIFT key is not holding
        if (code == 13 && !e.shiftKey && $.trim(e.target.value) !== "" && this.$enterToSend.is(":checked")) {
        	this.postFileComment();
        } else {
        	this.updateRemainingChars();
        }
	},
	updateRemainingChars: function() {
	    var length = $.trim(this.$comment.val()).length;
	    var totalChars = parseInt(this.$comment.attr("maxLength"), 10);
	    var remaining = totalChars - length;
	    this.$countDown.text(remaining + '/' + totalChars);
	},
	resetRemainingChars: function() {
		this.$countDown.empty();
	},
	postFileComment: function() {
		var that = this, comment = $.trim(this.$comment.val());
		if (comment !== "") {
			utils.postData("postFileComment", {username: this.user, fileID: this.fileID, comment: comment}, 
				function(response, textStatus, jqXHR) {
					response = utils.isJSON(response) ? JSON.parse(response) : response;
					if (response) {
						//add in models
						var newComment = new app.FileComment(response);
						that.collection.models.push(newComment);
						that.resetForm();
						that.resetRemainingChars();
						that.render();
					}
				}
			);
		} else {
			this.$comment.focus();
		}
		return false;
	},
	resetForm: function() {
		this.$formConvo.trigger("reset");
	},
	//filter the Comments with the appropriate fileID
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
		//reset resizable flag so that we can initiate a new instance for the selected file
		if (this.$data.hasClass("ui-resizable")) {
			this.$data.resizable("destroy");
		}
		this.resizableInitialized = false;

		var html = "", that = this;

		that.$data.removeClass("smallContent");

		if (!data) {
			html = "<div class='noSelection-wrapper'><h4 class='noSelection'>Select a file in the menu or upload one using the right-click context menu on the menu.</h4></div>";
			this.fileID = null;
			this.$formConvo.hide();
			this.$data.empty().append(html);
			//set proper align to conversations el
			this.$el.css("vertical-align", "middle");
			this.$content.addClass("hidden");
			this.render();
		} else {
			this.$content.removeClass("hidden");
			this.fileID = data.fileID;
			ext = data.src.split(".")[1];
			ext = (ext === "ogv" ? "ogg" : ext); //handle cases for IE...
			if (data.type === "audio") {
				html += '<audio id="player" controls="controls" preload="metadata">';
				html +=		'Your browser doesn\'t support the <code>audio</code> element.';
				html += 	'<source src="'+data.src+'" type="audio/'+ext+'">';
				html +=	'</audio>';
				that.$data.addClass("smallContent");
				this.hasPlayer = true;
			} else if (data.type === "video") {
				html += '<video id="player" controls="controls" preload="metadata">';
				html +=		'Your browser doesn\'t support the <code>video</code> element.';
				html += 	'<source src="'+data.src+'" type="video/'+ext+'">';
				html +=	'</video>';
				that.$data.addClass("smallContent");
				this.hasPlayer = true;
			} else if (data.type === "image") {
				html += '<a href="#" class="preview"><img src="'+ data.src +'"/></a>';
				html += '<div class="full-img"><a href="#" class="fullscreen"><img src="" alt="" /></a></div>';
				this.hasPlayer = false;
			} else if (data.type === "file" && ext === "txt") {
				html += '<iframe src="'+data.src+'"></iframe>'
				this.hasPlayer = false;
			//default for unknown file extention
			} else {
				html += "<h4 class='noPreview'>No preview availlable for that type of file yet.</h4>";
				that.$data.addClass("smallContent");
				this.hasPlayer = false;
			}
			
			this.$formConvo.show();
			this.$mainContent.fadeOut(0, function (){
				
				utils.showLoadingBox();

				//set proper align to conversations el
				that.$el.css("vertical-align", "top");

				//reset data elem and append new one
				that.$data.empty().append(html);

				//render the comments, show them and resize the area accordingly
				//TODO: maybe wait after everything has rendered before removing the blockUI
				// in case we have a lot to process
				that.render();
				utils.hideLoadingBox();
				that.$mainContent.fadeIn(250, function() {
					that.resize();
				});
			});
		}
	},
	updateFileComments: function() {
		var that = this;
		this.$comments.empty();
		if (this.filteredList.length) {
			this.filteredList.each(function(comment) {
				//format only if a player is present
				if (that.hasPlayer) {
					comment.set("comment", that.formatMessageTimeReference(comment));
				}
				if (comment.get("username") === that.user) {
					comment.set("isCurrentUser", "currentUser");
				}
				//prepend comment so that they are in order of most recent to oldest
				that.$comments.prepend( that.template({item: comment.toJSON()}) );
			});
		} else {
			//no comments, but check also if user has selected something
			// (doesn't have class noSelection)
			if (this.$data.find(".noSelection").length === 0) {
				this.$comments.html("<p class='noComments'>No comments yet. Be the first!</p>");
			}
		}
	},
	formatMessageTimeReference: function(comment) {
		/*
		Format: Lorem ipsum @12:55 dolor sit 
				or
				Lorem ipsum 12:55 dolor sit
			->  Lorem ipsum <a href="#" class="time">12:55</a> dolor sit
		*/
		return comment.get("comment").replace(/\@\d{1,2}:\d{2}|\d{1,2}:\d{2}/, function(time) {
			if (time.charAt(0) === "@") {
				return "<a href='"+time.replace("@", "#")+"' class='time'>" + time.replace("@", "") + "</a>";			
			} else {
				return "<a href='#"+time+"' class='time'>" + time + "</a>";
			}
		});
	},
	updateMessageTime: function(e) {
		var time = $(e.target).text(),
			player = $('#player')[0];
		if (player.src !== "" || player.currentSrc !== "") {
			player.currentTime = this._formatTimestampForPlayer(time);	// in seconds
			player.play();
		}
	},
	//@param time: String; "mi:ss"
	//@return: String; in milliseconds
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
			$fullImg.fadeIn("fast").css("display", "inline-block");
			this.isFullScreen = true;
		} else {
			$fullImg.fadeOut("fast");
			this.isFullScreen = false;
		}
		return false;
	}
});