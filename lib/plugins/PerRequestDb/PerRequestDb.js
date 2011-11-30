module.exports	= function (MVC, server, driver, config_name) {
    var db_config   = MVC.config.getValue(config_name || 'database'),
        db          = require('./driver/' + (driver || 'MySQL'));
    
    if (typeof db_config.password !== 'string') {
        db_config.password  = '';
    }
    
    return db(db_config);
};