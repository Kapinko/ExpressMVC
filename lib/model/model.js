module.exports	= (function () {
	var	_		= require('underscore'),
		Class	= require(__dirname + '/../class'),
		
		Model	= Class.extend({
		/**
		 * Initialize this model.
		 * @param {string} id
		 */
		'init': function (id) {
			/**
			 * This is the identifier of the mdoel from the web server.
			 * @type {string}
			 */
			this.id	= id || -1;
			/**
			 * This is a unique identifier for this model object instance.
			 * @type {string}
			 */
			this.local_id	= _.uniqueId();
			/**
			 * This is a list of the model's attributes.
			 * @type {Object.<string,*>}
			 */
			this._attributes	= {};
			/**
			 * These are the attributes as they were immediately folowing the last
			 * change event.
			 * @type {Object.<string,*>}
			 */
			this._previousAttributes	= this._attributes;
			/**
			 * Has this model been modified since the last change event?
			 * @type {boolean}
			 */
			this._changed				= false;
		},
		/**
		 * Set a list of properties all at once
		 * @param {Object.<string,*>} props
		 * @return {Model}
		 */
		'setProps': function (props) {
			_.each(props, _.bind(this.setProp, this));
		},
		/**
		 * Set a property on this object.
		 * @param {string} name
		 * @param {*} value
		 * @return {Model}
		 */
		'setProp': function (name, value) {
			var current	= this._attributes[name];
			
			if (!_.isEqual(current, value)) {
				this._attributes[name]	= value;
				this._changed			= true;
			}
			return this;
		},
		/**
		 * Get a property value.
		 * @param {string} name
		 * @return {*}
		 */
		'getProp': function (name) {
			var value	= this._attributes[name];
			return value;
		},
		/**
		 * Get the server side identifier of this model.
		 * @return {string}
		 */
		'getId': function () {
			return this.id;
		},
		/**
		 * Get the local identifier of this model.
		 * @return {string}
		 */
		'getLocalId': function () {
			return this.local_id;
		},
		/**
		 * Is this a new (not saved to permanent storage) model?
		 * @return {boolean}
		 */
		'isNew': function () {
			return (this.id < 0) ? true : false;
		},
		/**
		 * Determine if this model has changed since the last time it was saved.
		 * @return {boolean}
		 */
		'hasChanged': function () {
			return this._changed;
		},
		/**
		 * Return a copy of the model's attributes object.
		 * @return {Object.<string,*>}
		 */
		'toJSON': function () {
			return _.clone(this._attributes);
		},
		/**
		 * Save this model's current state into permanent storage.
		 * @param {db-mysql} db
		 * @param {function(Object.<string,*>, Model} callback
		 */
		'save': function (db, callback) {
			var method	= this.isNew() ? '_create' : '_update',
				handler	= _.bind(function (err, account) {
					if (!err) {
						this._changed = false;
					}
					callback(err, account);
				}, this);
			
			this[method].call(this, db, handler);
		},
		/**
		 * This function will be called when this model object already has
		 * a current representation in permanent storage.  IE this model has an
		 * identifier.  Therefore, we just want to update this object.
		 * 
		 * @param {db-mysql} db
		 * @param {function(Object, Model)} callback
		 */
		'_update': function (db, callback) {
			throw '_update method not implemented';
		},
		/**
		 * This function will be called when this model object does not have a
		 * representation in permanent storage, ie this model object does not
		 * have an identifier.  In this case we want to create a new object on
		 * the server.
		 * 
		 * @param {db-mysql} db
		 * @param [function(Object, Model)} callback
		 */
		'__create': function (db, callback) {
			throw '_create method not implemented';
		}
	});
	
	/**
	 * Function to allow the user to load model plugins.
	 * @param {string} name
	 */
	Model.Plugin	= function (name) {
		return require(__dirname + '/plugins/' + name);
	};
	
	/**
	 * Function to allow the user to load model helpers.
	 * @param {string} name
	 */
	Model.Helper	= function (name) {
		return require(__dirname + '/helpers/' + name);
	};
	
	return Model;
}());