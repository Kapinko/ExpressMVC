/**
 * This is the initalization file for the ExpressMVC framework.
 */

(function () {
	var _			= require('underscore'),
		express		= require('express'),
		path		= require('path'),
		form		= require('connect-form'),
		//This is the system library load loader.
		loader		= require('./lib/loader'),
		CoreLib		= loader(),
		Config		= CoreLib('config'),
		
		/**
		 * Abstraction of the object loading.
		 * @param {string} name
		 * @param {string} base_dir
		 * @return {*}
		 */
		mvc_loader	= function (name, base_dir) {
			var object_path;

			object_path		= path.join(path.normalize(base_dir), name);
			return require(object_path);
		},
		
		/**
		 * A private function to set up the MVC paths.
		 */
		setup_paths	= function() {
			/**
			 * This is the base path for your application.
			 * @var {string}
			 */
			this.application_path	= this.config.getValue('application.path');

			if (!this.application_path) {
				throw new Exception('You must set the application path.');
			}

			/**
			 * This is the setting for the plugin paths.
			 * @var {string}
			 */
			this.plugin_path		= this.config.getValue('application.plugin.path');

			if (!this.plugin_path) {
				this.plugin_path	= __dirname + '/plugins';
			}

			/**
			 * This is the setting for the library paths.
			 * @var {string}
			 */
			this.lib_path			= this.config.getValue('application.library.path');

			if (!this.library_path) {
				this.library_path	= __dirname + '/lib';
			}
			
			/**
			 * This is the setting for the controller path.
			 * @var {string}
			 */
			this._controller_path	= this.config.getValue('application.controller.path');
			
			if (!this.controller_path) {
				this.controller_path	= this.application_path + '/controllers';
			}
			
			/**
			 * This is the setting for the view path.
			 * @var {string}
			 */
			this.view_path			= this.config.getValue('application.view.path');
			
			if (!this.view_path) {
				this.view_path			= this.application_path + '/views';
			}
			
			/**
			 * This is the setting for the i18n path.
			 * @var {string}
			 */
			this.i18n_path			= this.config.getValue('application.i18n.path');
			
			if (!this.i18n_path) {
				this.i18n_path		= this.application_path + '/i18n';
			}
		};
	
	//required express plugins
	require('express-namespace');
	require('express-params');
	
	/**
	 * @param {string} config_path - the path for this application's 
	 *				configuration files. Must be an absolute path.
	 * @param {Function} callback - the function that will be run on application
	 *				initialization completion.
	 */
	function MVC(config_path, callback) {
		var config	= new Config();
		config.load(config_path, _.bind(this.init, this, callback));
	}
	/**
	 * This is the MVC framework initialization function.  This will be run
	 * immediately after the configuration has bee loaded.
	 * @param {Config} config
	 * @return {MVC}
	 */
	MVC.prototype.init	= function(callback, config) {
		/**
		 * @type {Config}
		 */
		this.config	= config;
				
		var	lib_func	= _.bind(this.Library, this),
			server		= express.createServer(
				form({
					keepExtensions: true
				})
			);
		this.server		= server;
		
		server.configure(function () {
			server.register('.stache', lib_func('mustache'));
			server.set('view engine', 'stache');
		});
		
		setup_paths.call(this);
		
		callback(this, server);
		return this;
	}
	
	MVC.prototype.run	= function () {
		var port	= this.config.getValue('application.listen');
		this.server.listen(port);
	};
	
	MVC.prototype.Controller	= function (name) {
		return mvc_loader.call(this, name, this.controller_path)(this, this.server);
	};
	
	MVC.prototype.Plugin		= function (name) {
		var file	= this.config.getValue('application.plugin.file') || name,
			plugin;
		
		try {
			plugin	= mvc_loader.call(this, name + '/' + file, this.plugin_path)(this, this.server);
		} catch (e) {
			plugin	= mvc_loader.call(this, name + '/' + file, this.application_path + '/plugins')(this, this.server);
		}
		
		return plugin;
	}
	
	MVC.prototype.addLibrary	= function (name, base_dir, main_file_name) {
		var lib_loader		= loader(base_dir, main_file_name);
		this.loaders[name]	= lib_loader;
		
		return lib_loader;
	}
	
	MVC.prototype.Library		= function (name, type) {
		var lib;
		
		if (!type) {
			lib	= CoreLib(name);
			
		} else {
			lib	= this.loaders[type](name);
		}
		
		return lib;
	}
	
	//expose the MVC object
	module.exports	= MVC;
}());