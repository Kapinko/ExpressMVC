/**
 * OAuth functionality plugin accessor.
 * @param {MVC} MVC
 * @param {HTTPServer} server
 * @return {Object.<string,*>}
 */
module.exports	= (function (MVC, server) {
	return {
		'header': require(__dirname + '/header'),
		'signature': require(__dirname + '/signature'),
        'container': require(__dirname + '/lib/oauth')
	};
});