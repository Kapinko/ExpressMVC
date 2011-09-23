(function () {
	var express				= require('express'),
		HTTPServer			= express.HTTPServer,
		HTTPSServer			= express.HTTPSServer,
		default_base_dir	= require('path').join(__dirname, '../', '../');
	
	require('express-namespace');
	require('express-params');
	
	function Controller(name) {
		var base_dir		= this.set('base_dir') || default_base_dir;
		require(base_dir + '/controllers/' + name)(this);
	}
	
	exports	= module.exports		= Controller;
	HTTPServer.prototype.Controller	= HTTPSServer.prototype.Controller	= Controller;
}());