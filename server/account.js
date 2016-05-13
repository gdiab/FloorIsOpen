/*
 * @Author: georgediab
 * @Date:   2014-06-19 23:14:58
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-20 12:25:43
 * @File: account.js
 */

var getService = function(user) {
    if (user.services && user.services.twitter) {
        return 'twitter';
    } else if (user.services && user.services.facebook) {
        return 'facebook';
    } else {
        return 'none';
    }
};

Meteor.startup(function() {
    Twitter.whitelistedFields = ['profile_image_url', 'profile_image_url_https', 'lang', 'name'];
    Accounts.loginServiceConfiguration.remove({
        service: 'twitter'
    });

    Accounts.loginServiceConfiguration.insert({
        service: 'twitter',
        consumerKey: process.env.TWITTER_KEY,
        secret: process.env.TWITTER_SECRET,
        loginStyle: 'redirect'
    });

    //setup facebook account integration
    Accounts.loginServiceConfiguration.remove({
        service: 'facebook'
    });

    Accounts.loginServiceConfiguration.insert({
        service: 'facebook',
        appId: process.env.FB_ID,
        secret: process.env.FB_SECRET,
        loginStyle: 'redirect'
    });
    Meteor.settings.public.intercom.id = process.env.INTERCOM_ID;
    Meteor.settings.intercom.secret = process.env.INTERCOM_SECRET;
});

Accounts.onCreateUser(function(options, user) {
    if (user.services.facebook) {
        if (options.profile) {
            Meteor.call('getFbPicture', user.services.facebook.accessToken, function(err, data) {
                options.profile.picture = data;
                options.profile.first_name = user.services.facebook.first_name;
                options.profile.last_name = user.services.facebook.last_name;
                options.profile.email = user.services.facebook.email;
                options.profile.registeredWith = 'facebook';
                var initial = ((typeof user.services.facebook.last_name === 'undefined') ? '' : user.services.facebook.last_name.charAt(0));
                var username = user.services.facebook.first_name + initial;
                username = username.toLowerCase();
                var usernamesInUse = Meteor.users.find({
                    'profile.username': username
                }).count();
                console.log('usernames in use: ' + usernamesInUse);
                if (usernamesInUse > 0) {
                    $loop = true;
                    while ($loop) {
                        var num = Math.floor(Math.random() * 90000) + 10000;
                        var usernamesInUse = Meteor.users.find({
                            'profile.username': username + num
                        }).count();
                        username = username + num;
                        $loop = (usernamesInUse != 0);

                    }
                }
                options.profile.username = username;

                user.profile = options.profile;
            });
        }
        if (typeof user.services.facebook.email !== 'undefined') {
            Meteor.call('sendWelcomeEmail', user.services.facebook, function(error, result) {

            });
        }
    } else if (user.services.twitter) {
        if (options.profile) {
            console.log(user.services.twitter);
            options.profile.picture = user.services.twitter.profile_image_url;
            var name = user.services.twitter.name.split(' ');
            for (var i = name.length - 1; i--;) {
                if (name[i] === "") name.splice(i, 1);
            }
            options.profile.first_name = name[0];
            options.profile.last_name = name[1];
            options.profile.registeredWith = 'twitter';
            options.profile.description = user.services.twitter.description;
            options.profile.id_str = user.services.twitter.id_str;
            options.profile.city = user.services.twitter.location;
            options.profile.url = user.services.twitter.url;

            var initial = ((typeof name[1] === 'undefined') ? '' : name[1].charAt(0));
            var username = name[0] + initial;
            username = username.toLowerCase();
            var usernamesInUse = Meteor.users.find({
                'profile.username': username
            }).count();
            console.log('usernames in use: ' + usernamesInUse);
            if (usernamesInUse > 0) {
                $loop = true;
                while ($loop) {
                    var num = Math.floor(Math.random() * 90000) + 10000;
                    var usernamesInUse = Meteor.users.find({
                        'profile.username': username + num
                    }).count();
                    username = username + num;
                    $loop = (usernamesInUse != 0);

                }
            }
            options.profile.username = username;

            user.profile = options.profile; // We still want the default 'profile' behavior.
        }
    } else {
        if (options.profile) {
            options.profile.email = user.emails[0].address;
            var name = options.profile.name.split(' ');
            options.profile.first_name = name[0];
            options.profile.last_name = name[1];
            user.profile = options.profile;
        }
        Meteor.call('sendWelcomeEmail', options.profile, function(error, result) {

        });

    }
    user.userSubscriptionStatus = "Gold"; //making every new member GOLD
    return user;
});

