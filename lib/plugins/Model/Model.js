/**
 * Model plugin functionality accessor.
 * @param {MVC} MVC
 * @param {HTTPServer} server
 * @return {Object.<string,*>}
 */
module.exports	= (function (MVC, server) {
	return {
		'MySQL': require (__dirname + '/mysql')
	};
});