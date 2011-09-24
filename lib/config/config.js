/**
 *An object that give the user the ability to load a configuration file.
 */
/*jslint node:true, nomen:true*/
/*global module:false,process:false*/
"use strict";

module.exports	= (function () {
	var _			= require('underscore'),
		fs			= require('fs'),
		xml2js		= require('xml2js'),
		DotNotation	= require('./helpers/dot_notation'),
		
		/**
		 * This is the path to the default base configuration file.
		 * @type {string}
		 */
		DEFAULT_CONFIG_PATH	= '/etc/kapinko',
		/**
		 * This is the base configuration file that will be loaded.
		 * @type {string}
		 */
		BASE_CONFIG	= '/config.xml';
	;
	
	/**
	 * Get the default configuration path.
	 * @return {string}
	 */
	function get_default_path() {
		/**
		 * Set the KAPINKO_CONFIG variable to your environment configuration
		 * file to override the default of /etc/kapinko
		 * @type {string}
		 */
		var config_path	= process.env.KAPINKO_CONFIG;

		if (!config_path) {
			config_path	= DEFAULT_CONFIG_PATH;
		}
		return config_path;
	}

	return (function () {
		function Config() {
			/**
			 * This is the current configuration object.
			 * @type {Object.<string,*>}
			 */
			this.config	= {};

			require('events').EventEmitter.call(this);
		}
		require('util').inherits(Config, require('events').EventEmitter);

		_.extend(Config.prototype, {
			/**
			 * Load all configurations.
			 * @param {string} config_path
			 * @param {function():boolean} callback
			 * 
			 */
			'load': function (config_path, callback) {
				if (!config_path) {
					config_path	= get_default_path();
				}

				var	self		= this,
					config_data	= [],
					parser		= new xml2js.Parser();

				parser.addListener('end', function (result) {
					if (!result.config) {
						throw "Invalid base configuration file.";
					}
					if (result.config.length < 1) {
						throw "You must specify at least one configuration file.";
					}
					
					var complete	= _.after(result.config.length, function () {
						var complete_config	= {};
						config_data.unshift(complete_config);
						_.extend.apply(_.extend, config_data);
						self.config	= complete_config;

						self.emit('complete', self, complete_config);
						callback(self, complete_config);
					});

					_.each(result.config, function (setting, index) {
						fs.readFile(config_path + '/' + setting.file, function (error, data) {
							if (error) {
								throw error;
							}

							var sub_parser	= new xml2js.Parser();
							sub_parser.addListener('end', function (result) {
								config_data[index]	= result;
								complete();
							});
							sub_parser.parseString(data);
						});
					});
				});

				fs.readFile(config_path + BASE_CONFIG, function (error, data) {
					if (error) {
						throw "Unable to read base configuration file. (" + config_path + BASE_CONFIG + ")";
					}
					parser.parseString(data);
				});
			},

			/**
			 * Get the configuration value that corresponds to the given
			 * dot "." separated key.
			 * @param {string} key
			 * @param {*} def - a default value
			 * @return {*}
			 */
			'getValue': function (key, def) {
				var value	= DotNotation.accessor(key, this.config);

				if (value === null && def) {
					value	= def;
				}
				return value;
			}
		});
		return Config;
	}());
}());
