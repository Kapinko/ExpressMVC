/**
 * OAuth functionality plugin accessor.
 */
module.exports	= (function () {
	return {
		'header': require(__dirname + '/header'),
		'signature': require(__dirname + '/signature')
	};
}());