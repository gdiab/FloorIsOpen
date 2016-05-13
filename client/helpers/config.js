/*
 * @Author: georgediab
 * @Date:   2014-06-12 21:45:06
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-10-29 22:21:54
 * @File: config.js
 */

Accounts.ui.config({
    requestPermissions: {
        facebook: ['email', 'user_friends'],
        twitter: ['name']
    },
    // requestOfflineToken: {
    // 	// google: true
    // },
    passwordSignupFields: 'USERNAME_AND_EMAIL' //  One of 'USERNAME_AND_EMAIL', 'USERNAME_AND_OPTIONAL_EMAIL', 'USERNAME_ONLY', or 'EMAIL_ONLY' (default).
});

Accounts.config({
	loginExpirationInDays: 60
});

// during new account creation get user picture from Facebook and save it on user object
// Accounts.ui.onCreateUser(function(options, user) {
//     if (options.profile) {
//         Meteor.call('getFbPicture', function(err, data) {
//             options.profile.picture = getFbPicture(user.services.facebook.accessToken);
//             user.profile = options.profile; // We still want the default 'profile' behavior.
//         });

//     }
//     return user;
// });
