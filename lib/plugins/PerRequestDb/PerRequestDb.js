if (!process.env.DYLD_LIBRARY_PATH && process.platform === 'darwin') {
	throw Exception("You must set the DYLD_LIBRARY_PATH to your mysql library path.");
}


module.exports	= function (MVC, server, config_name) {
	var mysql		= require('db-mysql'),
		db_config	= MVC.config.getValue(config_name || 'database'),
		exec		= require('child_process').exec,
		pool		= require('generic-pool').Pool({
			'name': 'mysql',
			'max': 255,
			
			'create': function (callback) {
				if (typeof db_config.password !== 'string') {
					db_config.password	= '';
				}
				new mysql.Database(db_config).connect(function (err) {
					if (err) {
						//@todo do something with this.
					}
					callback(this);
				});
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
					
					//Make sure we release the connection on response end.
					var end	= res.end;
					
					res.end	= function () {
						pool.release(db);
						end.apply(this, arguments);
					};
					return next();
				}
			});
			
		} else {
			next();
		}
	};
};