/*
 * @Author: georgediab
 * @Date:   2014-06-20 17:48:39
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-20 12:27:57
 * @File: openfloor.js
 */


Meteor.startup(function() {

    console.log('Version: 1.0.28.0606');
    console.log('url: ' + Meteor.openFloorFunctions.url_domain(Meteor.absoluteUrl()));

});

if (Meteor.isClient) {
    Meteor.startup(function() {
        UserLoginState.init();
    });

    UserLoginState.onLogout = function(userId) {
        if (Router)
            Router.go('main');
    }

    // Hooks.onGainFocus = function() {
    //     document.title = "OpenFloor - Real-Time Q & A";
    // }

    IntercomSettings.userInfo = function(user, info) {
      // add properties to the info object, for instance:
      if (user.intercomHash) {
        info.email = user.profile.email;
        info['Name'] = user.profile.name;
        info['registeredWith'] = user.profile.registeredWith;
      }
    }

}


UserLoginState.onLogin = function(userId) {
    if (Meteor.userId()) {
        Meteor.call('getRequestLocation', function(err, data) {
           // console.log('got location data');
        });

        Meteor.call('updateProfileUrl', Meteor.userId(), function(err, data) {
           // console.log('got location data');
        });

        if (typeof(Session) != "undefined" && Session !== null) {
            action = Session.get('loginRedirect');
        }

        if (typeof(action) != "undefined" && action !== null) {
            action = action.split(':');
            switch (action[0]) {
                case 'floorSubmit':
                    $("#pageWrap").removeClass("loginOpen");
                    Router.go('floorSubmit');
                    break;

                case 'subscribeFloor':
                    Meteor.call('subscribe', action[1]);
                    break;

                case 'feedbackSubmit':
                    $("#pageWrap").removeClass("loginOpen");
                    Router.go('feedbackSubmit');
                    break;

                case 'heartFloorRedirect':
                    $("#pageWrap").removeClass("loginOpen");
                    Meteor.call('upvote', action[1]);
                    break;

                case 'heartQuestionRedirect':
                    $("#pageWrap").removeClass("loginOpen");
                    Meteor.call('upvoteQuestion', action[1]);
                    break;

                case 'heartAnswerRedirect':
                    $("#pageWrap").removeClass("loginOpen");
                    Meteor.call('upvoteAnswer', action[1]);
                    break;

                case 'askQuestion':
                    $(".ask-question-form").show();
                    $('.ask-question').hide();
                    break;

                case 'floorRedirect':

                    break;
            }
            $('#navopen, #pageWrap').removeClass("active");
            $('#pageWrap').removeClass('loginOpen');
        }
    }
}

if(!String.linkify) {
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
            .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    };
}

Meteor.openFloorFunctions = {
    url_domain: function(url) {
        var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        return domain = matches && matches[1]; // domain will be null if no match is found
    }
}

if (Meteor.isServer) {

    Meteor.methods({
        'headers': function() {
            return headers.get(this);
        },
        'sendToSlack': function(feedback) {
            slack.send({
                channel: '#user-feedback',
                unfurl_links: 1,
                text: feedback.userName + ' has left some feedback: ' + feedback.body,
                username: '[Feedback] - OpenFloor App'
            });
        },
        'sendFeedbackToSlack': function(feedback) {
            if (!feedback.user)
                throw new Meteor.Error(401, "You need to login to leave feedback.");

            slack.send({
                channel: '#user-feedback',
                unfurl_links: 1,
                text: feedback.user.profile.name + ' has left some feedback: ' + feedback.body,
                username: '[Feedback] - OpenFloor App'
            });

            return 'success';
        }
    });
}
