/**
 * Unit test for the OAuth header object.
 */
(function () {
	var APP_PORT	= 27478,
		should		= require('should');
	
	describe('OAuthHeader', function () {
		var OAuthHeader	= require(__dirname + '/../header'),
			http		= require('http'),
			express		= require('express'),
			examples	= require(__dirname + '/support/rfc5849_examples'),
			
			check_ex12_initiate	= function (oauth) {
				
			};
			
		describe('#parse()', function () {
			it('should parse out the oauth header parameters',
			function (done) {
				examples.headers.forEach(function (el) {
					var oauth	= OAuthHeader.parse(el.data);
					el.validate(oauth);
				});
				
				done();
			});
		});
		describe('#request()', function () {
			it('should parse out the OAuth header from a given request', 
			function (done) {
				var app	= express.createServer(),
					header	= examples.headers[0].data,
					validate	= examples.headers[0].validate;
				
				app.use(OAuthHeader.request);
				app.use(function (req, res) {
					res.end(JSON.stringify(req.oauth));
				});
				
				app.on('listening', function () {
					var options	= {
							host: 'localhost',
							port: APP_PORT,
							path: '/',
							method: 'POST',
							headers: {
								'Authorization': header
							}
						},
						req	= http.request(options, function (res) {
							var body	= '';
							
							res.setEncoding('utf8');
							res.on('data', function (chunk) {
								body += chunk;
							});
							
							res.on('end', function () {
								var oauth	= JSON.parse(body);
								validate(oauth);
								app.close();
								done();
							});
							
							res.on('close', function () {
								console.log("Something bad happened");
								done();
							});
						});
					
					req.on('error', function (e) {
						console.log("problem with request: " + e.message);
					});
					req.end();
				});
				
				app.listen(APP_PORT);
			});
		});
	});
}());