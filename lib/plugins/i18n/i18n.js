(function () {
	var _		= require('underscore'),
		path	= require('path'),
		/**
		 * Parse an i18n file name from the given template name.
		 * @param {string} template_name
		 * @return {string}
		 */
		i18n_name	= function (template_name) {
			var ext	= path.extname(template_name);
			
			return template_name.replace(ext, '');
		},
		/**
		 * Retrieve the layout string file if we're given a template or the
		 * default template if set to use one.
		 * @param {HTTPServer} server
		 * @param {Object.<string,*>} options
		 * @return {string|null}
		 */
		i18n_layout	= function (server, options) {
			var layout			= null,
				view_options;
			
			if (options.hasOwnProperty('layout')) {
				layout	= options.layout;
			}
			
			if (layout === null) {
				view_options	= server.set('view_options');
					
				if (view_options && view_options.hasOwnProperty('layout')) {
					layout		= view_options.layout;
				}
			}
			
			if (layout) {
				if (typeof layout !== 'string') {
					//load the default layout as defined int expressjs
					layout	= 'layout';
				} else {
					layout	= i18n_name(layout);
				}
			}
			
			return layout;
		};
	
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
				var file	= i18n_name(template),
					strings	= i18n.load(file, locale),
					layout	= i18n.load(i18n_layout(server, options), locale);
					
				if (typeof strings === 'function') {
					strings	= strings(options);
				} else {
					console.warn('Invalid i18n file (must be a function): ' + file);
				}
				
				if (!typeof layout === 'function') {
					layout	= layout(options);
				} else {
					console.warn('Invalid i18n layout file (must be a function): ' + file);
				}
				
				options		= options || {};
				
				if (strings || layout) {
					_.extend(options, layout, strings);
				}
				render.call(this, template, options);
			}
			
			next();
		};
	};
}());