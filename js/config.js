var app = app || {};

app.Config = {
	//TODO: add in utils postData, and add callback to every posts
	debug: false,

	//"en" | "fr"
	//TODO: then load proper json file containing translations
	language: "en",

	allow_deleting_folders_with_files: false,

	//width in %.
	max_width_for_nav_view: 50,

	//maybe just "../css/theme1.css" | "../css/theme2.css"...
	theme: ""

}