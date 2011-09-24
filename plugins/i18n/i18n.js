(function () {
	var _	= require('underscore');
	
	module.exports	= function (app) {
		var i18n		= app.Library('i18n'),
			locale		= app.set('locale') || null,
			i18n_dir	= app.set('i18n_dir') || null;
			
		if (locale) {
			i18n.setLocale(locale);
		}
		if (i18n_dir) {
			i18n.setPath(i18n_dir);
		}
		
		return function (req, res, next) {
			//proxy the render function
			var render	= res.render;
			
			res.render	= function (template, options) {
				var strings	= i18n.load(template, locale)(app);
				
				options		= options || {};
				
				if (strings) {
					_.extend(options, strings);
				}
				render.call(this, template, options);
			}
			
			next();
		};
	};
}());