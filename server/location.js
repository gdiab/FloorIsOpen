/* 
 * @Author: georgediab
 * @Date:   2014-07-20 19:42:33
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-10-08 21:55:00
 * @File: location.js
 */

Meteor.methods({
    getRequestLocation: function() {
        if (!this.isSimulation) {
        	var self = this;
            var ip = headers.get(self, 'x-forward-for'); //headers.methodClientIP(this);
            //console.log(self);
            var geo = GeoIP.lookup(ip);
            //console.log('ip: ' + ip);
            //console.log('geo: ' + geo);
            if (geo) {
                var userProfile;
                userProfile = Meteor.user().profile;
                userProfile.location = geo;
                userProfile.city = geo.city;
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        profile: userProfile
                    }
                });
                var user = Meteor.users.findOne({
                     _id: this.userId
                 });

                return user;
            } else {
                return ''
            }

        }
    }
});
