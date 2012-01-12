/**
 * Test for the Twitter API client
 */
(function () {
    var vows    = require('vows'),
        assert  = require('assert'),
        oAuth   = require('../oauth'),
        Twitter = require('../Twitter'),
        
        //The following values are obtained from the Kapinko LifeLogDev account.
        consumer_key    = 'rTdonA5UwCB9nJbJhep7Q',
        consumer_secret = 'amEev3A2SXLmx9XE7gLWrMmEJInmvBhPAQiKTennWQQ',
        token           = '448998218-vUpvwSfJ0KAqaegN8SszrUxzca7SQc1r8OxXsH2S',
        token_secret    = 'AeqOsIYgXckEbpyMdBe1v3N1Vs4QB3sogiyW1y4lAM',
        
        oauth           = new oAuth(consumer_key, consumer_secret),
        twitter;
        
        oauth.setToken(token, token_secret);
        twitter         = new Twitter(oauth);
        
    vows.describe('Twitter API').addBatch({
        'When asking for a user timeline': {
            topic: function () {
                var self    = this;
                
                twitter.getUserTimeline(null, function () {
                    self.callback.apply(self, arguments);
                });
            },
            'it should retrieve the last 20 status entries': function (topic) {
                assert.isArray(topic);
            }
        }
    }).export(module);
    
}());