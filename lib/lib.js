
(function () {
	var express		= require('express'),
		path		= require('path'),
		HTTPServer	= express.HTTPServer,
		HTTPSServer	= express.HTTPSServer,
		base_dir	= './',
		main_name	= null;
		
	function Lib(name) {
		var file		= main_name || name,
			lib_path	= base_dir + path.join(name, file);

		return require(lib_path);
	}
		
	Lib.setBaseDir	= function (dir) {
		base_dir	= dir;
	};

	Lib.setMain		= function (name) {
		main_name	= name;
	}
	
	exports	= module.exports	= Lib;
	HTTPServer.prototype.Library	= HTTPSServer.prototype.Library	= Lib;
}());