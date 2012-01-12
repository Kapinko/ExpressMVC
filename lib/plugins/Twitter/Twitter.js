/**
 * An abstraction of the twitter API
 * 
 * @param {MVC} MVC
 * @param {HTTPServer} server
 * @return {Object.<string,function>}
 */
module.exports = (function() {
    var url             = require('url'),
        API_HOST         = 'api.twitter.com';
    
    function get_url(path, params) {
        var urlObj  = {
            'host': API_HOST,
            'pathname': '/1' + path,
            'query': params || {}
        };
        
        return url.format(urlObj);
    }
    /**
     * @param {oAuth} oauth
     */
    function twitter(oauth) {
        this.oauth      = oauth;
    }
    twitter.prototype   = {
        /**
         * Get the 20 most current user status entries or the 20 with ids less 
         * than or equal to the given id.
         * @param {string} most_recent_id
         * @param {function()} callback
         */
        'getUserTimeline': function (most_recent_id, callback) {
            var params  = (most_recent_id) ? {'max_id': most_recent_id } : {},
                api_url = get_url('/statuses/user_timeline.json', params);
                
            this.oauth.get(api_url, params, callback);
        }
    };
    
    return twitter;
}());