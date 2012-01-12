/**
 * Test for the oauth module.
 */
(function () {
    var vows    = require('vows'),
        assert  = require('assert'),
        url     = require('url'),
        oAuth   = require('./oauth'),
        
        //Following values are obtained from:
        //@see https://dev.twitter.com/docs/auth/creating-signature
        consumer_key    = 'xvz1evFS4wEEPTGEFPHBog',
        consumer_secret = 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw',
        token           = '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb',
        token_secret    = 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE',
        oauth_nonce     = 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg',
        oauth_timestamp = '1318622958',
        twitter_method  = 'POST',
        twitter_url     = 'https://api.twitter.com/1/statuses/update.json?include_entities=true',
        twitter_params  = { 'status': 'Hello Ladies + Gentlemen, a signed OAuth request!' };
        
    function twitter_oauth() {
        var oauth   = new oAuth(consumer_key, consumer_secret);
        oauth.setToken(token, token_secret);
        
        //monkey patch to return static values.
        oauth.timestamp = function () { return oauth_timestamp; };
        oauth.nonce     = function () { return oauth_nonce; };
        
        return oauth;
    }
        
        
    vows.describe('oAuth object').addBatch({
        'When created it': {
            topic: new oAuth(consumer_key, consumer_secret),
            'should store the proper consumer key values': function (topic) {
                assert.strictEqual(topic.consumer_key, consumer_key);
                assert.strictEqual(topic.consumer_secret, consumer_secret);
            },
            'and it should have the proper defaults': function (topic) {
                assert.strictEqual(topic.signature_method, 'HMAC-SHA1');
                assert.strictEqual(topic.oauth_version, '1.0');
            }
        },
        'Setting a token': {
            topic: twitter_oauth,
            'should store the proper token values': function (topic) {
                assert.strictEqual(topic.token, token);
                assert.strictEqual(topic.token_secret, token_secret);
            }
        },
        'Setting a version': {
            topic: function () {
                return twitter_oauth().setVersion('2.0');
            },
            'should store the given version': function (topic) {
                assert.strictEqual(topic.version, '2.0');
            }
        },
        'Setting an signature method': {
            topic: function () {
                return twitter_oauth().setSignatureMethod('blah');
            },
            'should store the method': function (topic) {
                assert.strictEqual(topic.signature_method, 'blah');
            }
        },
        'Signing a given string': {
            topic: function () {
                return twitter_oauth().sign(oauth_nonce);
            },
            'should return the proper signature': function (topic) {
                var key     = consumer_secret + '&' + token_secret,
                    hmac    = require('crypto').createHmac('sha1', key);
                hmac.update(oauth_nonce);
                
                assert.strictEqual(topic, hmac.digest('base64'));
            }
        },
        'Asking for the parameter string': {
            topic: function () {
                var oauth   = twitter_oauth(),
                    purl    = url.parse(twitter_url, true);
                
                return oauth.getParameterString(purl.query, twitter_params);
            },
            'should return the expected string': function (topic) {
                var expected    = "include_entities=true&oauth_consumer_key=xvz1evFS4wEEPTGEFPHBog&oauth_nonce=kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1318622958&oauth_token=370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb&oauth_version=1.0&status=Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21";
                
                assert.strictEqual(topic, expected);
            }
        },
        'Asking for the signature base string': {
            topic: function () {
                var oauth   = twitter_oauth();
                
                return oauth.getSignatureBaseString('post', twitter_url, twitter_params);
            },
            'should return the expected string': function (topic) {
                var expected    = 'POST&https%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1318622958%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb%26oauth_version%3D1.0%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521';
                assert.strictEqual(topic, expected);
            }
        },
        'Asking for the authorization header': {
            topic: function () {
                var oauth   = twitter_oauth();
                return oauth.getHeader(twitter_method, twitter_url, twitter_params);
            },
            'should return the expected string': function (topic) {
                var expected    = 'OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog", oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg", oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1318622958", oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb", oauth_version="1.0"';
                assert.strictEqual(topic, expected);
            }
        }
        
    }).export(module);
}());