(function () {
	var path				= require('path'),
		default_base_dir	= './';
		
	function Loader(base_dir, main_file_name) {
		base_dir		= base_dir || default_base_dir;
		
		return function (name) {
			var file		= main_file_name || name,
				object_path	= base_dir + path.join(name, file);
				
			return require(object_path);
		};
	}
	module.exports	= Loader;	
}());