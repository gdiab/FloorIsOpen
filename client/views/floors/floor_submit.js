/* 
 * @Author: georgediab
 * @Date:   2014-06-03 21:53:03
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-03 22:09:59
 * @File: floor_submit.js
 */
 
Session.setDefault('hasPopped', false);
Session.setDefault('showFloorSettings', false);
Session.setDefault('showUpgradedFeatures', false);
Session.setDefault('scheduleDayLimit', 4);
Session.setDefault('currentDay', -1);

Template.getEmail.events({
    'submit form': function(e, template) {
        if ($("input[type=submit]").val() == 'Save') {
            e.preventDefault();
            var email = $(e.target).find('[name=email]').val();
            if(!validateEmail(email)) {
                Alerts.insert({
                    title: 'That\'s not an email!',
                    message: 'Can you make sure your email is entered correctly?',
                    userId: Meteor.userId(),
                    seen: false,
                    alertType: 'error'
                });
                return;
            }
            var userProfile;
            userProfile = Meteor.user().profile;
            //console.log($(e.target).find('[name=email]').val());
            if (userProfile) { // logic to handle logged out state
                userProfile.email = email;

            }
            Meteor.users.update(Meteor.userId(), {
                $set: {
                    profile: userProfile
                }
            });

            Meteor.call('sendWelcomeEmail', userProfile, function(error, result) {

            });
        }
    }
});

