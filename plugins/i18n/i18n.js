(function () {
	var _	= require('underscore');
	
	module.exports	= function (MVC, server) {
		var i18n		= MVC.Library('i18n'),
			locale		= MVC.config.getValue('application.i18n.locale') || null,
			i18n_dir	= MVC.config.getValue('application.i18n.path') 
						|| MVC.application_path + '/i18n';
			
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
				var strings	= i18n.load(template, locale)(server);
				
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