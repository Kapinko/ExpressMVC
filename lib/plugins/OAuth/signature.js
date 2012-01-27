/**
 * A module for signing requests using oauth.
 * @author Nathan Sculli
 */
module.exports  = (function () {
    var CONTENT_TYPE_FORM_ENCODED   = 'application/x-www-form-urlencoded',
        url     = require('url'),
        qs      = require('./lib/querystring'),
        format  = require('util').format,

        signature_methods	= {
			'HMAC-SHA1': require(__dirname + '/signature_methods/hmac_sha1')
        };

    /**
     * A simple function to do a shallow merge of properties from one given
     * object into another.  This will shallow copy all of the properties from
     * "obj2" into "obj1"
     * @param {Object.<string,*>} obj1
     * @param {Object.<string,*>} obj2
     * @return {Object.<string,*>}
     */
    function oauth_merge (obj1, obj2) {
		var key, value;
        for (key in obj2) {
            if (obj2.hasOwnProperty(key)) {
				if (obj1.hasOwnProperty(key)) {
					value	= obj1[key];
					if (!Array.isArray(value)) {
						obj1[key]	= [value];
					}
					obj1[key].push(obj2[key]);

				} else {
					obj1[key]   = obj2[key];
				}
            }
        }
        return obj1;
    }

    /**
     * A function to encode the given objects keys and values as specified by
     * RFC 5849 Section 3.4.1.3.1
     * @param {Object.<string,*>} params
     * @return {Object.<string,*>}
     */
    function oauth_parameter_encode(params) {
		var encoded	= {};

		Object.keys(params).map(function (key) {
			var value	= params[key];

			if (Array.isArray(value)) {
				value	= value.map(function (item) {
					return qs.escape(item);
				});
			} else {
				value	= qs.escape(value);
			}

			key	= qs.escape(key);
			encoded[key]	= value;
		});
		return encoded;
    }

    return {
        /**
         * Sign the given request with the given secret using the information
         * from the given oauth object.
         * @param {http.ServerRequest} req
         * @param {OAuth} oauth
         * @param {string} consumer_secret
         * @param {string} token_secret
         * @return {string}
         */
        'sign': function (req, oauth, consumer_secret, token_secret) {
			var base_string	= this.base_string(req, oauth),
				sign		= signature_methods[oauth.signature_method],
				signature;

			if (typeof sign !== 'function') {
			    throw "Signature method " + oauth.signature_method +
			        " is not currently supported.";
			}

			signature		= sign(base_string, consumer_secret, token_secret);
			return signature;
        },
        /**
         * Create the signature base string.
         * @param {http.ServerRequest} req
         * @param {OAuth} oauth
         * @return {string}
         */
        'base_string': function (req, oauth) {
			var method		= req.method.toString().toUpperCase(),
			    base_url    = this.parse_url(req.url).base_url,
			    params		= this.parameter_string(req, oauth);
			return [
				method, qs.escape(base_url), qs.escape(params)
			].join('&');
        },
        /**
         * Get the properly encoded parameter string.
         * @param {http.ServerRequest} req
         * @param {OAuth} oauth
         * @return {string}
         */
        'parameter_string': function (req, oauth) {
            var combined    = oauth.params(),
				params      = url.parse(req.url, true).query,
				body, string, encoded;

            combined        = oauth_merge(combined, params);

            if (req.method !== 'GET') {
                body        = this.request_body(req);
                combined    = oauth_merge(combined, body);
            }

            encoded			= oauth_parameter_encode(combined);

            string  = Object.keys(encoded).sort().map(function (i) {
				var c	= encoded[i];

				if (Array.isArray(c)) {
					return c.sort().map(function (j) {
						return i + '=' + j;
					}).join('&');
				} else {
					return i + '=' + c;
				}
            }).join('&');

            return string;
        },
        /**
         * Parse any parameters out of the request body.  This function expects
         * the request body data to be put into the req.body attribute.
         * @param {http.ServerRequest} req
         * @return {Object.<string,string>}
         */
        'request_body': function (req) {
            var encoded = {};

            if (req.hasOwnProperty("body") && req.hasOwnProperty("headers") &&
				req.headers['content-type'] === CONTENT_TYPE_FORM_ENCODED) {
                encoded = qs.parse(req.body);
            }
            return encoded;
        },
        /**
         * Parse the given url into a base_url and query object.
         * @param {string} target_url
         * @return {Object.<string,string>}
         */
        'parse_url': function (target_url) {
            var p       = url.parse(target_url, true, true);
            p.protocol  = p.protocol || 'http';
            p.base_url  = format('%s//%s%s', p.protocol, p.host, p.pathname);

            return p;
        },
        /**
         * Add a signature method.
         * @param {string} name
         * @param {function()} method
         */
        'add_signature_method': function (name, method) {
			signature_methods[name]	= method;
			return this;
        }
    };
}());