Template.floorSubmit.events({
    'submit form': function(e) {
        //console.log($("input[type=submit]").val());
        if ($("input[type=submit]").val() == 'Open the Floor') {
            e.preventDefault();
            
            $("input[type=submit]").attr("disabled", "disabled");
            var user = Meteor.user();
            var host = user.profile.name;

            var closingIn;

            var privateFlag = $(e.target).find('[name=private]:checked').val();
            var requireLogin = $(e.target).find('[name=require-login]:checked').val();
            var requireOptIn = $(e.target).find('[name=require-opt-in]:checked').val();
            var title = $(e.target).find('[name=title]');
            var desc = $(e.target).find('[name=description]');
            var optInMessage = $(e.target).find('[name=opt-in-message]');
            var $rawTitle = title.val();
            var $rawDescription = desc.val();
            var rawOptInMessage = optInMessage.val();
            var titleWords = title.val().split(' ');

            privateFlag = ((typeof privateFlag == 'undefined') ? false : true);
            requireLogin = ((typeof requireLogin == 'undefined') ? false : true);
            requireOptIn = ((typeof requireOptIn == 'undefined') ? false : true);

            titleWords = titleWords.filter(function(x) {
                return x.length > 30
            });

            $.each(titleWords, function(index, value) {
                title.val(title.val().replace(value, '<span>' + value + '</span>'));
            });

            var descWords = desc.val().split(' ');
            descWords = descWords.filter(function(x) {
                return x.length > 30
            });
            //$('#container').html($('#container').html().replace(/(dog)/g,'<span class="highlight">$1</span>'));

            $.each(descWords, function(index, value) {
                desc.val(desc.val().replace(value, '<span>' + value + '</span>'));
            });

            var $openFor = $(e.target).find('[name=open-for]').val();
            var $cooldown = $(e.target).find('[name=cooldown]').val();
            var $openOn = ($(e.target).find('[name=open-on-client]').val() == '' ? undefined : Number($(e.target).find('[name=open-on-client]').val()));
            var $eventCode = ($(e.target).find('[name=event-code]').val() == '' || typeof $(e.target).find('[name=event-code]').val() === 'undefined' ? undefined : $(e.target).find('[name=event-code]').val().toLowerCase());

            if (typeof $openOn != 'undefined' && !isValidDate($openOn)) {
                var a = moment(TimeSync.serverTime(Number($(document).find('[name=open-on-client]').val())));
                var b = moment(TimeSync.serverTime());
                //console.log('number of days between dates: ' + a.diff(b, 'days'));

                if (a.diff(b, 'days') > Session.get('scheduleDayLimit')) {
                    Alerts.insert({
                        title: 'Scheduling error!',
                        message: 'The date you have set is outside the allowed limit!',
                        userId: Meteor.userId(),
                        seen: false,
                        alertType: 'error'
                    });
                    $("input[type=submit]").removeAttr("disabled");
                    return;
                }

                Alerts.insert({
                    title: 'Scheduling error!',
                    message: 'The date you have set is not valid!',
                    userId: Meteor.userId(),
                    seen: false,
                    alertType: 'error'
                });
                $("input[type=submit]").removeAttr("disabled");
                return;
            }
            $cooldown = ((typeof $cooldown == 'undefined') ? '5' : $cooldown);
            $openFor = ((typeof $openFor == 'undefined') ? '15' : $openFor);

            if ($cooldown.trim() == '') {
                $cooldown = 5;
            }

            if ($openFor.trim() == '') {
                $openFor = 15;
            }

            if (!isValidNumber($openFor)) {
                Alerts.insert({
                    title: 'Scheduling error!',
                    message: 'The number of minutes you set to leave the floor open is not valid!',
                    userId: Meteor.userId(),
                    seen: false,
                    alertType: 'error'
                });
                $("input[type=submit]").removeAttr("disabled");
                return;
            }

            if (!isValidNumber($cooldown)) {
                Alerts.insert({
                    title: 'Scheduling error!',
                    message: 'The number of minutes you set to answer questions after the floor closes is not valid!',
                    userId: Meteor.userId(),
                    seen: false,
                    alertType: 'error'
                });
                $("input[type=submit]").removeAttr("disabled");
                return;
            }

            if (!moment($openOn).isAfter(moment()) || $(".schedule-day").html() ==  'Now') {
                //console.log('am i in the past: ' + moment($openOn));
                $openOn = undefined;
            }


            var floor = {
                host: host,
                title: title.val().linkify(),
                openDuration: $openFor,
                description: desc.val().linkify(),
                rawDescription: $rawDescription,
                rawTitle: $rawTitle,
                cooldown: $cooldown,
                active: false,
                openOn: $openOn,
                private: privateFlag,
                eventCode: $eventCode,
                requireLogin: requireLogin,
                requireOptIn: requireOptIn,
                optInMessage: optInMessage.val()
            }



            Meteor.call('floor', floor, function(error, newFloor) {
                if (error) {
                    throwError(error.reason);
                    if (error.error === 302) {
                        $("input[type=submit]").removeAttr("disabled");
                        //console.log('am i here?');
                        Router.go('floorPage', {
                            _id: error.details
                        });
                    }
                    if (error.error === 422) {
                        $("input[type=submit]").removeAttr("disabled");

                    }
                    if (error.error === 305) {
                        //console.log(error);
                        //console.log(error.details);
                        Router.go('floorPage', {
                            _id: error.details
                        });
                    }
                } else {
                    GAnalytics.event("floor", "create", "host: " + user.profile.name);
                    $("input[type=submit]").removeAttr("disabled");
                    Session.set('hasOpenFloor', true);
                    Session.set('justOpenedShown', false);
                    Meteor.setTimeout(function() {
                        Router.go('userFloorPage', {
                            _username: user.profile.username,
                            _floorNumber: ((typeof user.profile.floorsOpened === 'undefined') ? 1 : user.profile.floorsOpened + 1).toString()
                        });
                    }, 10);

                }

            });
        }

    },
    'keypress .popMessage': function() {
        if (!Session.get('hasPopped')) {
            PNotify.desktop.permission();
            (new PNotify({
                title: 'PRO TIP',
                text: 'You will want to share your floor once it\'s open.',
                type: 'info',
                desktop: {
                    desktop: true
                }
            }));
            var s = new buzz.sound('/sounds/openfloor-alert.mp3');
            s.play().fadeIn();
            Session.set('hasPopped', true);
        }

    },
    'change #require-opt-in': function(e) {
        var checkedValue;
        checkedValue = $(e.currentTarget).is(':checked');
        if(checkedValue){
            $('.opt-in-message').removeClass("noshow");
        }
        else
        {
            $('.opt-in-message').addClass("noshow");
        }
    },
    'click .btn-schedule': function() {
        Session.set('showFloorSettings', true);
    },
    'click .btn-schedule-cancel': function() {
        $('[name=open-on]').val('');
        Session.set('showFloorSettings', false);
    },
    'click #btnFloorOptions': function(e, template) {

        $('.floor-options').toggle();
    },
    'click #btnFloorHelp': function() {
        $("#helpSubmit").addClass("active");
    },
    'click .close-log': function() {
        $(".messageWindow").removeClass("active");
    },
    'click .day-arrow': function(e) {
        var direction = $(e.currentTarget).data("direction");
        var currentDay = Session.get('currentDay');
        var limit = Session.get('scheduleDayLimit');
        switch (direction) {
            case 'up':
                if (currentDay > 0) {
                    var nextDay = moment().add(currentDay - 1, 'days');
                    var scheduleDay = moment(nextDay).format("ddd, MMM Do, YYYY");
                    var scheduleHour = moment(Number($(document).find('[name=open-on-client]').val())).format("h:mm A");
                    Session.set('currentDay', currentDay - 1);

                    var openOnClient = $(document).find('[name=open-on-client]');
                    openOnClient.val(getRoundedMinutes(new Date(nextDay).getTime()));
                    var openOnServer = $(document).find('[name=open-on-server]');
                    openOnServer.val(TimeSync.serverTime(nextDay));
                    $(".schedule-time").show();
                } else {
                    var scheduleDay = 'Now';
                    Session.set('currentDay', -1);
                    resetDateToToday();
                    $(".schedule-time").hide();
                }
                break;

            case 'down':
                if (currentDay < limit) {
                    var nextDay = moment().add(currentDay + 1, 'days');

                    var scheduleDay = moment(nextDay).format("ddd, MMM Do, YYYY");
                    var scheduleHour = moment(nextDay).format("h:mm A");
                    Session.set('currentDay', currentDay + 1);
                    var openOnClient = $(document).find('[name=open-on-client]');
                    openOnClient.val(getRoundedMinutes(nextDay.valueOf()));
                    var openOnServer = $(document).find('[name=open-on-server]');
                    openOnServer.val(TimeSync.serverTime(nextDay));

                    if (!nextDay.isAfter(moment())) {
                        //console.log('need to move time up more...');
                        //console.log(scheduleHour);
                        var nextTime = nextDay.add(30, 'minutes');
                        nextTime = getRoundedMinutes(nextTime);
                        scheduleHour = moment(nextTime).format("h:mm A");
                        //console.log(scheduleHour);
                        //console.log(getRoundedMinutes(new Date(nextTime).getTime()));
                        openOnClient.val(nextTime.valueOf());
                        openOnServer.val(TimeSync.serverTime(nextTime));
                    }
                    $(".schedule-time").show();
                } else {
                    Session.set('currentDay', -1);
                    var scheduleDay = 'Now';
                    resetDateToToday();
                    $(".schedule-time").hide();
                }
                break;

        }

        $(".schedule-day").html(scheduleDay);
        $(".schedule-hour").html(scheduleHour);

    },
    'click .time-arrow': function(e) {
        //console.log('time-arrow clicked');
        var direction = $(e.currentTarget).data("direction");
        if (direction == 'up') {
            var nextTime = moment(Number($(document).find('[name=open-on-client]').val())).add(-15, 'minutes');
        } else if (direction == 'down') {
            var nextTime = moment(Number($(document).find('[name=open-on-client]').val())).add(15, 'minutes');
            console.log(moment(nextTime).format("ddd, MMM Do, YYYY"));
        }
        //console.log(nextTime);
        //console.log(moment());
        if (!nextTime.isAfter(moment())) {
            //console.log(nextTime.isAfter(moment()));
            nextTime = moment(Number($(document).find('[name=open-on-client]').val())).add(30, 'minutes');
            
        }
        var scheduleHour = nextTime.format("h:mm A");
        var openOnClient = $(document).find('[name=open-on-client]');
        var scheduleDay = moment(nextTime).format("ddd, MMM Do, YYYY");
        openOnClient.val(nextTime.valueOf());
        var openOnServer = $(document).find('[name=open-on-server]');
        openOnServer.val(TimeSync.serverTime(nextTime));
        $(".schedule-hour").html(scheduleHour);
        $(".schedule-day").html(scheduleDay);
    }
});

