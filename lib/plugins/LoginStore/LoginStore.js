/**
 * This is a plugin that works around a flaw in Chrome that causes it to fail
 * when attempting to reload an expressjs (connect) sesstion identifier.
 */

module.exports  = (function () {
    var crypto  = require('crypto');
    
    function LoginStore() {
        this.store  = {};
    }
    LoginStore.prototype    = {
        'hash': function (user) {
            var hash    = crypto.createHash('sha1');
            hash.update(user);
            hash.update(new Date().getTime().toString());
            
            return hash.digest('hex');
        },
        
        'add': function (user) {
            var hash    = this.hash(user.toString());
            this.store[hash]    = user;
            
            return hash;
        },
        
        'get': function (hash) {
            return this.store[hash];
        },
        
        'del': function (hash) {
            delete this.store[hash];
        }
    };
    
    return function () {
        return new LoginStore();
    };
}());