module.exports  = function (db_config) {
    var mongodb     = require('mongodb'),
        host        = (db_config.host || 'localhost'),
        port        = (db_config.port || mongodb.Connection.DEFAULT_PORT),
        server      = new mongodb.Server(host, port, {});
        
    return {
        'create': function (callback) {
            var mongo  = new mongodb.Db(db_config.database, server, {});
            mongo.open(function (err, db) {
                if (err) {
                    throw "CONNECTION ERROR: " + err;
                }
                
                db.bson   = mongo.bson_serializer;
                callback(db);
            });
        },
        'destroy': function (db) {
            db.close();
        }
    };
};