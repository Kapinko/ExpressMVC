module.exports	= function (db_config, driver_name) {
    var db          = require('./driver/' + (driver_name || db_config.driver || 'MySQL')),
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


    return pool;
};