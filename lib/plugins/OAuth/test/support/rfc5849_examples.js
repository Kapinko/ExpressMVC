/**
 * A collection of the RFC 5849 example data.
 */
module.exports	= (function () {
	function get_validator(expected) {
		return function (test) {
			test.should.be.a('object');
			
			for (var key in expected) {
				test[key].should.equal(expected[key]);
			}
		};
	}
	
	return {
		"headers": [
			{
				"data": 'OAuth realm="Photos",oauth_consumer_key="dpf43f3p2l4k3l03",oauth_signature_method="HMAC-SHA1",oauth_timestamp="137131200",oauth_nonce="wIjqoS",oauth_callback="http%3A%2F%2Fprinter.example.com%2Fready",oauth_signature="74KNZJeDHnMBp0EMJ9ZHt%2FXKycU%3D"',
				"validate": get_validator({
					realm: 'Photos',
					oauth_consumer_key: 'dpf43f3p2l4k3l03',
					oauth_signature_method: 'HMAC-SHA1',
					oauth_timestamp: '137131200',
					oauth_nonce: 'wIjqoS',
					oauth_callback: 'http://printer.example.com/ready',
					oauth_signature: '74KNZJeDHnMBp0EMJ9ZHt/XKycU='
				})
			},
			{
				"data": 'OAuth realm="Photos",oauth_consumer_key="dpf43f3p2l4k3l03",oauth_token="hh5s93j4hdidpola",oauth_signature_method="HMAC-SHA1",oauth_timestamp="137131201",oauth_nonce="walatlh",oauth_verifier="hfdp7dh39dks9884",oauth_signature="gKgrFCywp7rO0OXSjdot%2FIHF7IU%3D"',
				"validate": get_validator({
					realm: 'Photos',
					oauth_consumer_key: "dpf43f3p2l4k3l03",
			        oauth_token: "hh5s93j4hdidpola",
			        oauth_signature_method: "HMAC-SHA1",
			        oauth_timestamp: "137131201",
			        oauth_nonce: "walatlh",
			        oauth_verifier: "hfdp7dh39dks9884",
			        oauth_signature: "gKgrFCywp7rO0OXSjdot/IHF7IU="
				})
			}
		]
	};
}());