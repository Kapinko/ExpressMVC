/**
 * Unit test for the OAuth querystring monkey patch module.
 */
(function () {
	var qs		= require(__dirname + '/../lib/querystring');

	describe('querystring', function () {
		describe('#escape()', function () {
			it('should properly escape strings per RFC 3986, Section 2.1',
			function () {
				var tests	= [
					{'input': 'Ladies + Gentlemen', 'expected': 'Ladies%20%2B%20Gentlemen'},
					{'input': 'An encoded string!', 'expected': 'An%20encoded%20string%21'},
					{'input': 'Dogs, Cats & Mice', 'expected': 'Dogs%2C%20Cats%20%26%20Mice'},
					{'input': 'Hello Ladies + Gentlemen, a signed OAuth request!', 'expected': 'Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21'}
				]
				tests.forEach(function (test) {
					var encoded	= qs.escape(test.input);
					encoded.should.equal(test.expected);
				});
			});
		});
	});
}());