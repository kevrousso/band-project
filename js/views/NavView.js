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
	initialize: function() {
		//caching...
		var that = this;

		this.$el.fadeIn(250).css("display", "table-cell");

		this.$navContent = this.$el.find("#navContent");
		this.$scrollable = this.$el.find(".scrollable");
		
		this.$formAddFile = this.$el.find("#upload");
		this.$spinner = this.$el.find(".spinner");
		this.$filters = this.$el.find("#filters");
		this.$types = this.$filters.find("#types");
		this.$container = $('#container');

		this.$logout = $("a.logout");
		this.$logout.show();
		
		this.resize();
		//$(window).on("resize", this.resize);

		//load proper template
		app.utils.loadTemplate("NavView");

		this.collection = new app.FolderList();
		this.files = new app.FileList();

		//Set default filters
		this.filterType = "all";
		this.searchFilter = '';

		this.getFiles(this.getFolders);

		this.on('change:filterByType', this.filterByType, this);
		this.on('change:filterBySearch', this.filterBySearch, this);
		this.on('change:updateViewArea', this.updateViewArea, this);

		//this.collection.on('all', this.render, this);
		//this.files.on('all', this.render, this);

		//prepare context menu
		this._createContextMenu();
		return this;
	},
	resize: function() {
		var that = this;
		//set max width of navView to 50%
		this.maxWidth = this.$container.width() / 2;
		this.$el.resizable({ handles: "e", "maxWidth": that.maxWidth });
	},
	render: function() {
		var that = this,
			filtered = this.getFilteredBySearchAndType(this.searchFilter, this.filterType);

		this.filteredList = new app.FolderList(filtered);

		this.$navContent.hide().html("");

		//TODO: updateSpinner()
		this.$spinner.show().css("display", "table-cell");
		if (this.filteredList.length) {
			this.filteredList.each(function(folder) {
				that.$navContent.append( that.template( {item: folder.toJSON()} ) );
			});
		}
		//TODO: maybe make a function toggleSpinner( spinner, $elToShow )
		this.$spinner.fadeOut(250, function() {
			that.$navContent.fadeIn(250);
		});

		//empty and update Filters
		this.$types.html("").append(that._createFilters());
		this.updateSearchUI();
		this.updateFiltersUI();
		this.$scrollable.perfectScrollbar({
			suppressScrollX: true,
			minScrollbarLength: 100,
			useKeyboard: false
		});
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
						// disable deleting if not over folder or file
						return !this.hasClass("dir") && !this.hasClass("file");
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
				var foldername = prompt("Enter a folder name", "");
				if (foldername && foldername.trim() !== "") {
					//validate that there isn't already a folder with that name
					if (that.isFolderNameUnique(foldername)) {
						//get max id and incremente it by 1 because ids are Unique
						var nextID = that.getNextModelID(that.collection.models),
							newFolder = new app.Folder({
								id: nextID,
								name: $.trim(foldername),
								machineName: $.trim(app.utils.cleanUpSpecialChars(foldername))
							});
						
						that.collection.add(newFolder);
						app.utils.postData("postFolder", newFolder.toJSON());
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
						fileType = fileInfo.type.split("/")[0];

					if (fileInfo && fileInfo.size < 10485760) { // 10 MB (this size is in bytes)
						if (that.isFileNameUnique(filename)) {
							var folder = that.getModelByName(that.collection.models, name),
								folderID = folder.get("id"),
								currentfiles = folder.get("files"),
								nextID = that.getNextModelID(that.files.models);

							if (fileType !== "audio" && fileType !== "video" && fileType !== "image") {
								fileType = "file";
							}
							var newFile = new app.File({
								id: nextID,
								name: $.trim(filename),
								machineName: $.trim(app.utils.cleanUpSpecialChars(filename)),
								folderID: folderID,
								type: fileType
							});

							//update files collection
							that.files.models.push(newFile);
							currentfiles.push(newFile);

							that.render();

							////can't use this as we need the file to be posted $_FILES
							//TODO: look in utils.js for uploadFile()
							//app.utils.postData("postFile", newFile.toJSON());

							that.$formAddFile.find("input[name=fileName]").val(newFile.get("name"));
							that.$formAddFile.find("input[name=fileMachineName]").val(newFile.get("machineName"));
							that.$formAddFile.find("input[name=fileFolderID]").val(newFile.get("folderID"));
							that.$formAddFile.find("input[name=fileType]").val(newFile.get("type"));
							that.$formAddFile.find("input[name=folderMachineName]").val(folder.get("machineName"));
							that.$formAddFile.submit();
						} else {
							alert("File already exist in that folder.");
						}
					} else {
						//Prevent default and display error
						e.preventDefault();
						alert("File is exceeding max file size of: 10MB.");
					}
					//reset the input file
					$(this).val("");
				});
				this.$formAddFile.find("input").trigger("click");
			break;
			case "rename":
				var newName = prompt("Enter a new name", name);
				if (newName && newName.trim() !== "") {
					var newMachineName = $.trim(app.utils.cleanUpSpecialChars(newName)),
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
						app.utils.postData("renameFolder", {id: id, oldMachineName: oldMachineName, newName: newName, newMachineName: newMachineName});
						that.renameElement(type, name, newName, newMachineName, "");
						that.render();
					} else if (type === "file") {
						folder = that.getModelByID(that.collection.models, model.get("folderID"));
						app.utils.postData("renameFile", 
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
			break;
			case "delete":
				var msg = 'Do you really want to permanantly delete '+ type +' "'+ name +'" ?',
					fileModel, folderModel;
				if ($el.find("a").hasClass("hasContent")) {
					msg = 'Do you really want to permanantly delete '+ type +' "'+ name +'" and ALL it\'s content ?';
				}
				if (window.confirm(msg)) { 
					//remove model from collection and RENDER
					if (type === "folder") {
						folderModel = that.getModelByName(that.collection.models, name);
						app.utils.postData("deleteFolder", folderModel.toJSON());

						//TODO: delete files in folderModel first, and delete folder

						that.collection.remove(folderModel);
					} else {
						fileModel = that.getModelByName(that.files.models, name);
						folder = that.getModelByID(that.collection.models, fileModel.get("folderID"));

						that.removeFileByName(name);
						app.utils.postData("deleteFile", 
							{fileID: fileModel.get("id"), fileMachineName: fileModel.get("machineName"), folderMachineName: folder.get("machineName")});
					}
					that.render();
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
	//@param name: string
	//return: bool
	isFileNameUnique: function(name) {
		/*var unique = true;
		_.each(this.files.models, function(file) {
			if (file.get('name') === name) {
				unique = false;
			} 
		});
		return unique;*/
		return !this.files.findWhere({name: name})
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
			}
		});
	},
	getFolders: function() {
		var that = this;
		this.collection.fetch({
			data: {action: 'getFolders'},
			type: "POST",
			success: function(model, response) {
				if (that.collection) {
					that.mergeFilesInFolders();

					//createFilters
					that.$types.append(that._createFilters());
					//do not render if we have a route
					if (!window.location.hash) {
						that.render();
					}

					if (!Backbone.History.started) {
						//make sure links gets registered by the router
						AppRouter = new app.Router();
						Backbone.history.start();
					}
				} else {
					//TODO: updateSpinner()
					this.$spinner.hide();
					this.$navContent.show().html("No directories to display");
				}
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
	// TODO: make function without args, bing it to (change:toggleFolderView)
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
	// TODO: make function without args, bing it to (change:showContent)
	showContent: function(e, routing) {
		var $this = $(e.target),
			$files = $(".content li");

		if (!$this.parent().hasClass("selected")) {
			//removeClass of every subMenu item
			$files.removeClass("selected");
			if (routing) {
				$this.parent().addClass("selected");
			} else {
				$this.parent().toggleClass("selected");
			}
			var file = this.getModelByName(this.files.models, $this.text());
			this.trigger("change:updateViewArea", {fileID: file.id, src: file.get("path"), type: file.get("type")});
		}
	},
	/*Filter events*/
	filterBySearch: function() {
		this.render();
	},
	filterByType: function() {
		if (!this.$types.find('a[href^=#'+this.filterType+']').hasClass('selected')) {
			this.render();
			AppRouter.navigate('filter/' + this.filterType);
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
	setSearchFilter: function(e) {
		this.searchFilter = e.target.value;
		this.trigger('change:filterBySearch');
	},
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

		if (type !== "all") {
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