Template.floorSubmit.rendered = function() {
    resetDateToToday();
    Session.set('currentDay', -1);
    if (Meteor.user()) {
        var floor = Floors.findOne({
            'userId': Meteor.userId(),
            $or:[{'floorStatus': 'Open'},{'floorStatus': 'ClosedToQuestions'}]
        });

        if (floor) {
            //console.log('go there...');
            Meteor.setTimeout(function() {
                Router.go('floorPage', {
                    _id: floor._id
                }, 1000);
            });
            return true;

        } else {
            return false;
        }
    }

};

Template.floorSubmit.helpers({
    host: function() {
        var user = Meteor.user();
        return user.profile.name;
    },
    hasOpenedFloor: function() {
        var floor = Floors.findOne({
            userId: Meteor.userId(),
            $or: [{
                floorStatus: 'Open'
            }, {
                floorStatus: 'ClosedToQuestions'
            }]
        });
        //console.log(floor);
        if (floor) {
            //I think we can remove this helper, since I am doing this check on the server side now
            // Meteor.setTimeout(function() {
            //     Router.go('floorPage', {
            //         _id: floor._id
            //     }, 0);
            // });
            return true;

        } else {
            return false;
        }
    },
    hasEmail: function() {
        var user = Meteor.user();
        if(!user) {
            return false;
        }
        if (typeof user.profile.email === 'undefined' || user.profile.email == null) {
            return false;
        } else if (user.profile.email.trim() == '') {
            return false;
        } else {
            //console.log('has email');
            return true;
        }
    },
    scheduleFloor: function() {

        //return Session.get('showFloorSettings');
    },
    renderDatePicker: function() {

        //console.log('render datepicker');
        //if(Session.get('showFloorSettings') == true) {
        //     Meteor.setTimeout(function() {$('.datetimepicker').datetimepicker();}, 10); 
        Meteor.setTimeout(function() {
            var currentDate = new Date(new Date().getTime());
            var futureDate = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000);
            var day = currentDate.getDate();
            var futureDay = futureDate.getDate();
            var month = currentDate.getMonth() + 1;
            var year = currentDate.getFullYear();
            var today = month + '/' + day + '/' + year;
            var tomorrow = month + '/' + futureDay + '/' + year;
            //console.log("date: " + tomorrow)


            $('.datetimepicker').datetimepicker({
                'sideBySide': true,
                'minuteStepping': 15,
                'minDate': today,
                'maxDate': tomorrow
            });
        }, 10);
        //}
    },
    userUpgraded: function() {
        Meteor.call('userSubscriptionStatus', Meteor.userId(), function(error, userSubscriptionStatus) {
            if (error) {
                Session.set('showFloorSettings', false);
                return 'Free';
            } else {
                if (userSubscriptionStatus == 'Gold') {
                    Session.set('showUpgradedFeatures', true);
                }
                else
                {
                    Session.set('showUpgradedFeatures', false);
                }
            }

        });
        return Session.get('showUpgradedFeatures');
    }
});

