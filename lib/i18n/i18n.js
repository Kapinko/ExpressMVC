module.exports	= (function () {
	var DEFAULT_LOCALE	= 'en_US',
	path		= require('path'),
	cache		= {},
	locale		= DEFAULT_LOCALE,
	base_path	= __dirname + '/../../i18n';
	
	return {
		'load': function (name, custom_locale) {
			var i18n_locale	= custom_locale || locale,
			i18n_path		= path.join(base_path, i18n_locale, name),
			i18n			= function () { return {}; };
			
			if (cache.hasOwnProperty(i18n_path)) {
				i18n	= cache[i18n_path];
				
			} else if (path.existsSync(i18n_path + '.js')) {
				i18n	= require(i18n_path);
				
			} else if (i18n_locale !== DEFAULT_LOCALE) {
				i18n_path			= path.join(base_path, DEFAULT_LOCALE, name);
				i18n				= require(i18n_path);
				cache[i18n_path]	= i18n;
			}
			
			return i18n;
		},
		'setLocale': function (locale) {
			locale	= locale;
			return this;
		},
		'setPath': function (new_path) {
			base_path	= new_path;
			return this;
		}
	}
}());