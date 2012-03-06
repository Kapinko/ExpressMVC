module.exports = function(MVC, server, driver_name, config_name) {
	var pool	= MVC.Plugin('DbPool', driver_name, config_name);

	return function(req, res, next) {
		if (!req.db) {
			pool.acquire(function(error, db) {
				if (error) {
					return res.end('CONNECTION ERROR: ' + error);
				}
				else {
					req.db = db;

					//Make sure we release the connection on response end.
					var end = res.end;

					res.end = function() {
						pool.release(db);
						end.apply(this, arguments);
					};
					return next();
				}
			});
		}
		else {
			next();
		}
	};
};