function isValidDate(value) {
    var dateWrapper = new Date(value);
    return !isNaN(dateWrapper.getDate());
}

function isValidNumber(value) {
    return !isNaN(value);
}

function getRoundedMinutes(date) {
    //console.log('getRoundedMinutes');
    date = moment(date);
    currentMin = date.format("m");
    currentMin = (Math.round(currentMin / 15) * 15);
    var m = new Date(date.valueOf()).setMinutes(currentMin);

    //console.log(m.format("h:mm A"));
    if(!moment(m).isAfter(moment()))
    {
        //console.log('in the past' + m);
        date = moment(m).add(15, 'minute');
        currentMin = date.format("m");
        currentMin = (Math.round(currentMin / 15) * 15);
        m = new Date(date.valueOf()).setMinutes(currentMin);
    }
    //console.log(m);
    return m;
}

function resetDateToToday() {
    //console.log('resetting date');
    var currentMin = moment().format("m");
    var currentHour = moment().format("h");
    currentMin = (Math.round(currentMin / 15) * 15);
    //console.log(currentMin);
    var m = new Date().setMinutes(currentMin);
    if(!moment(m).isAfter(moment()))
    {
        //console.log('in the past' + m);
        var date = moment(m).add(15, 'minute');

        currentMin = date.format("m");
        //currentMin = (Math.round(currentMin / 15) * 15);
        m = new Date().setMinutes(currentMin);
    }
    var clientTime = moment(m).valueOf();
    var serverTime = TimeSync.serverTime(clientTime);
    Meteor.setTimeout(function() {
        var openOnClient = $(document).find('[name=open-on-client]');
        openOnClient.val(clientTime);
        var openOnServer = $(document).find('[name=open-on-server]');
        openOnServer.val(serverTime);
    }, 10);
}
