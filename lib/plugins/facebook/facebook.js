(function () {
    var fb_app_id= '113265335424293',
    fb_secret= 'dbecc0deb69959225e8d0a9c661fc13d',
    https = require('https'),
    querystring= require('querystring'),
    url='http://v4.psync-dev.com/facebookloginredirect';
    
    
    
    module.exports	= function (MVC, server) {
   
    
    return {
        
        'access_token': function(code, cb){
            
                        
            var token_url = "/oauth/access_token?"
                            + "client_id=" + fb_app_id 
                            + "&redirect_uri=" + encodeURI(url)
                            + "&client_secret=" + fb_secret 
                            + "&code=" + code;
                   
            this.graph(token_url, cb);           
                        
                        
                        
                         
        },
        
        'user_data': function(access_token,cb)
        {
            var token_url = "/me?access_token="+ access_token;
            
            
            this.graph(token_url,cb);
        },
        
        
        
        
        'graph': function(token_url, cb)
        {
            
            https.get({host: 'graph.facebook.com', path: token_url}, function(res) {
                          res.setEncoding("utf8");
                          var d = '';
    
                          res.on('data', function(c) {
                              d += c;
                          });
                          
                          res.on('end', function() {
                              cb(null, querystring.parse(d));
                          });

                        }).on('error', function(e) {
                          console.error(e);
                        });
        }
   };

}
    
	
}());