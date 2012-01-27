/**
 * Unit test for the OAuth oauth parameter object.
 */
(function () {
	var OAuth	= require(__dirname + '/../lib/oauth');

	describe('oauth', function () {
		var oauth;

		beforeEach(function (done) {
			oauth	= new OAuth();
			done();
		});

		describe('#params()', function () {
			it('should return all of the required protocol params per RFC 5849 '
			+ 'Section 3.1.1',
			function () {
				var params	= oauth.params();

				params.should.have.property('oauth_consumer_key');
				params.should.have.property('oauth_signature_method');
				params.should.have.property('oauth_timestamp');
				params.should.have.property('oauth_nonce');
			});
			it('should only have an oauth_version property if we set it',
			function () {
				var params	= oauth.params();
				params.should.not.have.property('oauth_version');

				oauth.version	= true;
				oauth.params().should.have.property('oauth_version');
				oauth.params().oauth_version.should.equal('1.0');
			});
			it('should only have an oauth_token property if we set it',
			function () {
				oauth.params().should.not.have.property('oauth_token');
				oauth.token	= oauth.nonce;
				oauth.params().should.have.property('oauth_token');
				oauth.params().oauth_token.should.equal(oauth.nonce);
			});
			it('should return "1.0" for the oauth_version if set to any truthy value',
			function () {
				[true,'blah',1.0, 2.3, 'boo'].forEach(function (test) {
					oauth.version	= test;
					oauth.params().oauth_version.should.equal('1.0');
				});
			});
		});
		describe('.nonce', function () {
			it('should automatically generate on the first access',
			function () {
				var nonce	= oauth.nonce;
				nonce.should.not.be.empty;
				nonce.should.be.a('string');
			});
			it('should not change on subsequent access unless set',
			function () {
				var nonce	= oauth.nonce;
				oauth.nonce.should.equal(nonce);
				oauth.nonce	= 'boo';
				oauth.nonce.should.equal('boo');
			});
			it('should regenerate if set to a falsy value',
			function () {
				var nonce	= oauth.nonce;

				[false, null, ''].forEach(function (falsy) {
					nonce		= oauth.nonce;
					oauth.nonce	= falsy;
					oauth.nonce.should.not.be.empty;
					oauth.nonce.should.be.a('string');
					oauth.nonce.should.not.equal(nonce);
				});
			});
		});
	});
}());