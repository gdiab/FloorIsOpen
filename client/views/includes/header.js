/* 
 * @Author: georgediab
 * @Date:   2014-06-12 15:17:59
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-10-19 22:26:49
 * @File: header.js
 */

Session.setDefault('hasOpenFloor', false);
Session.setDefault('eventFloorId', '');

function isCanvasSupported() {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
}

Template.header.helpers({
    activeRouteClass: function( /* route names*/ ) {
        var args = Array.prototype.slice.call(arguments, 0);
        args.pop();
        var active = _.any(args, function(name) {
            return Router.current() && Router.current().route.name === name
        });

        return active && 'active';
    },
    hasEmail: function() {
        var user = Meteor.user();
        if (!user) {
            return false;
        }
        if (typeof user.profile.email === 'undefined' || user.profile.email == null) {
            $('#getEmail').addClass("active");
            return false;
        } else if (user.profile.email.trim() == '') {
            $('#getEmail').addClass("active");
            return false;
        } else {
            //console.log('has email');
            return true;
        }
    },
    hasOpenFloor: function() {
        var floor = Floors.findOne({
            userId: Meteor.userId(),
            floorStatus: 'Open'
        });
        if (floor) {
            if (floor.userId == Meteor.userId()) {
                return true;
            } else {
                return false;
            }
        }
    },
    hasOpenedFloor: function() {
        var floor = Floors.findOne({
            userId: Meteor.userId()
        });
        if (floor) {
            return true;
        } else {
            return false;
        }
    },
    isEvent: function() {
        // if(Router.current().route.path(this).indexOf('/floors/') == -1)
        //     Session.set('eventFloorId', '');
        var floor = Floors.findOne({
            _id: Session.get('eventFloorId')
        });
        if (floor && typeof floor.eventCode !== 'undefined') {
            return true;
        } else {
            Session.set('eventFloorId', '');
            return false;
        }
    },
    pic: function() { // helper function to display the pic on the page
        var userProfile;
        userProfile = Meteor.user().profile;
        userService = Meteor.user().services;

        if (userProfile) { // logic to handle logged out state
            if (userService.facebook) {
                Meteor.call('getFbPicture', userService.facebook.accessToken, function(err, data) {
                    console.log(data);
                    Meteor.call('updateFacebookProfileUrl', Meteor.userId(), data,
                        function(err, data) {
                            if(err)
                                console.log(err);
                        });
                });
            }
            return userProfile.picture;
        }
    }
});

Template.header.events({
    'click #login-buttons-logout': function(e) {
        Meteor.logout(function() {
            //loginButtonsSession.closeDropdown();
        });

        e.preventDefault();
    },
    'click .closeMenu': function(e) {
        $(".navbar-toggle:visible").trigger("click");
    },
    'click #navopen, click .navbar-toggle': function(e) {
        e.preventDefault();
        if ($('#loginMenu.active').length) {
            $('#loginMenu, #navopen, .nav.navbar-nav.navbar-right').removeClass("active");
            $('#pageWrap').removeClass('loginOpen');
        } else {
            $(".nav.navbar-nav.navbar-right, #navopen, #pageWrap").toggleClass("active");
        }
        return false;
    },
    'click .login': function() {
        Session.set('loginRedirect', 'floorSubmit');
        $('#loginMenu, #navopen').addClass("active");
        //$('#pageWrap').addClass('loginOpen');
        if ($(".nav.navbar-nav.navbar-right.active").length) {
            $(".nav.navbar-nav.navbar-right").removeClass("active");
        }
    },
    'click .close-log': function() {
        $('#loginMenu, #navopen').removeClass("active");
        $('#getEmail, #navopen').removeClass("active");
        $('#pageWrap').removeClass('loginOpen');
        if ($(".nav.navbar-nav.navbar-right.active").length) {
            $(".nav.navbar-nav.navbar-right").removeClass("active");
        }

        if ($("#pageWrap").length) {
            $("#pageWrap").removeClass("active");
        }

    }
});

Template.header.rendered = function() {
    if (!isCanvasSupported()) {
        window.location.replace('http://google.com');
    }

    var userAgent = window.navigator.userAgent;
    if (userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) || userAgent.match(/Android/i)) {
        $(document).on("focus", "input[type=text], textarea", function() {
            $("#header,#right-side").addClass("fixfixed");
        });
        $(document).on("blur", "input[type=text], textarea", function() {
            Meteor.setTimeout(function() {
                $("#header,#right-side").removeClass("fixfixed");
            }, 1000);
        });
    }

}
