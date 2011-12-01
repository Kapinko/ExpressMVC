if (!process.env.DYLD_LIBRARY_PATH && process.platform === 'darwin') {
    console.log("You must set the DYLD_LIBRARY_PATH to your mysql library path.");
    console.log("usually: DYLD_LIBRARY_PATH='/usr/local/mysql/lib/'");
    throw "You must set the DYLD_LIBRARY_PATH to your mysql library path.";
}

module.exports  = function (db_config) {
    var mysql   = require('db-mysql');
        
    return {
        'create': function (callback) {
            new mysql.Database(db_config).connect(function (err) {
                if (err) {
                    
                }
                callback(this);
            });
        },
        'destroy': function (db) {
            db.disconnect();
        }
    };
};