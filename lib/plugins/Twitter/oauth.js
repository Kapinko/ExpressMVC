/**
 * The oauth implementation necessary for Twitter API access.
 */
 
module.exports = (function () {
    var SIGNATURE_METHOD_HMAC_SHA1  = 'HMAC-SHA1',
        SIGNATURE_ENCODING_DEFAULT  = 'base64',
        OAUTH_VERSION_1_0           = '1.0',
        HTTP_PROTOCOL_DEFAULT       = 'https:',
    
        crypto      = require('crypto'),
        url         = require('url'),
        format      = require('util').format,
        querystring = require('querystring'),
        request     = require('request'),
        signing_methods     = {
            'HMAC-SHA1': function (key, base_string, encoding) {
                var hmac    = crypto.createHmac('sha1', key);
                hmac.update(base_string);
                
                return hmac.digest(encoding);
            }
        };
    
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
        
    /**
     * Make sure we have a valid oAuth token.
     * @param {boolean} throw_exception
     * @return {boolean}
     */
    function check_token(throw_exception) {
        var has_token = (this.token && this.token_secret);
        
        if (!has_token && throw_exception) {
            throw "You must set the access token before making a request.";
        }
        
        return has_token;
    }
    /**
     * Get an object with all the oAuth header parameters.
     * @return {Object.<string,*>}
     */
    function get_oauth_params() {
        check_token.call(this, true);
        
        return {
            'oauth_consumer_key': this.consumer_key,
            'oauth_nonce': this.nonce(),
            'oauth_signature_method': this.signature_method,
            'oauth_timestamp': this.timestamp(),
            'oauth_token': this.token,
            'oauth_version': this.oauth_version
        };
    }
    /**
     * Parse the given url into a base_url and query object.
     * @param {string} target_url
     * @return {Object.<string,string>}
     */
    function parse_url(target_url) {
        var p       = url.parse(target_url, true, true);
        
        p.protocol  = p.protocol || HTTP_PROTOCOL_DEFAULT;
        p.base_url  = format('%s//%s%s', p.protocol, p.host, p.pathname);
        
        return p;
    }
    
    /**
     * Create an HTTP response handler to handle responses from the 
     * OAuth protected API.
     * @param {function()} callback
     * @return {function()}
     */
    function response_handler(callback) {
        return function (err, res, body) {
            var error;
            
            if (typeof body === 'string') {
                body    = JSON.parse(body);
            }
            
            if (err) {
                return callback(err);
            }
            
            if (body.error) {
                error   = {
                    'code': res.statusCode,
                    'error': body.error
                };
                
            } else if (res.statusCode > 299) {
                error   = {
                    'code': res.statusCode,
                    'error': res.headers.status
                };
            }
            
            if (error) {
                return callback(error);
            } else {
                return callback(null, body);
            }
        };
    }
    
    /**
     * Call the oAuth api with the given method, url and parameters.
     * @param {string} http_method
     * @param {string} target_url
     * @param {Object.<string,*>} params
     * @param {function()} callback
     * @return {boolean}
     */
    function oauth_api(http_method, target_url, params, callback) {
        var oauth      = this.getHeader.apply(this, arguments),
            parsed_url  = parse_url.call(this, target_url),
            options     = {
                uri: parsed_url,
                method: http_method.toUpperCase(),
                headers: {
                    'Authorization': oauth
                },
                json: params
            };
            request(options, response_handler(callback));
            
        return true;
    }
    
    /**
     * Create a new oAuth object with the given consumer key and secret.
     * @param {string} consumer_key
     * @param {string} consumer_secret
     */
    function oAuth(consumer_key, consumer_secret) {
        this.consumer_key       = consumer_key;
        this.consumer_secret    = consumer_secret;
        
        this.signature_method   = SIGNATURE_METHOD_HMAC_SHA1;
        this.oauth_version      = OAUTH_VERSION_1_0;
    }
    oAuth.prototype = {
        /**
         * Set the access token and that token's secret.
         * @param {string} token
         * @param {string} secret
         * @return {oAuth}
         */
        'setToken': function (token, secret) {
            this.token          = token;
            this.token_secret   = secret;
            return this;
        },
        /**
         * Set the versio of oAuth to use.
         * @param {string} version
         * @return {oAuth}
         */
        'setVersion': function (version) {
            this.version    = version;
            return this;
        },
        /**
         * Set the signature method to use.
         * @param {string} method
         * @return {oAuth}
         */
        'setSignatureMethod': function (method) {
            this.signature_method   = method;
            return this;
        },
        /**
         * Post to the given url with the given parameters
         * @param {string} target_url
         * @param {Object.<string,*>} params
         * @param {function()} callback
         * @return {boolean}
         */
        'post': function (target_url, params, callback) {
            check_token.call(this, true);
            oauth_api.call(this, 'POST', target_url, params, callback);
            return true;
        },
        /**
         * Make an HTTP GET request to the given url with the given parameters.
         * @param {string} target_url
         * @param {Object.<string,*>} params
         * @param {function()} callback
         * @return {boolean}
         */
        'get': function (target_url, params, callback) {
            check_token.call(this, true);
            oauth_api.call(this, 'GET', target_url, params, callback);
            return true;
        },
        /**
         * Sign the given string with the current consumer and token secrets.
         * @param {string} base_string
         * @param {string} encoding
         * @return {string}
         */
        'sign': function (base_string, encoding) {
            var key = this.consumer_secret;
                
            var method  = signing_methods[this.signature_method];
            
            if (typeof method !== 'function') {
                throw "Signature method " + this.signature_method +
                    " is not currently supported.";
            }
            
            if (this.token_secret) {
                key += '&' + this.token_secret;
            }
            
            return method(key, base_string, encoding || SIGNATURE_ENCODING_DEFAULT);
        },
        /**
         * Get the authorization header for the given target URL and parameters.
         * @param {string} http_method
         * @param {string} target_url
         * @param {Object.<string,*>} params
         * @return {string}
         */
        'getHeader': function (http_method, target_url, params) {
            var oauth   = get_oauth_params.call(this),
                base_string = this.getSignatureBaseString(
                    http_method, target_url, params, oauth
                ),
                signature   = this.sign(base_string);
                signature   = querystring.escape(signature);
                
            return 'OAuth oauth_consumer_key="' + oauth.oauth_consumer_key +
                '", oauth_nonce="' + oauth.oauth_nonce +
                '", oauth_signature="' + signature +
                '", oauth_signature_method="' + oauth.oauth_signature_method +
                '", oauth_timestamp="' + oauth.oauth_timestamp +
                '", oauth_token="' + oauth.oauth_token +
                '", oauth_version="' + oauth.oauth_version + '"';
        },
        /**
         * Take the given query and parameters and return an appropriate oAuth
         * parameter string.
         * @param {Object.<string,*>} query
         * @param {Object.<string,*>} params
         * @return {string}
         */
        'getParameterString': function (query, params) {
            this.initOAuthParams();
            
            var combined    = query, 
                key, string;
            
            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    combined[key]   = params[key];
                }
            }
            
            for (key in this.oauth_params) {
                if (this.oauth_params.hasOwnProperty(key)) {
                    combined[key]   = this.oauth_params[key];
                }
            }
            
            string  = Object.keys(combined).sort().map(function (i) {
                var p   = {};
                p[i]    = combined[i];
                
                return querystring.stringify(p);
            }).join('&');
            
            return string;
        },
        /**
         * Get the signature base string necessary to calculate the oauth 
         * signature parameter.
         * @param {string} http_method
         * @param {string} target_url
         * @param {Object.<string,*>} params
         * @return {string}
         */
        'getSignatureBaseString': function (http_method, target_url, params) {
            this.initOAuthParams();
            
            var purl    = parse_url.call(this, target_url),
                oauth   = this.oauth_params,
                pstring = this.getParameterString(purl.query, params, oauth),
                string;
            
            string  = http_method.toUpperCase() + '&' +
                    querystring.escape(purl.base_url) + '&' +
                    querystring.escape(pstring);
                    
            return string;
        },
        /**
         * Get the oAuth timestamp.
         * @return {number}
         */
        'timestamp': function () {
            var time    = new Date().getTime();
            return time / 1000; // time in seconds.
        },
        /**
         * Get a unique oAuth request identifier.
         * @return {string}
         */
        'nonce': function () {
            var sha1    = crypto.createHash('sha1');
            sha1.update(new Date().getTime().toString());
            
            return sha1.digest('hex');
        },
        /**
         * Initialize or re-initialize the oauth parameter object
         * for this oAuth object.
         * @return {oAuth}
         */
        'initOAuthParams': function (force) {
            check_token.call(this, true);
            
            if (force || !this.oauth_params) {
                this.oauth_params   = get_oauth_params.call(this);
            }
            return this;
        }
    };
    
    /**
     * Allow the user to add in new signature methods.
     * @param {string} name
     * @param {function()} method
     * @return {boolean}
     */
    oAuth.addSignatureMethod    = function (name, method) {
        if (name === SIGNATURE_METHOD_HMAC_SHA1) {
            throw "You may not override the default signing method of HMAC-SHA1";
        }
        signing_methods[name]   = method;
        return true;
    };
    
    return oAuth;
}());