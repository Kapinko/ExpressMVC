/**
 * Unit test for the OAuth signature module.
 */
/*global describe:false*/
(function () {
	var signature	= require(__dirname + '/../signature'),
		OAuth		= require(__dirname + '/../lib/oauth'),

		twitter		= {
			'req': {
				'method': 'POST',
				'headers': {'content-type': 'application/x-www-form-urlencoded'},
				'url': 'https://api.twitter.com/1/statuses/update.json?include_entities=true',
				'body': 'status=Hello%20Ladies%20%2b%20Gentlemen%2c%20a%20signed%20OAuth%20request%21'
			},
			'oauth': (function (){
				var oauth	= new OAuth();
				oauth.consumer_key	= 'xvz1evFS4wEEPTGEFPHBog';
				oauth.nonce			= 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg';
				oauth.timestamp		= 1318622958;
				oauth.token			= '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb';
				oauth.version		= true;
				return oauth;
			}()),
			'consumer_secret': 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw',
			'token_secret': 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE'
		},

		rfc5849		= {
			'req': {
				'method': 'POST',
				'headers': {'content-type': 'application/x-www-form-urlencoded'},
				'url': 'http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b',
				'body': 'c2&a3=2+q'
			},
			'oauth': (function () {
				var oauth	= new OAuth();
				oauth.consumer_key	= '9djdj82h48djs9d2';
				oauth.token			= 'kkk9d7dh3k39sjv7';
				oauth.timestamp		= '137131201';
				oauth.nonce			= '7d8f3e4a';
				return oauth;
			}())
		};

	describe('Signature', function () {
		describe('#parse_url()', function () {
			it('should return an object with the protocol and base_url properties',
			function () {
				var url	= 'http://foo.com/blah',
					parsed	= signature.parse_url(url);

				parsed.should.have.property('protocol');
				parsed.should.have.property('base_url');
			});
			it('should return the proper protocol based upon the given url',
			function () {
				var urls	= [
						{'url': 'http://foo.com/blah', 'protocol': 'http:'},
						{'url': 'https://blah.com/foo', 'protocol': 'https:'}
					];

				urls.forEach(function (test) {
					var parsed	= signature.parse_url(test.url);
					parsed.protocol.should.equal(test.protocol);
				});
			});
			it('should return the proper base url',
			function () {
				var urls	= [
						{ 'test': 'http://foo.com/blah', 'expected': 'http://foo.com/blah'},
						{ 'test': 'https://blah.com/foo', 'expected': 'https://blah.com/foo'},
						{ 'test': 'https://api.twitter.com/1/statuses/update.json?include_entities=true', 'expected': 'https://api.twitter.com/1/statuses/update.json'}
					];

				urls.forEach(function(test) {
					var parsed	= signature.parse_url(test.test);
					parsed.base_url.should.equal(test.expected);
				});
			});
		});
		describe('#parameter_string()', function () {
			it('should correctly produce the parameter string from the twitter example',
			function () {
				var expected	= 'include_entities=true&oauth_consumer_key=xvz1evFS4wEEPTGEFPHBog&oauth_nonce=kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1318622958&oauth_token=370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb&oauth_version=1.0&status=Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21',
					parameter_string;

					parameter_string	= signature.parameter_string(
						twitter.req, twitter.oauth
					);
					parameter_string.should.equal(expected);
			});
			it('should correctly produce the parameter string from the RFC5849 example',
			function () {
				var expected	= 'a2=r%20b&a3=2%20q&a3=a&b5=%3D%253D&c%40=&c2=&oauth_consumer_key=9djdj82h48djs9d2&oauth_nonce=7d8f3e4a&oauth_signature_method=HMAC-SHA1&oauth_timestamp=137131201&oauth_token=kkk9d7dh3k39sjv7',
					parameter_string	= signature.parameter_string(
						rfc5849.req, rfc5849.oauth
					);

				parameter_string.should.equal(expected);
			});
		});

		describe('#base_string()', function () {
			it('should correctly produce the signature base string from the ' +
			'twitter example', function () {
				var expected	= 'POST&https%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1318622958%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb%26oauth_version%3D1.0%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521',
					base_string	= signature.base_string(twitter.req, twitter.oauth);

					base_string.should.equal(expected);
			});
			it('should correctly produce the signature base string from the ' +
			'RFC 5849 example', function () {
				var expected	= 'POST&http%3A%2F%2Fexample.com%2Frequest&a2%3Dr%2520b%26a3%3D2%2520q%26a3%3Da%26b5%3D%253D%25253D%26c%2540%3D%26c2%3D%26oauth_consumer_key%3D9djdj82h48djs9d2%26oauth_nonce%3D7d8f3e4a%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D137131201%26oauth_token%3Dkkk9d7dh3k39sjv7',
					base_string	= signature.base_string(rfc5849.req, rfc5849.oauth);

					base_string.should.equal(expected);
			});
		});
		describe('#sign()', function () {
			it('should produce the proper signature for the twitter example',
			function () {
				var expected	= 'tnnArxj06cWHq44gCs1OSKk/jLY=',
					produced	= signature.sign(twitter.req, twitter.oauth,
									twitter.consumer_secret, twitter.token_secret
								);
				produced.should.equal(expected);
			});
		});
	});
}());