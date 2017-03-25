var app = app || {};

app.NavView = Backbone.View.extend({
	el: ".nav-container",
	tagName: 'li',
	events: {
		'click li.dir a.hasContent': 'toggleFolderView',
		'click li.dir .content li a': 'showContent',
		'keyup #searchBox': 'setSearchFilter',
		'click .clear': 'clearSearch',
		'click a.filter': 'setFilter'
	},
	initialize: function(options) {
		config = app.Config;
		utils = app.Utils;

		this.appView = options.appView;

		this.user = options.user;
		//TODO: remove jquery global references...
		this.$headerContainer = $('.header-container');
		this.$footerContainer = $('.footer-container');
		this.$mainContainer = $('.main-container');

		this.$title = this.$headerContainer.find('h1.title');
		this.$el.fadeIn(250).css("display", "table-cell");

		this.$navContent = this.$el.find("#navContent");
		this.$scrollable = this.$el.find(".scrollable");
		
		this.$formAddFile = this.$el.find("#upload");
		this.$noDirectories = this.$el.find(".noDirectories");
		this.$filters = this.$el.find("#filters");
		this.$searchBox = this.$filters.find("#searchBox");
		this.$types = this.$filters.find("#types");
		this.$container = $('#container');

		this.$logout = $("a.logout");
		this.$logout.show();

		//load proper template
		utils.loadTemplate("NavView");

		this.collection = new app.FolderList();
		this.files = new app.FileList();

		//Set default filters
		this.filterType = "all";
		this.searchFilter = '';

		this.getFiles(this.getFolders);

		this.on('change:filterByType', this.filterByType, this);
		this.on('change:filterBySearch', this.filterBySearch, this);

		//this.collection.on('all', this.render, this);
		//this.files.on('all', this.render, this);

		//prepare context menu
		this._createContextMenu();

		//TODO: when implementing venting, put this into AppView, and trigger an event through the vent
		this.updateWelcomeMsg(this.user);

		this.resize();
		$(window).on("resize", _.bind(this.resize, this));

		return this;
	},
	//@param username: String
	updateWelcomeMsg: function(username) {
		this.$title.html("Welcome " + username.capitalize() + "!");
	},
	resize: function() {
		// totalWidth * %/100
		this.maxWidth = Math.round(this.$container.outerWidth() * config.max_width_for_nav_view / 100);
		this.$el.resizable({ handles: "e", "maxWidth": this.maxWidth });

		//TODO: this should do a trigger instead,
		//		and AppView should listen to it
		this.appView.resize();

		var headerContainerHeight = this.$headerContainer.outerHeight();
		var footerContainerHeight = this.$footerContainer.outerHeight();
		var filtersHeight = this.$filters.outerHeight();

		this.$navContent.outerHeight(window.innerHeight - headerContainerHeight - footerContainerHeight - filtersHeight);
		this.$scrollable.perfectScrollbar('update');
	},
	render: function() {
		var that = this;
		var filtered = this.getFilteredBySearchAndType(this.searchFilter, this.filterType);

		this.filteredList = new app.FolderList(filtered);

		this.$searchBox.attr("disabled", this.collection.length === 0);

		this.$navContent.hide().empty();

		utils.showLoadingBox();
		if (this.filteredList.length) {
			this.filteredList.each(function(folder) {
				that.$navContent.append( that.template( {item: folder.toJSON()} ) );
			});
			this.$noDirectories.hide();
		} else {
			this.$noDirectories.show();
		}

		utils.hideLoadingBox();
		this.$navContent.fadeIn(250);

		//empty and update Filters
		this.$types.empty().append(that._createFilters());
		this.updateSearchUI();
		this.updateFiltersUI();
		this.$scrollable.perfectScrollbar({
			suppressScrollX: true,
			minScrollbarLength: 100,
			useKeyboard: false
		});

		//set no selection (by not passing any data)
		this.updateViewArea();

		this.resize();

		return this;
	},
	_createContextMenu: function() {
		var that = this;
		$.contextMenu({
			selector: 'li, .nav-container', 
			zIndex: 999999999999,	//just to be 100% sure
			callback: function(key, options) {
				var $el = $(this);
				that.updateNavMenu($el, key, options);
			},
			items: { "addfile": { name: "Add File", icon: "addFile",
					disabled: function(key, opt) { 
						// disable adding files in the root directory and on files
						return !this.hasClass("dir") || this.hasClass("file");
					}
				}, "addfolder": { name: "Add Folder", icon: "addFolder",
					disabled: function(key, opt) { 
						// disable adding folders in folders
						return this.hasClass("dir") || this.hasClass("file");
					}
				}, "rename": { name: "Rename", icon: "rename",
					disabled: function(key, opt) { 
						// disable renaming if not over folder or file
						return !this.hasClass("dir") && !this.hasClass("file");
					}
				}, "delete": { name: "Delete", icon: "delete",
					disabled: function(key, opt) { 
						if (config.allow_deleting_folders_with_files === true) {
							// disable deleting if not over folder or file
							return !this.hasClass("dir") && !this.hasClass("file");
						}
						// disable deleting folder which contains files
						return !this.hasClass("file") && (this.hasClass("dir") ? this.find(".file").length !== 0 : !this.hasClass("dir"));
					}
				}, "download": { name: "Download", icon: "download",
					disabled: function(key, opt) { 
						// disable downloading if over folder
						return this.hasClass("dir") || !this.hasClass("file");
					}
				}
			}
		});
	},
	_createFilters: function() {
		var filters = '<a class="filter" href="#all">All</a>',
			txt = "";
		_.each(this.getTypes(), function(item) {
			txt = item.charAt(0).toUpperCase() + item.substring(1);
			filters += '<a class="filter" href="#' + item + '">' + txt + '</a>';
		});
		return filters;
	},
	updateNavMenu: function($el, key, options) {
		var that = this,
			type = $el.hasClass("dir") ? "folder" : "file",
			name = $el.find("a.hasContent").text().trim() || $el.find("a").text().trim();
		switch (key) {
			case "addfolder": 
				// You can only add folders to the root. No sub-folders.
				bootbox.prompt({
				    title: "Enter a folder name:",
				    inputMaxLength: 50,
				    callback: function(foldername) {
						if (foldername && foldername.trim() !== "") {
							//validate that there isn't already a folder with that name
							if (that.isFolderNameUnique(foldername)) {
								var foldername = $.trim(foldername),
									machineName = $.trim(utils.cleanUpSpecialChars(foldername));

								utils.postData("postFolder", {name: foldername, machineName: machineName},
									function(response, textStatus, jqXHR) {
										response = utils.isJSON(response) ? JSON.parse(response) : response;
										if (response) {
											var newFolder = new app.Folder(response);
											that.collection.add(newFolder);
											that.render();
										}
									});
							} else {
								alert('Folder "'+foldername+'" already exist.');
							}
						}
					}
				});
			break;
			case "addfile":
				this.$formAddFile.find("input").on('change', function(e) {
					e.preventDefault();
					if (e.target.files.length !== 0) {
						var fileInfo = e.target.files[0];
						var filename = fileInfo.name;
						var fileType = fileInfo.type.split("/")[0]; //audio, video, ...
						var fileExt = fileInfo.name.split(".")[fileInfo.name.split(".").length-1];

						if (fileInfo && _.contains(config.accepted_file_extensions, fileExt)) {
							
							var folder = that.getModelByName(that.collection.models, name);
							var folderID = folder.get("id");

							//TODO: this is sort of a hack... we use a ref to update it 
							//      afterwards instead of updating the references through that.mergeFilesInFolders()
							//store a reference to current files, so that we can add the new file to it (reflected in files collection...)
							var currentfiles = folder.get("files");

							if (that.isFileNameUnique(filename)) {
								if (fileType !== "audio" && fileType !== "video" && fileType !== "image") {
									fileType = "file";
								}

								that.$formAddFile.find("input[name=fileName]").val($.trim(filename));
								that.$formAddFile.find("input[name=fileMachineName]").val($.trim(utils.cleanUpSpecialChars(filename)));
								that.$formAddFile.find("input[name=folderID]").val(folderID);
								that.$formAddFile.find("input[name=fileType]").val(fileType);
								that.$formAddFile.find("input[name=folderMachineName]").val(folder.get("machineName"));
								utils.uploadFile("postFile", that.$formAddFile[0], function(response, textStatus, jqXHR) {
									response = utils.isJSON(response) ? JSON.parse(response) : response;
									if (response && !response.error) {
										//update files collection
										var newFile = new app.File(response);
										that.files.models.push(newFile);
										currentfiles.push(newFile);
										that.render();
									}
								});
							} else {
								bootbox.alert('<span class="warning">File <strong>"'+filename+'"</strong> already exist in the application. <br> You cannot add the same file in multiple folders.</span>');
							}
						} else {
							//file not found or not supported
							bootbox.alert("<span class='warning'>File could not be added. Verify that the file extension ("+fileExt+") is supported by the application:<br>[" + config.accepted_file_extensions.toString().split(",").join(", ") + "]</span>");
							console.log("File could not be added.");
						}
					}
					//reset the input file
					$(this).val("");
				});
				this.$formAddFile.find("input").trigger("click");
			break;
			case "rename":
				bootbox.prompt({
				    title: 'Enter a new name for "'+name+'":',
				    inputMaxLength: 50,
				    value: name,
				    callback: function(newName) {
						if (newName && newName.trim() !== "") {
							var newMachineName = $.trim(utils.cleanUpSpecialChars(newName)),
								model, oldName = "", id = 0;
							if (type === "folder") {
								model = that.getModelByName(that.collection.models, name);
							} else if (type === "file") {
								model = that.getModelByName(that.files.models, name);
							}
							oldMachineName = model.get("machineName");
							id = model.get("id");
							folderID = model.get("folderID");

							if (type === "folder") {
								utils.postData("renameFolder", {id: id, oldMachineName: oldMachineName, newName: newName, newMachineName: newMachineName});
								that.renameElement(type, name, newName, newMachineName, "");
								that.render();
							} else if (type === "file") {
								folder = that.getModelByID(that.collection.models, model.get("folderID"));
								utils.postData("renameFile", 
									{
										id: id,
										folderID: folderID,
										oldMachineName: oldMachineName,
										newName: newName,
										newMachineName: newMachineName,
										folderMachineName: folder.get("machineName")
									}, function (data, textStatus, jqXHR) {
										if (data !== "") {
											data = JSON.parse(data);
											that.renameElement(type, name, data.newName, data.newMachineName, data.path);
											that.render();
										}
									}
								);
							}
						}
					}
				});
			break;
			case "delete":
				var msg = 'Do you really want to permanantly delete the '+type+' <strong>"'+ name +'"</strong> ?',
					fileModel, folderModel;
				if ($el.find("a").hasClass("hasContent")) {
					msg = 'Do you really want to permanantly delete the '+type+' <strong>"'+ name +'"</strong> and <strong>ALL</strong> it\'s content ?';
				}
				bootbox.confirm({
					message: msg,
					buttons: {
						'cancel':  { label: 'Cancel' },
						'confirm': { label: 'Delete' }
					}, 
					callback: function(confirmed) {
						if (confirmed) { 
							//remove model from collection and RENDER
							if (type === "folder") {
								folderModel = that.getModelByName(that.collection.models, name);
								utils.postData("deleteFolder", folderModel.toJSON());

								//TODO: delete files in folderModel first, and delete folder

								that.collection.remove(folderModel);
							} else {
								fileModel = that.getModelByName(that.files.models, name);
								folder = that.getModelByID(that.collection.models, fileModel.get("folderID"));

								that.removeFileByName(name);
								utils.postData("deleteFile", {
									fileID: fileModel.get("id"), 
									fileMachineName: fileModel.get("machineName"),
									folderMachineName: folder.get("machineName")
								});
							}
							that.render();
						}
					}
				});
			break;

			case "download":
				if (type === "file") {
					var downloadUrl = $el.find("a").prop("href").replace("#", "");
					var $downloadLink = $("<a/>").attr({
						download: "",
						href: downloadUrl
					}).appendTo("body");
					$downloadLink[0].click();
					$downloadLink.remove();
				}
			break;
		}
	},
	//@param type: string
	//@param oldName: string
	//@param name: string
	//@param machineName: string
	//@param path: string
	renameElement: function(type, oldName, newName, machineName, path) {
		var model;
		if (type === "folder") {
			model = this.getModelByName(this.collection.models, oldName);
		} else if (type === "file") {
			model = this.getModelByName(this.files.models, oldName);
			model.set("path", path);
		}
		model.set("name", newName);
		model.set("machineName", machineName);
	},

	/// DEPRECATED; SHOULDN'T BE USED
	//@param collection: Backbone Collection
	//return: int
	getNextModelID: function(collection) {
		var tmpID = 0;
		_.each(collection, function(m) {
			tmpID = m.get('id') > tmpID ? m.get('id') : tmpID;
		});
		return parseInt(tmpID, 10) + 1;
	},

	//@param name: string
	//return: bool
	isFolderNameUnique: function(name) {
		return !this.collection.findWhere({name: name});
	},
	//@param filename: string
	//return: bool
	isFileNameUnique: function(filename) {
		var unique = true;
		
		_.find(this.collection.models, function(folder) {
			_.filter(folder.get("files"), function(file) {
			  if (file.get('name') === filename) {
					unique = false;
				}
			});
		});
		return unique;
	},
	//@param collection: Backbone collection
	//@param name: string
	//return: model
	getModelByName: function(collection, name) {
		return _.find(collection, function(mod) {
			return mod.get("name") === name;
		});
	},
	//@param collection: Backbone collection
	//@param name: string
	//return: model
	getModelByID: function(collection, id) {
		return _.find(collection, function(mod) {
			return mod.get("id") === id;
		});
	},
	//@param name: string
	//remove file from folder collection 
	removeFileByName: function(name) {
		return _.find(this.collection.models, function(folder) {
			var newFiles = _.filter(folder.get("files"), function(file) {
				return file.get("name") !== name;
			});
			folder.set("files", newFiles);
		});
	},
	//@param callback: function
	getFiles: function(callback) {
		var that = this;
		this.files.fetch({
			data: {action: 'getFiles'},
			type: "POST",
			success: function(model, response) {
				callback.call(that);
			},
			error: function(model, response, jqXHR) {
				utils.handleError(response, "", jqXHR);
			}
		});
	},
	getFolders: function() {
		var that = this;
		this.collection.fetch({
			data: {action: 'getFolders'},
			type: "POST",
			success: function(model, response) {
				if (that.collection.length !== 0) {
					that.mergeFilesInFolders();
				}
				
				//render before we start the router
				// so if url contains route, links will be binded
				//therefore clickable through the Router
				that.render();

				if (!Backbone.History.started) {
					//make sure links gets registered by the router
					AppRouter = new app.Router();
					Backbone.history.start();
				}
			},
			error: function(model, response, jqXHR) {
				utils.handleError(response, "", jqXHR);
			}
		});
	},
	//merge the files in folders, matching folder.id -> file.folderID
	mergeFilesInFolders: function() {
		var that = this;
		//merge the files in folders, matching folder.id -> file.folderID
		this.collection.each(function(folder, index) {
			that.files.each(function(file, index) {
				var associatedFile = that.files.filter(function(file) {
					return folder.id === file.get("folderID");
				});
				folder.set("files", associatedFile);
			});
		});
	},
	//gets each file's types, return unique ones
	getTypes: function() {
		return _.uniq(this.files.pluck("type"));
	},
	// TODO: make function without args, bind it to (change:toggleFolderView)
	toggleFolderView: function(e, routing) {
		var $this = $(e.target);

		//check if called from routing
		if (routing) {
			$this.addClass("opened");
			$this.next(".content").stop(true, true).slideDown(250);
		} else {
			$this.toggleClass("opened");
			$this.next(".content").stop(true, true).slideToggle(250);
		}

		this.currentfolder = e.target.text;
		this.$scrollable.perfectScrollbar('update');
		return false;
	},
	//TODO: should be replaced by toggleFolderView in a good way..
	toggleFoldersView: function() {
		if (this.searchFilter !== "") {
			this.$navContent.find(".hasContent").addClass("opened");
			this.$navContent.find(".content").stop(true, true).slideDown(250);
		}
	},
	// TODO: make function without args, bing it to (change:showContent)
	showContent: function(e, routing) {
		e.stopPropagation();
		var $this = $(e.target),
			$files = $(".content li");

		if (e.target.tagName.toLowerCase() === "a") {
			if (!$this.parent().hasClass("selected")) {
				//removeClass of every subMenu item
				$files.removeClass("selected");
				if (routing) {
					$this.parent().addClass("selected");
				} else {
					$this.parent().toggleClass("selected");
				}
				var file = this.getModelByName(this.files.models, $this.text());
				this.updateViewArea({fileID: file.id, src: file.get("path"), type: file.get("type")});
			}
		}
	},
	/*Filter events*/
	filterBySearch: function() {
		this.render();
	},
	filterByType: function() {
		if (!this.$types.find('a[href^=#'+this.filterType+']').hasClass('selected')) {
			AppRouter.navigate('filter/' + this.filterType);
			this.render();
		}
	},
	clearSearch: function() {
		$('.clear').hide();
		this.searchFilter = "";
		$('#searchBox').val(this.searchFilter);

		this.render();
		AppRouter.navigate('filter/' + this.filterType);

		this.$el.find('.content li').removeHighlight();
	},
	setSearchFilter: _.debounce(function(e) {
		if (this.searchFilter !== e.target.value) {
			this.searchFilter = e.target.value;
			this.trigger('change:filterBySearch');
			this.toggleFoldersView();
		}
	}, 300),
	setFilter: function(e) {
		e.preventDefault();
		this.filterType = e.currentTarget.innerHTML.toLowerCase();
		this.trigger('change:filterByType');
	},
	//Returns a collection of folders filtered files by search value and type
	getFilteredBySearchAndType: function(str, type) {
		//store a copy of collection, so that we don't alter the original
		var tmpJsonCollection = this.collection.toJSON(),
			tmpCollection = new app.FolderList(tmpJsonCollection);
		
		tmpCollection.each(function(model, index) {
			var files = model.get("files"),
				//only accept same type
				newFiles = _.filter(files, function(file) {
					if (type === 'all') {
						return file.get("name").toLowerCase().indexOf(str.toLowerCase()) !== -1;
					} else {
						return file.get("name").toLowerCase().indexOf(str.toLowerCase()) !== -1 && file.get("type") === type;
					}
				});
			model.set("files", newFiles);
		});

		if (type !== "all" || str !== "") {
			//refresh folders to show that contains files
			return _.filter(tmpCollection.models, function(model) {
				return typeof(model) === "object"
						&& model.get("files")
						&& model.get("files").length !== 0;
			});
		}
		return tmpJsonCollection;
	},
	updateSearchUI: function() {
		$('.clear').hide();
		if (this.searchFilter !== "") {
			$('.clear').show();
		}
		//highlight searchFilter in filenames
		this.$el.find('.content li').highlight(this.searchFilter);
	},
	updateFiltersUI: function() {
		this.$types.find('a').removeClass('selected');
		this.$types.find('a[href^=#'+this.filterType+']').addClass('selected');
		//highlight searchFilter in filenames
		this.$el.find('.content li').highlight(this.searchFilter);
	},
	//@param data: object {fileID:"", src:"", type:""}
	updateViewArea: function(data) {
		FileCommentsView.trigger("change:updateView", data);
	}
});