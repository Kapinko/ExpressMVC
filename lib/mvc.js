/**
 * This is the initalization file for the ExpressMVC framework.
 */

(function () {
	var _			= require('uquery'),
		express		= require('express'),
		path		= require('path'),
		form		= require('connect-form'),
		//This is the system library load loader.
		loader		= require('./loader'),
		CoreLib		= loader(),
		Config		= CoreLib('config'),
        
        /**
         * An object cache for the various loader functions.
         * @type {Object.<string,*>}
         */
        loader_cache    = {},
        
        /**
         * Set up the logger if configured
         * @param {Config} config
         * @return {log}
         */
		load_logger	= function (config) {
			var file	= config.getValue('log.file'),
				level	= config.getValue('log.level') || 'DEBUG',
				stream	= null,
				fs		= require('fs'),
				Log		= require('log');
			
			//only turn on logging if we have a configured file.
			if (file) {
				stream		= fs.createWriteStream(file, {
					flags: 'a+',
					encoding: 'utf8'
				});
			}
			return new Log(level, stream);
		},
        
        /**
         *  Load a given cache store
         * @param {string} name
         * @return {Object.<string,*>}
         */
        get_cache_store = function (name) {
            if (!loader_cache.hasOwnProperty(name)) {
                loader_cache[name]  = {};
            }
            return loader_cache[name];
        },
		
		/**
		 * Abstraction of the object loading.
		 * @param {string} name
		 * @param {string} base_dir
		 * @return {*}
		 */
		mvc_loader	= function (name, base_dir) {
			var object,
                object_path = path.join(path.normalize(base_dir), name),
                cache       = get_cache_store('mvc');
            
            //Let's cache our loaded objects.
            if (cache.hasOwnProperty(object_path)) {
                object      = cache[object_path];
			} else if (path.existsSync(object_path + '.js')) {
				object      = require(object_path);
			} else {
				this.logger.notice("Unable to load MVC object: " + object_path);
			}
			
			if (object) {
				cache[object_path]	= object;
			}
            
            return object;
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
			this.controller_path	= this.config.getValue('application.controller.path');
			
			if (!this.controller_path) {
				this.controller_path	= this.application_path + '/controllers';
			}
            
            /**
             * This is the setting for the model path.
             * @var {string}
             */
            this.model_path    = this.config.getValue('application.model.path');
            
            if (!this.model_path) {
                this.model_path         = this.application_path + '/models';
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
			
			/**
			 * This is the setting for the static files path.
			 * @var {string}
			 */
			this.static_path		= this.config.getValue('application.static.path');
		};
	
	//required express plugins
	require('express-namespace');
	
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
		this.logger	= load_logger(config);
				
		var	lib_func	= _.bind(this.Library, this),
			server		= express.createServer(
				form({
					keepExtensions: true
				})
			);
		this.server		= server;
		
		setup_paths.call(this);
		
		server.configure(_.bind(function () {
			server.register('.stache', lib_func('mustache'));
			server.set('view engine', 'stache');
			server.set('views', this.view_path);
			
			server.use(express.bodyParser());
			server.use(express.cookieParser());
			server.use(express.session({
				"secret": this.config.sessionSecret || "All this crazy stuff"
			}));
			server.use(server.router);
			
			var error_handler_opts	= {};
			
			if (this.config.getValue('application.debug')) {
				error_handler_opts	= {dump: true, stack: true};
			}
			
			server.use(express.errorHandler(error_handler_opts));
			
			if (this.static_path) {
				server.use(express.static(this.static_path, { maxAge: 'oneYear' }));
			}
		}, this));
		
		callback(this, server);
		return this;
	};
	
	MVC.prototype.run	= function () {
		var port	= this.config.getValue('application.listen');
		this.logger.info('Listening on port: ' + port);
		this.server.listen(port);
	};
	
	MVC.prototype.Controller	= function (name) {
		var args	= Array.prototype.slice.call(arguments, 1);
		args.unshift(this.server);
		args.unshift(this);
		
		return mvc_loader.call(this, name, this.controller_path).apply(null, args);
	};
    
    MVC.prototype.Model         = function (name) {
        return mvc_loader.call(this, name, this.model_path);
    };
	
	MVC.prototype.Plugin		= function (name) {
		var file		= this.config.getValue('application.plugin.file') || name,
			args		= Array.prototype.slice.call(arguments, 1),
			plugin;
			
			args.unshift(this.server);
			args.unshift(this);
			
		file	= name + '/' + file;
		plugin	= mvc_loader.call(this, file, this.plugin_path);
		
		if (!plugin) {
			this.logger.notice("Loading Application specific plugin: " + name);
			plugin	= mvc_loader.call(this, file, this.application_path + '/plugins');
		} else {
			this.logger.notice("Loaded ExpressMVC plugin: " + name);
		}
		
		if (plugin)	{
			plugin	= plugin.apply(null, args);
		}
		
		return plugin;
	};
	
	MVC.prototype.addLibrary	= function (name, base_dir, main_file_name) {
		var lib_loader		= loader(base_dir, main_file_name);
		this.loaders[name]	= lib_loader;
		
		return lib_loader;
	};
	
	MVC.prototype.Library		= function (name, type) {
		var lib, 
			args	= Array.prototype.slice.call(arguments, 2);
			
		args.unshift(name);
		
		if (!type) {
			lib	= CoreLib.apply(null, args);
			
		} else {
			lib	= this.loaders[type].apply(null, args);
		}
		
		return lib;
	};
	
	//Expose the model library 
	MVC.Model	= CoreLib('model');
	
	//Expose the CoreLib loader
	MVC.CoreLib	= CoreLib;
	
	//Expose the uQuery library
	MVC.uquery	= _;
	
	//expose the MVC object
	module.exports	= MVC;
}());