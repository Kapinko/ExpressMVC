
module.exports  = function (db_config) {
    var pg      = require('pg').native,
        format  = require('util').format,
        template    = "tcp://%s:%s@%s:%s/%s",
        con_string  = format(
            template,
            db_config.username,
            db_config.password,
            db_config.host || 'localhost',
            db_config.port || 5432,
            db_config.database
        );
        
    return {
        'create': function (callback) {
            pg.connect(con_string, function (err, client) {
                if (err) {
                    throw "Unable to connect to the database: " + err;
                }
                callback(client);
            });
        },
        
        'destroy': function (db) {
            db.end();
        }
    };
};