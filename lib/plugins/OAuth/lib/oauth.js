/**
 * An object that represents an OAuth request object.  This object contains the
 * parameters as defined in RFC 5849
 * @author Nathan Sculli
 */
module.exports  = (function () {
    var OAUTH_VERSION	= '1.0',
		crypto  = require('crypto'),
        props   = [
            'timestamp','nonce','signature_method','signature','token',
            'version','consumer_key','realm','verifier'
        ];

    function oauth(data) {
        var self    = this,
        timestamp	= Math.round(new Date().getTime() / 1000),
        nonce;

        this.__defineGetter__('nonce', function () {
            if (!nonce) {
				var hash    = crypto.createHash('sha1');
                hash.update(new Date().getTime().toString());
                hash.update(Math.random().toString());

                nonce	= hash.digest('base64');
            }
            return nonce;
        });
        this.__defineSetter__('nonce', function (value) {
			nonce = value;
			return self;
        });

        this.__defineGetter__('timestamp', function () {
            if (!timestamp) {
                timestamp  = Math.round(new Date().getTime() / 1000);
            }
            return timestamp;
        });

        this.__defineSetter__('timestamp', function (value) {
			timestamp	= value;
			return self;
        });
        
        if (data) {
            props.forEach(function (prop) {
                this.prop   = (data['oauth_'+prop] || data[prop]);
            });
        }
    }
    oauth.prototype = {
        /**
         * The timestamp value as defined in Section 3.3 of RFC 5849.  The
         * parameter MAY be omitted when using the "PLAINTEXT" signature method.
         */
        'timestamp': null,
        /**
         * The nonce value as defined in Section 3.3 of RFC 5849.  The parameter
         * MAY be omitted when using the "PLAINTEXT" signature method.
         */
        'nonce': null,
        /**
         * The name of the signature method used by the client to sign the
         * request, as defined in Section 3.4
         */
        'signature_method': 'HMAC-SHA1',
        /**
         * The identifier portion of the client credentials (equivalent to a
         * username).  The parameter name reflects a deprecated term (Consumer
         * Key) used in previous revisions of the specification, and has been
         * retained to maintain backward compatibility.
         */
        'consumer_key': null,
        /**
         * The token value used to associate the request with the resource
         * owner.  If the request is not associated with a resource owner
         * (no token available), clients MAY omit the parameter.
         */
        'token': null,
        /**
         * OPTIONAL.  If present, MUST be set to "1.0".  Provides the version
         * of the authentication process as defined in RFC5849.
         */
        'version': null,
        /**
         * Return the current oauth parameter set as a plain old object.
         * @return {Object.<string,string>}
         */
		'params': function () {
			var params	= {
				'oauth_timestamp': this.timestamp,
				'oauth_nonce': this.nonce,
				'oauth_signature_method': this.signature_method,
				'oauth_consumer_key': this.consumer_key
			};

			if (this.token) {
				params.oauth_token	= this.token;
			}
			if (this.version) {
				params.oauth_version	= OAUTH_VERSION;
			}
			return params;
		}
    };

    return oauth;
}());