/**
 * This is the initalization file for the ExpressMVC framework.
 */

(function () {
	var express		= require('express'),
		path		= require('path'),
		form		= require('connect-form'),
		//This is the system library load loader.
		loader		= require('./lib/loader'),
		CoreLib		= loader(),
		
		/**
		 * Abstraction of the object loading.
		 * @param {string} name
		 * @param {string} base_dir_setting
		 * @return {*}
		 */
		mvc_loader	= function (name, base_dir_setting) {
			var object_path,
			base_dir	= this.app.set('controller_dir');
		
			if (!base_dir) {
				throw new Exception('You must set the "' + base_dir_setting + '"');
			}

			object_path		= path.join(path.normalize(base_dir), name);
			return require(object_path);
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
		var app	= express.createServer(
			form({
				keepExtensions: true
			})
		);
		
		app.configure(function () {
			app.register('.stache', app.Library('mustache'));
			app.set('view engine', 'stache');
		});
		
		this.app	= app;
	}
	MVC.prototype.run	= function () {
		this.app.listen(8080);
	};
	
	MVC.prototype.Controller	= function (name) {
		return mvc_loader.call(this, name, 'controller_dir')(MVC, this.app);
	};
	
	MVC.prototype.Plugin		= function (name) {
		var file	= this.app.set('plugin_file_name') || name;
		return mvc_loader.call(this, name + '/' + name, 'plugin_dir')(MVC, this.app);
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