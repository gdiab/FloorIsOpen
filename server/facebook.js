/* 
 * @Author: georgediab
 * @Date:   2014-06-18 14:12:44
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-08-07 22:13:01
 * @File: facebook.js
 */

function Facebook(accessToken) {
    this.fb = Meteor.require('fbgraph');
    this.accessToken = accessToken;
    this.fb.setAccessToken(this.accessToken);
    this.options = {
        timeout: 3000,
        pool: {
            maxSockets: Infinity
        },
        headers: {
            connection: "keep-alive"
        }
    }
    this.fb.setOptions(this.options);
}

Facebook.prototype.postToFacebook = function(text) {
    return this.query('/me/feed?message=' + text, 'post');
}

Facebook.prototype.query = function(query, method) {
    var self = this;
    var method = (typeof method === 'undefined') ? 'get' : method;
    var data = Meteor.sync(function(done) {
        self.fb[method](query, function(err, res) {
            done(null, res);
        });
    });
    return data.result;
}

Facebook.prototype.getUserData = function() {
    return this.query('me');
}

Facebook.prototype.getFbPicture = function() {
    return this.query('/me?fields=picture');
}

Meteor.methods({
    getUserData: function() {
        var fb = new Facebook(Meteor.user().services.facebook.accessToken);
        var data = fb.getUserData();
        return data;
    },
    getFbPicture: function(accessToken) { // make async call to grab the picture from facebook
        var result;
        result = Meteor.http.get("https://graph.facebook.com/me", {
            params: {
                access_token: accessToken,
                fields: 'picture'
            }
        });
        if (result.error) {
            throw result.error;
        }
        return result.data.picture.data.url; // return the picture's url
    },
    postToFacebook: function(text) {
        var accessToken = Meteor.user().services.facebook.accessToken;
        var fb = new Facebook(accessToken);
        //console.log('Facebook.prototype.postToFacebook' + accessToken);
        if(accessToken) {
            //.setAccessToken(Meteor.user().services.facebook.accessToken);
            this.Future = Meteor.require('fibers/future');
            var future = new this.Future();
            var onComplete = future.resolver();
            //Async Meteor (help from : https://gist.github.com/possibilities/3443021
            var data = fb.postToFacebook(text);
            future.wait();
        }else{
            return false;
        }
    }
});



