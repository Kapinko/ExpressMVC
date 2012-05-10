/**
 * An access point for the ExpressMVC model library.
 */
module.exports	= (function () {
	return {
		'MySQL': require(__dirname + '/mysql')
	}
}());