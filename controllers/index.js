/**
 * This is the index controller.
 */
module.exports	= (function (app) {
	app.namespace('/', function () {
		app.all('/', app.Plugin('i18n'), function (req, res, next) {
			res.render('index/index');
		});
	});
});