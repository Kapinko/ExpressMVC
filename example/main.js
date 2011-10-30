/**
 * The main application file
 */

(function() {
	var config_path	= __dirname + '/config',
		ExpressMVC	= require('../lib/mvc');
		
	new ExpressMVC(config_path, function (mvc) {
		mvc.Controller('index');
		
		mvc.run();
	});
}());