module.exports  = function (db_config) {
    var mongodb     = require('mongodb'),
        host        = (db_config.host || 'localhost'),
        port        = (db_config.port || mongodb.Connection.DEFAULT_PORT),
        username    = (db_config.username?db_config.username:false),
        password    = (db_config.password?db_config.password:false);

    return {
        'create': function (callback) {
            var server	= new mongodb.Server(host, port, {}),
				mongo	= new mongodb.Db(db_config.database, server, {});

            mongo.open(function (err, db) {
                if (err) {
                    throw "CONNECTION ERROR: " + err;
                }
                
                console.log('db opened'); 
        if(username && password)
            {
                 db.authenticate(username, password, function(err, p_client) { 
                    console.log('authenticated db'); 
                    callback(db);

                });
            }
            else
                {
                    callback(db);
                }
   
               
            });
        },
        'destroy': function (db) {
            db.close();
        }
    };
};