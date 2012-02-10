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
					var paths	= lookup_paths.slice(0),
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
		}()),
        /**
         * Initialize the express-validator framework.
         * @param {Object.<string,*>} req
         */
        init    = function (req) {
            var check   = req.check;
            
            req.validation_initialized  = true;
            
            req.form    = req.form || {};
            
            req.validation  = req.validation || {
                'isValid': true,
                'errors': {},
                /**
                 * Allow the user to add in a custom validation error.
                 * @param {string} param
                 * @param {string} error
                 */
                'addError': function (param, error) {
                    req.validation.isValid  = false;
                    
                    if (!req.validation.errors.hasOwnProperty(param)) {
                        req.validation.errors[param]    = [];
                    }
                    req.validation.errors[param].push(error);
                }
            };
                
            req.assert = req.check = function(param, msg) {
                req.form[param] = req.param(param);
                return check.call(this, param, {
                    'param': param,
                    'error': msg
                });
            };
			
			req.onValidationError(function (msg) {
				req.validation.addError(msg.param, msg.error);
			});
        };
	
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
	
	/**
	 * Create a new form validation plugin using the express-validator plugin.
	 * @param {function()} validator
	 * @return {function()}
	 */
	form.create		= function (validator) {
		return function (req) {
            if (!req.validation_initialized) {
                init(req);
            }
			validator.apply(null, arguments);
		};
	};
	
	return form;
 };