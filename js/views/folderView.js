var app = app || {};

	app.FolderView = Backbone.View.extend({
		model: app.Folder,
		el: "#container",
		tagName: 'li',
		// Delegated events for selecting files to be played/showed (music, video, image, file)
		events: {
			'click li.dir a.hasContent': 'toggleFolderView',
			'mouseenter li.dir .content li a'  : 'hoveringSubMenu',	//sets a bool to true to indicate we're hover the subMenu
			'mouseleave li.dir .content li a'  : 'leavingSubMenu',	//sets a bool to false to indicate we're leaving the subMenu
			'click a.timestamp': 'updateTimestamp',
			'click a.fullscreen': 'toggleFullscreen'
		},
		initialize: function() {
			var that = this;

			this.$headerContainer = $('.header-container');
			this.$footerContainer = $('.footer-container');
			this.$mainContainer = $('.main-container');
			this.$mainContent = $('#mainContent');
			this.$navContainer = $(".nav-container");
			this.$navContentUl = $("#navContent ul");
			this.$form = $(".addComment");

			this.maxWidth = this.$el.width() / 2;

			//load proper template
			app.utils.loadTemplate(["FolderView"]);

			this.collection = new app.FolderList();
			this.collection.fetch({
				success: function(model, response) {
					that.render();
				}
			});
			//set proper heights on init
			this.resize();
			$(window).on("resize", _.bind(this.resize, this));
		},
		render: function() {
			var that = this;

			this.$navContainer.resizable({ handles: "e", "maxWidth": that.maxWidth });

			if ( this.collection.length ) {
				this.collection.each(function(folder){
					that.$navContentUl.append( that.template( {item: folder.toJSON()} ) );
				});
			}

			//make sure links gets registered by the router
			new app.Router();
			Backbone.history.start();

			return this;
		},
		resize: function() {
			var hdrHeight = this.$headerContainer.outerHeight(),
				ftrHeight = this.$footerContainer.outerHeight(),
				newHeight = window.innerHeight - hdrHeight - ftrHeight;

			this.$el.css("min-height", newHeight);
		},
		toggleFolderView: function(e, routing) {
			if (!this.hoverSubmenu) {
				var $this = $(e.target);

				//check if called from routing
				if (routing) {
					$this.addClass("opened");
					$this.next(".content").stop(true, true).slideDown(250);
				} else {
					$this.toggleClass("opened");
					$this.next(".content").stop(true, true).slideToggle(250);
				}
				
			}
			this.currentfolder = e.target.text;
		},
		showContent: function(e, routing) {
			var $this = $(e.target),
				$files = $(".content li"),
				src = $this.attr("href"),
				type = $this.attr("class");
			if (!$this.parent().hasClass("selected")) {
				//removeClass of every subMenu item
				$files.removeClass("selected");
				if (routing) {
					$this.parent().addClass("selected");
				} else {
					$this.parent().toggleClass("selected");
				}
				this._updateContent(src, type);
			}
		},
		_updateContent: function(src, type) {
			var html = "", that = this, align = "";
			switch (type) {
				case "music":
					html += '<audio id="player-audio" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>audio</code> element.';
					html += 	'<source src="'+src+'" type="audio/mp3">';
					html +=	'</audio>';

					this.$form.show();
					align = "top";
				break;
				case "video":
					html += '<video id="player-video" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>video</code> element.';
					html += 	'<source src="'+src+'.mp4" type="video/mp4">';
					html += 	'<source src="'+src+'.webm" type="video/webm">';
					html += 	'<source src="'+src+'.ogv" type="video/ogg">';
					html +=	'</video>';

					this.$form.show();
					align = "top";
				break;
				case "image":
					html += '<a href="#" class="fullscreen"><img src="'+ src +'"/></a><div class="full-img"><a href="#" class="fullscreen"><img src="" alt="" /></a></div>';
					align = "top";
				break;
				case "file":
					html += "<h3 class='noPreview'>No preview availlable</h3>";
					this.$form.hide();
					align = "middle";
				break;
			}
			this.$mainContent.stop(true, true).fadeOut("fast", function() {
				that.$mainContainer.css("vertical-align", align);
				that.$mainContent.html("").append(html).stop(true, true).fadeIn();
			});
			// TODO: based on what file has been selected
			//updateConversations();
		},
		updateTimestamp: function() {
			var time = $(this).text(),
				audioPlayer = $('#player-audio')[0];		//TODO: CACHE
			if (audioPlayer.src !== "") {
				audioPlayer.currentTime = this._formatTimestamp(time);	// in seconds
				audioPlayer.play();
			}
		},
		_formatTimestamp: function(time) {
			var ts = time.trim(), minSec = ts.split(":");

			// rule: min * 60 + sec
			return parseInt(minSec[0]) * 60 + parseInt(minSec[1]);
		},
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
		},
		hoveringSubMenu: function() {
			this.hoverSubmenu = true;
		},
		leavingSubMenu: function() {
			this.hoverSubmenu = false;
		}

		/*filterOne : function (folder) {
			folder.trigger('visible');
		},

		filterAll : function () {
			app.FolderList.each(this.filterOne, this);
		}*/
	});