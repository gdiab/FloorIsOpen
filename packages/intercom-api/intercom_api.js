
var options = {
    apiKey: Meteor.settings.intercom.secret,
    appId: Meteor.settings.public.intercom.id
};
openFloorIntercom = Npm.require('intercom.io');

//console.log(options);
ic = new openFloorIntercom(options);

            // var email = ['me@georgediab.com'];
            // ic.createTag({name: 'plop', users: [{email: 'me@georgediab.com'}]});