Meteor.methods({
    fblogin: function(response) {
        var identity = Meteor.call('$getFacebookIdentity', response.access_token);
        // synchronous call to get the user info from Facebook

        var serviceData = {
            accessToken: response.access_token,
            expiresAt: (+new Date) + (1000 * response.expires_in)
        };
        // include all fields from facebook
        // http://developers.facebook.com/docs/reference/login/public-profile-and-friend-list/
        var whitelisted = ['id', 'email', 'name', 'first_name',
            'last_name', 'link', 'username', 'gender', 'locale', 'age_range'
        ];

        var fields = _.pick(identity, whitelisted);
        _.extend(serviceData, fields);

        var stuff = {
            serviceName: 'facebook',
            serviceData: serviceData,
            options: {
                profile: {
                    name: identity.name
                }
            }
        };
        var userData = Accounts.updateOrCreateUserFromExternalService(stuff.serviceName, stuff.serviceData, stuff.options);

        var x = DDP._CurrentInvocation.get();

        var token = Accounts._generateStampedLoginToken();
        Accounts._insertLoginToken(userData.userId, token);
        Accounts._setLoginToken(userData.userId, x.connection, Accounts._hashLoginToken(token.token))
        x.setUserId(userData.userId)


        return {
            id: userData.userId,
            token: token.token,
            tokenExpires: Accounts._tokenExpiration(token.when)
        };

    },
    $getFacebookIdentity: function(accessToken) {
        try {
            return HTTP.get("https://graph.facebook.com/me", {
                params: {
                    access_token: accessToken
                }
            }).data;
        } catch (err) {
            throw _.extend(new Error("Failed to fetch identity from Facebook. " + err.message), {
                response: err.response
            });
        }
    },
    // $getTwitterIdentity: function(accessToken, accessTokenSecret) {
    //     try {
    //         return twitter.getnew("account/verify_credentials.json", {
    //             params: {
    //                 access_token: accessToken,
    //                 access_token_secret: accessTokenSecret
    //             }
    //         }, accessToken, accessTokenSecret).data;
    //     } catch (err) {
    //         throw _.extend(new Error("Failed to fetch identity from Twitter. " + err.message), {
    //             response: err.response
    //         });
    //     }
    //     // Twitter = {};

    //     // var urls = {
    //     //     requestToken: "https://api.twitter.com/oauth/request_token", // 4
    //     //     authorize: "https://api.twitter.com/oauth/authorize", // 5
    //     //     accessToken: "https://api.twitter.com/oauth/access_token", // 6
    //     //     authenticate: "https://api.twitter.com/oauth/authenticate" // 7
    //     // };

    // },
    // searchTwitter: function(term) {
    //     return twitter.search(term);
    // },
    userSubscriptionStatus: function(userId) {
        var user = Meteor.users.findOne({
            _id: userId
        });
        console.log('get member status');
        console.log(user.userSubscriptionStatus);

        return ((typeof user.userSubscriptionStatus == 'undefined') ? 'Free' : user.userSubscriptionStatus);
    },
    updateProfileUrl: function(userId) {
        if (!this.isSimulation) {
            var user = Meteor.users.findOne({
                _id: userId
            });
            var svc = getService(user);
            if (svc === 'twitter') {
                if (user.services.twitter.profile_image_url != user.profile.picture) {
                    Meteor.users.update(userId, {
                        $set: {
                            'profile.picture': user.services.twitter.profile_image_url
                        }
                    });
                }
            }
        }
    },
    updateFacebookProfileUrl: function(userId, profileImageUrl) {
        if (!this.isSimulation) {
            var user = Meteor.users.findOne({
                _id: userId
            });
            var svc = getService(user);
            if (svc === 'facebook') {
                if (profileImageUrl != user.profile.picture) {
                    Meteor.users.update(userId, {
                        $set: {
                            'profile.picture': profileImageUrl
                        }
                    });
                }
            }
        }
    }
});
