var app = app || {};

	app.NavView = Backbone.View.extend({
		el: ".nav-container",
		tagName: 'li',
		// Delegated events for selecting files to be played/showed (music, video, image, file)
		events: {
			'click li.dir a.hasContent': 'toggleFolderView',
			'click li.dir .content li a': 'showContent',
			'mouseenter li.dir .content li a'  : 'hoveringSubMenu',	//sets a bool to true to indicate we're hover the subMenu
			'mouseleave li.dir .content li a'  : 'leavingSubMenu',	//sets a bool to false to indicate we're leaving the subMenu
			'click a.timestamp': 'updateTimestamp',
			'click a.fullscreen': 'toggleFullscreen',
			'keyup #searchBox': 'setSearchFilter',
			'click .clear': 'clearSearch',
			'click a.filter': 'setFilter'
		},
		initialize: function() {
			var that = this;

			//caching...
			this.$mainContainer = $('.main-container');
			this.$mainContent = $('#mainContent');
			this.$container = $('#container');
			this.$navContent = this.$el.find("#navContent");
			this.$formAddFile = $("#upload");
			this.$formConvo = $(".addComment");
			this.$spinner = this.$el.find(".spinner");
			this.$filters = this.$el.find("#filters");
			this.$types = this.$filters.find("#types");
			this.maxWidth = this.$container.width() / 2;

			this.$el.resizable({ handles: "e", "maxWidth": that.maxWidth });

			//load proper template
			app.utils.loadTemplate(["NavView"]);

			this.collection = new app.FolderList();
			this.files = new app.FileList();

			this.getFiles(this.getFolders);

			this.on('change:filterType', this.filterByType, this);
			this.on('change:searchFilter', this.filterBySearch, this);
			this.collection.on('reset', this.render, this);

			this.searchFilter = '';
			//Default filterType to all
			this.filterType = "all";

			$('.clear').hide();

			return this;
		},
		render: function() {
			var that = this;

			this.$navContent.hide().html("");
			if ( this.collection.length ) {
				this.collection.each(function(folder){
					that.$navContent.append( that.template( {item: folder.toJSON()} ) );
				});
			}
			this.$spinner.fadeOut(150, function() {
				that.$navContent.fadeIn();
			});

			if (!Backbone.History.started) {
				//make sure links gets registered by the router
				AppRouter = new app.Router();
				Backbone.history.start();
			}

			this.updateSearchUI();
			this.updateFiltersUI();

			//prepare context menu
			this.createContextMenu();
			
			return this;
		},
		createContextMenu: function() {
			var that = this;
			$.contextMenu({
				selector: 'li, .nav-container', 
				zIndex: 999999999999,	//just to be 100% sure
				callback: function(key, options) {
					var $el = $(this);
					that.updateNavMenu($el, key, options);
				},
				items: {
					"addfile": { name: "Add File", icon: "addFile",
						disabled: function(key, opt) { 
							// disable adding files in the root directory and on files
							return !this.hasClass("dir") || this.hasClass("file");
						}
					},
					"addfolder": { name: "Add Folder", icon: "addFolder",
						disabled: function(key, opt) { 
							// disable adding folders in folders
							return this.hasClass("dir") || this.hasClass("file");
						}
					},
					"rename": { name: "Rename", icon: "rename",
						disabled: function(key, opt) { 
							// disable renaming if not over folder or file
							return !this.hasClass("dir") || !this.hasClass("file");
						}
					},
					"delete": { name: "Delete", icon: "delete",
						disabled: function(key, opt) { 
							// disable deleting if not over folder or file
							return !this.hasClass("dir") && !this.hasClass("file");
						}
					}
				}
			});
		},
		updateNavMenu: function($el, key, options) {
			var that = this;
			switch (key) {
				case "addfolder": 
					// You can only add folders to the root. No sub-folders.
					var foldername = prompt("Enter a folder name", "");
					if (foldername && foldername.trim() !== "") {
						//validate that there isn't already a folder with that name
						if (that.isFolderNameUnique(foldername)) {
							//get max id and incremente it by 1 because ids are Unique
							var maxID = that.getMaxFolderID(),
								newFolder = new app.Folder({ id: parseInt(maxID)+1, name: foldername, machineName: foldername });
							that.collection.add(newFolder);
							that.render();
						} else {
							alert("Folder name already exist.")
						}
					}
				break;
				case "addfile":
					this.$formAddFile.find("input").on('change', function(e) {
						e.preventDefault();
						var fileInfo = e.target.files[0],
							filename = fileInfo.name,
							type = fileInfo.type.split("/")[0];
						//validate that there isn't already a file with that name
						if (that.isFileNameUnique(filename)) {
								//checks if folder hasContent and defaults to first </a>
							var foldername = $el.find("a.hasContent").text().trim() || $el.find("a").text().trim(),
								folder = _.filter(that.collection.models, function(m){
									return m.get('name') === foldername;
								}),
								folderID = folder[0].get("id"),
								currentfiles = folder[0].get("files");
								//get max id and incremente it by 1 because ids are Unique
							var maxID = that.getMaxFileID();
							
							if (type !== "audio" && type !== "video" && type !== "image") {
								type = "file";
							}
							var newFile = new app.File({
								id: parseInt(maxID)+1,
								name: filename,
								machineName: app.utils.cleanUpSpecialChars(filename),
								folderID: folderID,
								type: type,
								dateCreated: new Date()
							});

							//update files collection
							that.files.models.push(newFile);
							currentfiles.push(newFile);

							that.render();
						}
						return false;
					});
					this.$formAddFile.find("input").trigger("click");
				// TODO
					//pop a file upload window
					//add model to collection and RENDER

					//that.render();
				break;
				case "rename":
				break;
				case "delete":
					var type = $el.hasClass("dir") ? "folder" : "file",
						name = $el.find("a.hasContent").text().trim() || $el.find("a").text().trim(),
						msg = 'Do you really want to permanantly delete '+ type +' "'+ name +'" ?';
					if ($el.find("a").hasClass("hasContent")) {
						msg = 'Do you really want to permanantly delete '+ type +' "'+ name +'" and ALL it\'s content ?';
					}
					if (window.confirm(msg)) { 
						//remove model from collection and RENDER
						if (type === "folder") {
							that.collection.remove(that.getFolderByName(name));
						} else {
							that.removeFileByName(name);
						}

						//TODO
						//update foldersUI to check if has files, if not, removeClass("hasContent")

						that.render();
					}
				break;
			}
			//re-store a copy of collection 
			directoryData = this.collection.toJSON();
		},
		getMaxFolderID: function() {
			return this.collection.max(function(m){
				return m.get('id');
			}).get("id");
		},
		getMaxFileID: function() {
			var tmpID = 0;
			_.each(this.files.models, function(m) {
				tmpID = m.get('id') > tmpID ? m.get('id') : tmpID;
			});
			return parseInt(tmpID, 10);
		},
		isFolderNameUnique: function(name) {
			return !this.collection.findWhere({name: name});
		},
		isFileNameUnique: function(name) {
			var unique = true;
			_.each(this.files.models, function(file) {
				if (file.get('name') === name) {
					unique = false;
				} 
			});
			return unique;
		},
		getFolderByName: function(name) {
			return _.filter(this.collection.models, function(folder) {
				return folder.get("name") === name;
			});
		},
		removeFileByName: function(name) {
			return _.find(this.collection.models, function(folder) {
				var newFiles = _.filter(folder.get("files"), function(file) {
					return file.get("name") !== name;
				});
				folder.set("files", newFiles);
			});
		},
		getFiles: function(callback) {
			var that = this;
			this.files.fetch({
				data: {action: 'getFiles'},
				type: "POST",
				success: function(model, response) {
					if (callback) {
						callback.call(that);
					}
				}
			});
		},
		getFolders: function() {
			var that = this;
			this.collection.fetch({
				data: {action: 'getFolders'},
				type: "POST",
				success: function(model, response) {
					//merge the files in folders, matching folder.id -> file.folderID
					that.collection.each(function(folder, index) {
						that.files.each(function(file, index) {
							var associatedFile = that.files.filter(function(file) {
								return folder.id === file.get("folderID");
							});
							folder.set("files", associatedFile);
						});
					});
					//save a copy of the collection
					directoryData = that.collection.toJSON();
					//createFilters
					that.$types.append(that.createFilters());
					that.render();
				}
			});
		},
		getTypes: function() {
			var tmpTypes = [], files;
			this.collection.each(function(model, index) {
				files = model.get("files");
				_.each(files, function(file, i) {
					tmpTypes.push(file.get("type"));
				});
			});

			return _.uniq(tmpTypes);
		},
		createFilters: function() {
			var filters = '<a class="filter" href="#all">All</a>',
				txt = "";
			_.each(this.getTypes(), function(item) {
				txt = item.charAt(0).toUpperCase() + item.substring(1);
				filters += '<a class="filter" href="#' + item + '">' + txt + '</a>';
			});
			return filters;
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
			return false;
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
				case "audio":
					html += '<audio id="player-audio" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>audio</code> element.';
					html += 	'<source src="'+src+'" type="audio/mp3">';
					html +=	'</audio>';

					this.$formConvo.show();
					align = "top";
				break;
				case "video":
					html += '<video id="player-video" controls="controls" preload="metadata">';
					html +=		'Votre navigateur ne supporte pas l\'élément <code>video</code> element.';
					html += 	'<source src="'+src+'.mp4" type="video/mp4">';
					html += 	'<source src="'+src+'.webm" type="video/webm">';
					html += 	'<source src="'+src+'.ogv" type="video/ogg">';
					html +=	'</video>';

					this.$formConvo.show();
					align = "top";
				break;
				case "image":
					html += '<a href="#" class="fullscreen"><img src="'+ src +'"/></a><div class="full-img"><a href="#" class="fullscreen"><img src="" alt="" /></a></div>';
					align = "top";
				break;
				case "file":
					html += "<h3 class='noPreview'>No preview availlable</h3>";
					this.$formConvo.hide();
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
		},
		/*Filter events*/
		filterBySearch: function() {
			this.collection.reset(directoryData, {silent: true});
			var filterString = this.searchFilter,
				filterType = this.filterType,
				filtered = this.getFilteredBySearchAndType(filterString, filterType);

			this.collection.reset(filtered);
		},
		filterByType: function() {
			if (!this.$types.find('a[href^=#'+this.filterType+']').hasClass('selected')) {
				this.collection.reset(directoryData, { silent:true });
				var filterString = this.searchFilter || '',
					filterType = this.filterType,
					filtered = this.getFilteredBySearchAndType(filterString, filterType);

				this.collection.reset(filtered);
				AppRouter.navigate('filter/' + filterType);
			}
		},
		clearSearch: function() {
			this.collection.reset(directoryData, {silent: true});
			this.searchFilter = '';
			var searchFilter = this.searchFilter,
				filterType = this.filterType,
				filtered = this.getFilteredBySearchAndType(searchFilter, filterType);
			$('.clear').hide();
			$('#searchBox').val(searchFilter);

			this.collection.reset(filtered);
			AppRouter.navigate('filter/' + filterType);

			this.$el.find('.content li').removeHighlight();
		},
		setSearchFilter: function(e) {
			this.searchFilter = e.target.value;
			this.trigger('change:searchFilter');
		},
		setFilter: function(e) {
			e.preventDefault();
			this.filterType = e.currentTarget.innerHTML.toLowerCase();
			this.trigger('change:filterType');
		},
		//Returns a collection of folders filtered files by search value and type
		getFilteredBySearchAndType: function(str, type) {
			//for each folder
			return this.collection.each(function(model, index) {
				var files = model.get("files"),
					//only accept same type
					newM = _.filter(files, function(file) {
						if (type === 'all') {
							return file.get("name").indexOf(str.toLowerCase()) !== -1;
						} else {
							return file.get("name").toLowerCase().indexOf(str.toLowerCase()) !== -1 && file.get("type") === type;
						}
					});
				model.set("files", newM);
			});
		},
		updateSearchUI: function() {
			if (this.searchFilter !== "") {
				$('.clear').show();
			} else {
				$('.clear').hide();
			}
			//highlight searchFilter in filenames
			this.$el.find('.content li').highlight(this.searchFilter);
		},
		updateFiltersUI: function() {
			this.$types.find('a').removeClass('selected');
			this.$types.find('a[href^=#'+this.filterType+']').addClass('selected');
			//highlight searchFilter in filenames
			this.$el.find('.content li').highlight(this.searchFilter);
		}
	});