(function () {
	var express			= require('express'),
		HTTPServer		= express.HTTPServer,
		HTTPSServer		= express.HTTPSServer;
	
	module.exports	= function (name, extension) {
		HTTPServer.prototype[name]	= HTTPSServer.prototype[name]	= extension;
	}
}());