/**
 * An OAuth compliant querystring module.
 * @author Nathan Sculli
 */
module.exports  = (function () {
    var querystring = require('querystring');
    
    /**
     * A function to more strictly encode an already URI encoded string.
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/encodeURIComponent
     * @param {string} loosely_encoded
     * @return {string}
     */
    function encode_uri_strict(loosely_encoded) {
        return encodeURIComponent(loosely_encoded)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }
    //monkey patch querystring so that it performs strict encoding.
    querystring.escape  = encode_uri_strict;
    
    return querystring;
}());