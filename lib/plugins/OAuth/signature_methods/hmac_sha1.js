/**
 * This is the HMAC-SHA1 signature method for signing OAuth requests.
 * @author Nathan Sculli
 */

module.exports  = (function () {
    var crypto  = require('crypto');
    /**
     * @param {string} base_string
     * @param {string} client_key
     * @param {string} token_key
     * @return {string}
     */
    return function (base_string, client_key, token_key) {
		var key		= client_key + '&' + (token_key || ''),
			hmac	= crypto.createHmac('sha1', key);
		hmac.update(base_string);

		//RFC 5849 Section 3.4.2 requires the 'base64' encoding.
		return hmac.digest('base64');
    };
}());