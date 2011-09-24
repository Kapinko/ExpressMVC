

module.exports	= function (app) {
	var mysql		= require('db-mysql'),
		db_config	= app.set('database'),
		pool		= require('generic-pool').Pool({
			'name': 'mysql',
			'max': 10,
			
			'create': function (callback) {
				if (typeof db_config.password !== 'string') {
					db_config.password	= '';
				}
				
				new mysql.Database(db_config).connect(function (error, server) {
					callback(error, this);
				});
			},
			
			'destroy': function (db) {
				db.disconnect();
			}
		});
		
	return function (req, res, next) {
		if (!(req.db instanceof mysql.Database)) {
			pool.acquire(function (error, db) {
				if (error) {
					return res.end('CONNECTION ERROR: ' + error);
					
				} else {
					req.db	= db;
					return next();
				}
			});
			
		} else {
			next();
		}
	};
};