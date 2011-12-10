/**
 * This is the main plugin for creating and loading validation plugins.
 */
 
module.exports	= function (MVC, server) {
	var	form		= require('express-form'),
		loader		= (function () {
			var main_path		= MVC.config.getValue('application.validator.path') || 
					(MVC.config.getValue('application.path') + '/validators'),
				lookup_paths	= [main_path];
			
			return {
				'load': function (name) {
					var paths	= lookup_paths,
						attempt	= function () {
							var current_path	= paths.pop();
							
							try {
								return require(current_path + '/' + name);
								
							} catch (e) {
								if (paths.length > 0) {
									attempt();	
								} else {
									throw "Unable to find requested validator: " + 
										name;
								}
							}
						};
						
					return attempt();
				},
				'addPath': function (path) {
					lookup_paths.push(path);
				}
			};
		}());
	
	/**
	 * Load a pre-made validation plugin function. This is useful when you want
	 * to create a validation function that needs to be shared across multiple
	 * controllers and/or multiple sites.
	 * @param {string} name
	 * @return {function}
	 */
	form.load	=	function (name) {
		var validator	= loader.load(name);
		return validator(MVC, server, form);
	};
	
	/**
	 * Add a path to try when loading pre-made validators. This method is 
	 * chainable.
	 * @param {string} path
	 * @return {form}
	 */
	form.addPath	= function (path) {
		loader.addPath(path);
		return this;
	};
	
	return form;
 };