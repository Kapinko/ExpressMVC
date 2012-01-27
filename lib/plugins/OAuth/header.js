/**
 * the module for handling the OAuth request header.
 * @author Nathan Sculli
 */
module.exports  = (function () {
    var SIGNATURE_METHOD_HMAC_SHA1  = 'HMAC-SHA1',
        SIGNATURE_ENCODING_DEFAULT  = 'base64',
        OAUTH_VERSION_1_0           = '1.0',
        
        OAuthSignature  = require('./signature'),
        querystring     = require('./querystring');
    
    /**
     * Create a new OAuth header object with the given consumer key and secret.
     * @param {string} consumer_key
     * @param {string} consumer_secret
     */
    function OAuthHeader(consumer_key, consumer_secret) {
        this.consumer_key       = consumer_key;
        this.consumer_secret    = consumer_secret;
        
        this.signature_method   = SIGNATURE_METHOD_HMAC_SHA1;
        this.signature_encoding = SIGNATURE_ENCODING_DEFAULT;
        this.oauth_version      = OAUTH_VERSION_1_0;
        this.signer             = OAuthSignature;
    }
    OAuthHeader.prototype   = {
        /**
         * Set the access token and that token's secret.
         * @param {string} token
         * @param {string} secret
         * @return {OAuthHeader}
         */
        'setToken': function (token, secret) {
            this.token          = token;
            this.token_secret   = secret;
            return this;
        },
        /**
         * Set the version of OAuth to use.
         * @param {string} version
         * @return {OAuthHeader}
         */
        'setVersion': function (version) {
            this.oauth_version  = version;
            return this;
        },
        /**
         * Set the signature method to use.
         * @param {string} method
         * @return {OAuthHeader}
         */
        'setSignatureMethod': function (method) {
            this.signature_method   = method;
            return this;
        },
        /**
         * Get the authorization header for the given target URL and parameters.
         * @param {string} http_method
         * @param {string} target_url
         * @param {Object.<string,*>} params
         * @return {string}
         */
        'generate': function (http_method, target_url, params) {
            var oauth       = this.signer.getOAuthParams(
                    this.consumer_key, this.token, 
                    this.signature_method, this.oauth_version
                ),
                base_string = this.signer.getSignatureBaseString(
                    oauth, http_method, target_url, params
                ),
                signature   = this.signer.sign(
                    base_string, this.consumer_secret, this.token_secret,
                    this.signature_method, this.signature_encoding
                ),
                header  = 'OAuth oauth_consumer_key="' + this.consumer_key +
                        '", oauth_nonce="' + oauth.oauth_nonce +
                        '", oauth_signature="' + querystring.escape(signature) +
                        '", oauth_signature_method="' + this.signature_method +
                        '", oauth_timestamp="' + oauth.oauth_timestamp + '"';
                        
            if (this.token) {
                header += ', oauth_token="' + this.token + '"';
            }
            
            header += ', oauth_version="' + this.oauth_version + '"';
                
            return header;
        },
        /**
         * Allow the user to specify a signature object.
         * @param {*} signer
         * @return {OAuthHeader}
         */
        'setSignatureHandler': function (signer) {
            this.signer = signer;
            return this;
        }
    };
    /**
     * Parse out the oauth parameters from the given request header.
     * @param {string} header
     * @return {Object.<string,*>}
     */
    OAuthHeader.parse   = function (header) {
        var params, oauth;
        if (header && header.match(/^OAuth\b/i)) {
            params   = header.match(/[^=\s]+=[^"]*"(?:,\s*)?/g);
            
            params.forEach(function (el) {
                var match   = el.match(/([^=\s]+)="([^"]*)"/),
                    key     = querystring.unescape(match[1]),
                    value   = querystring.unescape(match[2]);
                    
                oauth[key]  = value;
            });
        } else {
            return false;
        }
        return oauth;
    };
    
    return OAuthHeader;
}());