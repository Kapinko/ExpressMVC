

module.exports	= function (MVC, server, config_name) {
	var mysql		= require('mysql'),
		db_config	= MVC.config.getValue(config_name || 'database'),
		pool		= require('generic-pool').Pool({
			'name': 'mysql',
			'max': 10,
			
			'create': function (callback) {
				if (typeof db_config.password !== 'string') {
					db_config.password	= '';
				}
				
				var client	= mysql.createClient(db_config);
				callback(client);
			},
			
			'destroy': function (db) {
				db.disconnect();
			}
		});
		
	return function (req, res, next) {
		if (!req.db) {
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