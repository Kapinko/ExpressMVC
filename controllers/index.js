/**
 * This is the index controller.
 */
module.exports	= (function (app) {
	app.namespace('/', function () {
		app.all('/', function (req, res, next) {
			res.render('index/index', {
				'heading': 'Hello World! the time is: ' + new Date().toString()
			});
		});
	});
});