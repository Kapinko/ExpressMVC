/**
 * This is the index controller.
 */
/**
 * @param {MVC} MVC
 * @param {HTTPServer} server
 */
module.exports	= (function (MVC, server) {
	server.namespace('/', function () {
		server.all('/', MVC.Plugin('i18n'), function (req, res, next) {
			res.render('index/index');
		});
	});
});