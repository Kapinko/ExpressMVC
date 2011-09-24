/**
 * The main application file
 */

(function() {
	var express	= require('express'),
	form		= require('connect-form'), app;
	
	require('./lib/lib');
	
	app			= express.createServer(form({
		keepExtensions: true
	}));
	
	app.Library('controller');
	app.Library('plugin');
	
	app.configure(function () {
		app.register('.stache', app.Library('mustache'))
		app.set('view engine', 'stache');
	});
	
	app.Controller('index');

	app.listen(8080);
}());