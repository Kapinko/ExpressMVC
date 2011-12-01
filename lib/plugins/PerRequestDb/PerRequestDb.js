module.exports	= function (MVC, server, driver_name, config_name) {
    var db_config   = MVC.config.getValue(config_name || 'database'),
        db          = require('./driver/' + (driver_name || db_config.driver || 'MySQL')),
        driver, pool;
    
    if (typeof db_config.password !== 'string') {
        db_config.password  = '';
    }
    
    driver  = db(db_config);
    pool    = require('generic-pool').Pool({
        'name': driver_name,
        'max': 255,
        'create': driver.create,
        'destroy': driver.destroy
    });
    
    return function (req, res, next) {
        if (!req.db) {
            pool.acquire(function (error, db) {
                if (error) {
                    return res.end('CONNECTION ERROR: ' + error);
                } else {
                    req.db  = db;
                    
                    //Make sure we release the connection on response end.
                    var end = res.end;
                    
                    res.end = function () {
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