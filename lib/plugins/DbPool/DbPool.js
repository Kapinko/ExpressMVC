module.exports = function(MVC, server, driver_name, config_name) {
	var db_config = MVC.config.getValue(config_name || 'database'),
		pool = MVC.Library('db')(db_config, driver_name);

	return pool;
};