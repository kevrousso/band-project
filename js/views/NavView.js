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
			this.$formAddFile = $("#upload");
			this.$spinner = this.$el.find(".spinner");
			this.$filters = this.$el.find("#filters");
			this.$types = this.$filters.find("#types");
			this.$container = $('#container');
			this.maxWidth = this.$container.width() / 2;

			this.$el.resizable({ handles: "e", "maxWidth": that.maxWidth });

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
		render: function() {
			var that = this,
				filtered = this.getFilteredBySearchAndType(this.searchFilter, this.filterType);

			this.filteredList = new app.FolderList(filtered);

			this.$navContent.hide().html("");
			this.$spinner.show().css("display", "table-cell");
			if ( this.filteredList.length ) {
				this.filteredList.each(function(folder) {
					that.$navContent.append( that.template( {item: folder.toJSON()} ) );
				});
			}
			//TODO: maybe make a function toggleSpinner( spinner, $elToShow )
			this.$spinner.fadeOut(250, function() {
				that.$navContent.fadeIn(250);
			});

			this.updateSearchUI();
			this.updateFiltersUI();
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
								newFolder = new app.Folder({ id: nextID, name: foldername, machineName: foldername });
							
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
									name: filename,
									machineName: app.utils.cleanUpSpecialChars(filename),
									folderID: folderID,
									type: fileType
								});

								//update files collection
								that.files.models.push(newFile);
								currentfiles.push(newFile);

								that.render();

								//can't use this as we need the file to be posted $_FILES
								//app.utils.postData("postFile", newFile.toJSON());

								that.$formAddFile.find("input[name=fileName]").val(newFile.get("name"));
								that.$formAddFile.find("input[name=fileMachineName]").val(newFile.get("machineName"));
								that.$formAddFile.find("input[name=fileFolderID]").val(newFile.get("folderID"));
								that.$formAddFile.find("input[name=fileType]").val(newFile.get("type"));
								that.$formAddFile.submit();
							} else {
								alert("File already exist in that folder.");
							}
						} else {
							//Prevent default and display error
							e.preventDefault();
							alert("File is exceeding max file size of: 10mb.");
						}
						//reset the input file
						$(this).val("");
					});
					this.$formAddFile.find("input").trigger("click");
				break;
				case "rename":
					var newName = prompt("Enter a new name", name);
					if (newName && newName.trim() !== "") {
						var newMachineName = app.utils.cleanUpSpecialChars(newName),
							model, oldName = "", id = 0;
						if (type === "folder") {
							model = that.getModelByName(that.collection.models, name);
						} else if (type === "file") {
							model = that.getModelByName(that.files.models, name);
						}
						oldName = model.get("machineName");
						id = model.get("id");

						that.renameElement(type, name, newName, newMachineName);

						//TODO: test renameFolder()
						if (type === "folder") {
							app.utils.postData("renameFolder", {id: id, oldName: oldName, newName: newName, newMachineName: newMachineName});
						} else if (type === "file") {
							app.utils.postData("renameFile", {id: id, oldName: oldName, newName: newName, newMachineName: newMachineName});
						}
					}
				break;
				case "delete":
					var msg = 'Do you really want to permanantly delete '+ type +' "'+ name +'" ?',
						modelMachineName = "", fileModel, folderModel;
					if ($el.find("a").hasClass("hasContent")) {
						msg = 'Do you really want to permanantly delete '+ type +' "'+ name +'" and ALL it\'s content ?';
					}
					if (window.confirm(msg)) { 
						//remove model from collection and RENDER
						if (type === "folder") {
							folderModel = that.getModelByName(that.collection.models, name);
							app.utils.postData("deleteFolder", folderModel.toJSON());

							//TODO: if it contains files....call deleteFile on each
							//actually, on cascade delete should handle this

							that.collection.remove(folderModel);
						} else {
							fileModel = that.getModelByName(that.files.models, name);
							that.removeFileByName(name);
							app.utils.postData("deleteFile", fileModel.get("machineName"));
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
		renameElement: function(type, oldName, name, machineName) {
			var model;
			if (type === "folder") {
				model = this.getModelByName(this.collection.models, oldName);
			} else if (type === "file") {
				model = this.getModelByName(this.files.models, oldName);
			}
			model.set("name", name);
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
			var unique = true;
			_.each(this.files.models, function(file) {
				if (file.get('name') === name) {
					unique = false;
				} 
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
		//@param name: string
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
					if (callback) {
						callback.call(that);
					} else {
						alert("No callback provided for method getFiles()");
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
					if (that.collection) {
						//merge the files in folders, matching folder.id -> file.folderID
						that.collection.each(function(folder, index) {
							that.files.each(function(file, index) {
								var associatedFile = that.files.filter(function(file) {
									return folder.id === file.get("folderID");
								});
								folder.set("files", associatedFile);
							});
						});
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
						this.$spinner.hide();
						this.$navContent.show().html("No directories to display");
					}
				}
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
			return false;
		},
		// TODO: make function without args, bing it to (change:showContent)
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
				var file = this.getModelByName(this.files.models, $this.text());
				this.trigger("change:updateViewArea", {fileID: file.id, src: src, type: type} );
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
			return tmpCollection.each(function(model, index) {
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
		},
		//@param data: object {src: , type: }
		updateViewArea: function(data) {
			ConvoView.trigger("change:updateView", data);
		}
	});