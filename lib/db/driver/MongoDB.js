module.exports  = function (db_config) {
    var mongodb     = require('mongodb'),
        host        = (db_config.host || 'localhost'),
        port        = (db_config.port || mongodb.Connection.DEFAULT_PORT);

    return {
        'create': function (callback) {
            var server	= new mongodb.Server(host, port, {}),
				mongo	= new mongodb.Db(db_config.database, server, {});

            mongo.open(function (err, db) {
                if (err) {
                    throw "CONNECTION ERROR: " + err;
                }

                callback(db);
            });
        },
        'destroy': function (db) {
            db.close();
        }
    };
};