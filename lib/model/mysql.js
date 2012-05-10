/**
 * An Abstract MySQL model
 */

module.exports	= (function () {
	var created_date_cols	= [
		'date_created', 'created', 'created_at'
	],
	
	MySQL	= function (db, table_name, id_column, custom_create_date_cols) {
		id_column	= (id_column || 'id');
		
		if (Array.isArray(custom_create_date_cols)) {
			created_date_cols = custom_create_date_cols;
		} else if (toString.call(custom_create_date_cols) === '[object String]') {
			created_date_cols.push(custom_create_date_cols);
		}
		
		return {
			/**
			 * Given a free form data object return a properly formatted model
			 * data object.
			 * @param {Object.<string,*>} data
			 * @return {Object.<string,*>}
			 */
			'parse': function (data) {
				throw 'parse() method must be overridden';
			},
			/**
			 * Return the columns necessary for an object insert.
			 * @return {Array.<string>}
			 */
			'getColumns': function () {
				throw 'getColumns() method must be overridden';
			},
			/**
			 * Given a properly formatted model data object return the array
			 * of data necessary to perform an object insert.
			 * @param {Object.<string,*>} data
			 * @return {Array.<*>}
			 */
			'getInsertData': function (data) {
				var columns	= this.getColumns(),
					insert	= [], index, column, value;
					
				for (index = 0; index < columns.length; index += 1) {
					column	= columns[index],
					value	= data[column];
					
					created_date_cols.forEach(function (colname) {
						if (column === colname && !value) {
							value	= {value: 'NOW()', escape: false};
						}
					});
					insert.push(value);
				}
				return insert;
			},
			/**
			 * Given a properly formatted model data object return a properly
			 * formatted update object.
			 * @param {Object.<string,*>} data
			 * @return {Object.<string,*>}
			 */
			'getUpdateData': function (data) {
				return data;
			},
			/**
			 * Pass a single object from the query response to the given
			 * callback function.
			 * @param {function()} callback
			 */
			'singleObjectResponse': function (callback) {
				var self	= this;
				
				return function (error, rows) {
					var object	= null;
					
					if (!error) {
						if (!rows[0]) {
							error	= {
								'code': 404,
								'message': 'Not Found'
							};
						} else {
							error		= null;
							object		= self.parse(rows[0]);
							object.id	= rows[0][id_column];
						}
					}
					return callback(error, object);
				}
			},
			/**
			 * Pass an array of objects from the query response to the given
			 * callback function.
			 * @param {function()} callback
			 */
			'multiplObjectResponse': function (callback) {
				var self	= this;
				
				return function (error, rows) {
					var objects	= [];
					
					if (!error) {
						rows.forEach(function (row) {
							var object	= self.parse(row);
							object.id	= row[id_column];
							objects.push(object);
						});
					}
					return callback(error, objects);
				}
			},
			/**
			 * Insert a new object into the database.
			 * @param {Object.<string,*>} data
			 * @param {function()} callback
			 */
			'create': function (data, callback) {
				var self	= this;
					data	= this.parse(data);
				
				db.query().insert(table_name,
					this.getColumns(),
					this.getInsertData(data)
				).execute(function (error, result) {
					if (error) {
						callback(error);
					} else {
						self.getOneById(result.id, callback);
					}
				});
			},
			/**
			 * Update an existing database object.
			 * @param {string} id
			 * @param {Object.<string,*>} data
			 * @param {function()} callback
			 */
			'update': function (id, data, callback) {
				data	= this.parse(data);
				
				db.query()
				.update(table_name)
				.set(this.getUpdateData(data))
				.where(id_column + ' = ?', [ id ])
				.execute(callback);
			},
			/**
			 * Remove an existing database object.
			 * @param {string} id
			 * @param {function()} callback
			 */
			'remove': function (id, callback) {
				db.query()
				.delete()
				.from(table_name)
				.where(id_column + ' = ?', [ id ])
				.execute(callback);
			},
			/**
			 * Retrieve a database object by its identifier
			 * @param {string} id
			 * @param {function()} callback
			 */
			'getOneById': function (id, callback) {
				db.query()
				.select('*')
				.from(table_name)
				.where(id_column + ' = ?', [ id ])
				.execute(this.singleObjectResponse(callback));
			}
		};
	};
	return MySQL;
}());