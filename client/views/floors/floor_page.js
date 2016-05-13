/* 
 * @Author: georgediab
 * @Date:   2014-07-24 23:15:42
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-03 22:09:27
 * @File: floor_page.js
 */

Session.setDefault('closingSoon', false);
Session.setDefault('justOpenedShown', false);
Session.setDefault('justClosedToQuestionsShown', false);
Session.setDefault('questionPaging', 10);
Session.setDefault('profileBoxId', 0);
Session.setDefault('answeringQuestion', '');
Session.setDefault('answerShow', '');
var ITEMS_INCREMENT = 5;

// whenever #showMoreResults becomes visible, retrieve more results
function showMoreVisible() {
    Session.set("questionPaging",
        Session.get("questionPaging") + ITEMS_INCREMENT);
}

Template.floorPage.rendered = function() {
    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    if (!mobile) {
        Session.set("questionPaging",
            30);
    }
}

Template.profileBox.helpers({
    bio: function() {
        var userId = Session.get('profileBoxId');
        if (userId != 0) {
            var user = Meteor.users.findOne({
                _id: userId
            });
            if (typeof(user) != "undefined" && user.profile !== null) {
                return user.profile.bio;
            }
        }
    },
    image: function() {
        var userId = Session.get('profileBoxId');
        if (userId != 0) {
            var user = Meteor.users.findOne({
                _id: userId
            });
            if (typeof(user) != "undefined" && user.profile !== null) {
                //console.log(user.profile.registeredWith);
                if(user.profile.registeredWith == 'facebook') {
                    return 'https://graph.facebook.com/' + user.profile.facebookId + '/picture?width=200&height=200';
                }
                else if(user.profile.registeredWith == 'twitter') {
                    //http://pbs.twimg.com/profile_images/2284174872/7df3h38zabcvjylnyfe3.png
                    return user.profile.picture.replace('_normal','');
                }
                
                return user.profile.picture;
            }
        }
    },
    name: function() {

        var userId = Session.get('profileBoxId');
        if (userId != 0) {
            var user = Meteor.users.findOne({
                _id: userId
            });
            if (typeof(user) != "undefined" && user.profile !== null)
                return user.profile.name;
        }
    }
});

Template.floorPage.helpers({
    canEdit: function() {
        var now = TimeSync.serverTime();

        seconds = Math.floor((now - this.opened) / 1000);
        minutes = Math.floor(seconds / 60);
        if (this.floorStatus == "Scheduled") return true;
        if (minutes > 2) return false;
        return true;
    },
    closingSoon: function() {
        return Session.get('closingSoon');
    },
    isAnswering: function() {
        return Session.get('answeringQuestion') != '';
    },
    isScheduled: function() {
        return (this.active == false && this.floorStatus == 'Scheduled')
    },
    moreResults: function() {
        return !(Questions.find().count() < Session.get("questionPaging"));
    },
    questions: function() {
        if (this.userId == Meteor.userId()) {
            return Questions.find({
                floorId: this._id
            }, {
                sort: {
                    answerSubmitted: 1,
                    votes: -1,
                    submitted: 1

                },
                limit: Session.get('questionPaging')
            });
        } else {
            return Questions.find({
                floorId: this._id
            }, {
                sort: {
                    modified: -1,
                    answerSubmitted: 1,
                    submitted: -1
                },
                limit: Session.get('questionPaging')
            });
        }

    },
    ownFloor: function() {
        var floor = Floors.findOne(this._id);
        if (floor && typeof floor.eventCode !== 'undefined') {
            Session.set('eventFloorId', floor._id);;
        }
        else
        {
            Session.set('eventFloorId', '');
        }
        return this.userId == Meteor.userId();
    },
    scheduledText: function() {
        var now = TimeSync.serverTime();
        var willOpenOn = moment(new Date(this.openOn).toString()).format('dddd, MMM Do YYYY, h:mm A');
        return willOpenOn;
    },
    openFor: function() {
        var now = TimeSync.serverTime();
        if (typeof now === 'undefined') {
            now = new Date().getTime();
        }
        switch (this.floorStatus) {
            case 'Open':
                if (this.closedToQuestions > now) {
                    // seconds = Math.floor((this.closed - now) / 1000);
                    // minutes = Math.floor(seconds / 60);
                    // if (minutes < 2) {
                    //     Session.set('closingSoon', true);
                    // } else {
                    //     Session.set('closingSoon', false);
                    // }
                    // seconds = seconds % 60;
                    // if (minutes.toString().length == 1) minutes = '0' + minutes;
                    // if (seconds.toString().length == 1) seconds = '0' + seconds;
                    // return minutes + ':' + seconds;
                    seconds = Math.floor((this.closedToQuestions - now) / 1000);
                    minutes = Math.floor(seconds / 60);
                    hours = Math.floor(minutes / 60);
                    days = Math.floor(hours / 24);
                    seconds = seconds % 60;
                    minutes = minutes % 60;
                    hours = hours % 24;

                    if (days.toString().length == 1) days = '0' + days;
                    if (hours.toString().length == 1) hours = '' + hours;
                    if (minutes.toString().length == 1) minutes = '0' + minutes;
                    if (seconds.toString().length == 1) seconds = '0' + seconds;
                    if (minutes < 2) {
                        Session.set('closingSoon', true);
                    } else {
                        Session.set('closingSoon', false);
                    }
                    if (days > 0) {
                        //return days+' days';
                        null
                    } else if (hours > 0) {
                        return hours+'HR';
                    } else {
                        return minutes + ':' + seconds;
                    }
                } else {
                    Session.set('closingSoon', false);
                    if (this.userId == Meteor.userId()) {
                        Floors.update(this._id, {
                            $set: {
                                floorStatus: 'ClosedToQuestions'
                            }
                        });
                    }

                    return '00:00';
                }
                break;

            case 'Closed':
                Session.set('closingSoon', false);
                return '00:00';
                break;

            case 'ClosedToQuestions':
                Session.set('closingSoon', false);

                if (this.closed > now) {
                    seconds = Math.floor((this.closed - now) / 1000);
                    minutes = Math.floor(seconds / 60);
                    seconds = seconds % 60;
                    if (minutes.toString().length == 1) minutes = '0' + minutes;
                    if (seconds.toString().length == 1) seconds = '0' + seconds;
                    return minutes + ':' + seconds;
                } else {
                    Session.set('closingSoon', false);
                    if (this.userId == Meteor.userId()) {
                        Floors.update(this._id, {
                            $set: {
                                floorStatus: 'Closed'
                            }
                        });
                    }
                    return '00:00';
                }
                break;

            case 'Scheduled':
                if (this.openOn > now) {
                    seconds = Math.floor((this.closedToQuestions - now) / 1000);
                    minutes = Math.floor(seconds / 60);
                    hours = Math.floor(minutes / 60);
                    days = Math.floor(hours / 24);
                    seconds = seconds % 60;
                    minutes = minutes % 60;
                    hours = hours % 24;

                    if (days.toString().length == 1) days = '0' + days;
                    if (hours.toString().length == 1) hours = '0' + hours;
                    if (minutes.toString().length == 1) minutes = '0' + minutes;
                    if (seconds.toString().length == 1) seconds = '0' + seconds;

                    if (days > 0) {
                        //return days+' days';
                        null
                    } else if (hours > 0) {
                        //return hours+' hours';
                    } else {
                        return minutes + ':' + seconds;
                    }
                    //return days + ':' + hours + ':' + minutes + ':' + seconds;
                } else {
                    if (this.userId == Meteor.userId()) {
                        Floors.update(this._id, {
                            $set: {
                                floorStatus: 'Open'
                            }
                        });
                    }

                    return '00:00';
                }
                break;

        }
    },
    followedClass: function() {
        var userId = Meteor.userId();
        if (this.userId != Meteor.userId()) {
            if (!_.include(this.subscribers, userId)) {
                return 'subscribable';
            } else {

                return 'active removeSubscription';
            }
        } else {
            return 'disabled';
        }

    },
    followText: function() {
        var userId = Meteor.userId();
        if (this.userId != Meteor.userId()) {
            if (!_.include(this.subscribers, userId)) {
                return 'Subscribe';
            } else {

                return 'Unsubscribe';
            }
        } else {
            return 'disabled';
        }

    },
    upvotedClass: function() {
        var userId = Meteor.userId();
        if (this.userId != Meteor.userId()) {
            if (!_.include(this.upvoters, userId)) {
                return 'upvotable';
            } else {

                return 'active removeVote';
            }
        } else {
            return 'disabled';
        }

    },
    hostPic: function() {
        if (this.userId) {
            var user = Meteor.users.findOne({
                _id: this.userId
            });
            return user.profile.picture;
        }
    },
    host: function() {
        if (this.userId) {
            var user = Meteor.users.findOne({
                _id: this.userId
            });
            return user.profile.name;
        }
    },
    isOpen: function() {
        switch (this.floorStatus) {
            case 'Open':
                Session.set('hasOpenFloor', true);
                if (this.userId == Meteor.userId() && !Session.get('justOpenedShown')) {
                    var now = TimeSync.serverTime();
                    if (typeof now === 'undefined') {
                        now = new Date().getTime();
                    }
                    seconds = Math.floor((this.closedToQuestions - now) / 1000);
                    var minutes = Math.floor(seconds / 60);
                    if (minutes > 14) {

                        Meteor.setTimeout(function() {
                            $("#openMessage").addClass('active');
                        }, 1000);
                    }
                    Session.set('justOpenedShown', true);
                }
                return true;

            case 'Closed':
                Session.set('justClosedToQuestionsShown', false);
                return false;

            case 'ClosedToQuestions':
                if (this.userId == Meteor.userId() && !Session.get('justClosedToQuestionsShown')) {
                    $("#closeMessage").addClass('active');
                    Session.set('justClosedToQuestionsShown', true);
                    Session.set('justOpenedShown', false)
                }
                return false;
        }

    },
    bitly: function() {
        return this.shortUrl;
    },
    shortUrl: function() {
        return this.shortUrl;
    },
    shortUrlEncoded: function() {
        return encodeURIComponent(this.shortUrl);
    },
    floorStatusText: function() {
        switch (this.floorStatus) {
            case 'Open':
                return 'Open';

            case 'Closed':
                return 'Closed';

            case 'ClosedToQuestions':
                return 'Closed';
        }
    },
    hasEmail: function() {
        var user = Meteor.user();
        //console.log(user);
        if (!user)
            return true;
        if (typeof user.profile.email === 'undefined' || user.profile.email == null) {
            return false;
        } else if (user.profile.email.trim() == '') {
            return false;
        } else {
            return true;
        }
    },
    hostText: function() {
        if (typeof this.host !== 'undefined') {
            var hostName = this.host.split(' ');
            for (var i = hostName.length - 1; i--;) {
                if (hostName[i] === "") hostName.splice(i, 1);
            }

            var initial = ((typeof hostName[1] === 'undefined') ? '' : hostName[1].charAt(0) + '.');
            return hostName[0] + ' ' + initial;
        }

    },
    isEvent: function() {
        if (typeof this.eventCode !== 'undefined' && this.floorStatus != "Closed") {
            Session.set('isEventFloor', true);
            return true;
        } else {
            Session.set('isEventFloor', false);
            return false;
        }

    },
    requireLogin: function() {
        if (Meteor.user()) {
            return false;
        }
        if (typeof this.requireLogin !== 'undefined') {
            return this.requireLogin;
        } else {
            return false;
        }
    },
    requireOptIn: function() {
        var userId = Meteor.userId();
        //console.log('require Opt-in');
        //console.log(userId);
        if (this.requireOptIn && userId != null) {
            if (this.userId != Meteor.userId()) {
                if (!_.include(this.optedIn, userId)) {
                    return true;
                }
                return false;
            }
            else {
                //floor owner gets access
                return false;
            } 
            if (typeof this.requireOptIn !== 'undefined') {
                return this.requireOptIn;
            } else {
                return false;
            }
        } else {
            //console.log('here send false');
            return false;
        }

    }
});

Template.floorPage.events({
    'click .add-time': function(e, template) {
        e.preventDefault();
        var minutes = 5;
        switch (this.floorStatus) {
            case 'Open':
                s = Math.floor((this.closedToQuestions - this.opened) / 1000);
                m = Math.floor(s / 60);

                if (m + minutes > 30) {
                    Errors.throw("You cannot keep the floor open longer than 30 minutes!");
                    return;
                }

                Meteor.call('addTime', this._id, minutes, function(err, result) {
                    if (err) {
                        Errors.throw(err.reason);
                    } else {
                        var icon = template.find('.fa-plus-square');
                        pos = $(icon).offset();
                        iX = pos.left + 5;
                        iY = pos.top + 10;
                        clonedVote = '<span class="fa fa-plus-square" style="position: absolute; color: #FFF; z-index: 6200; top:' + iY + 'px; left: ' + iX + 'px"></span>';
                        $(clonedVote).appendTo("body").animate({
                            top: (iY - 60),
                            left: (iX - 10),
                            fontSize: "80px",
                            opacity: 0
                        }, 500, "linear", function() {
                            $(this).remove();
                        });
                    }
                });
                break;

            case 'ClosedToQuestions':
                s = Math.floor((this.closedToQuestions - this.closed) / 1000);
                m = Math.floor(s / 60);
                if (m + minutes > 10) {
                    Errors.throw("You cannot keep the floor open longer than 10 minutes after it's closed!");
                    return;
                }

                Meteor.call('addTimeToAnswerRemainingQuestions', this._id, minutes, function(err, result) {
                    if (err) {
                        Errors.throw(err.reason);
                    } else {
                        if (result == 'Success') {
                            var icon = template.find('.fa-plus-square');
                            pos = $(icon).offset();
                            iX = pos.left + 5;
                            iY = pos.top + 10;
                            clonedVote = '<span class="fa fa-plus-square" style="position: absolute; color: #FFF; z-index: 6200; top:' + iY + 'px; left: ' + iX + 'px"></span>';
                            $(clonedVote).appendTo("body").animate({
                                top: (iY - 60),
                                left: (iX - 10),
                                fontSize: "80px",
                                opacity: 0
                            }, 500, "linear", function() {
                                $(this).remove();
                            });
                        }

                    }
                });
                break;
        }

    },
    'click .ask-question': function(e) {
        e.preventDefault();
        if (!Meteor.user()) {
            Session.set('loginRedirect', 'askQuestion');
            $('#navopen').removeClass("active");
            $('#loginMenu').addClass("active")
        } else {
            $(".ask-question-form").show();
            $(".ask-question-form textarea").focus();
            $(".ask-question").hide();
        }
    },
    'click .showMoreResults': function() {
        showMoreVisible();
    },
    'click .hide-answer-button': function(e){
        var currentState = Session.get('answerShow');
        if(currentState == ''){
            Session.set('answerShow', 'noshow');
            $(e.currentTarget).removeClass('fa-eye').addClass('fa-eye-slash');
        }else{
            Session.set('answerShow', '');
            $(e.currentTarget).removeClass('fa-eye-slash').addClass('fa-eye');
        }
    },
    'click .ask-cancel': function(e) {
        e.preventDefault();
        $(".ask-question-form, .ask-question").toggle();
    },
    'click .login': function() {
        if (!Meteor.user()) {
            Session.set('loginRedirect', 'floorRedirect');
            $('#navopen').removeClass("active");
            $('#loginMenu').addClass("active");
        }
    },
    'click .opt-in': function(e) {
        if (Meteor.user()) {
            console.log('user is good');
            Meteor.call('optedIn', this._id);
        }
        else
        {
            Session.set('loginRedirect', 'floorRedirect');
            $('#navopen').removeClass("active");
            $('#loginMenu').addClass("active")
        }
    },
    'click .questions .profile img': function(e) {
        // var profileId = $(e.currentTarget).data("id");
        // Session.set('profileBoxId', profileId);
        // $("#profileBox").addClass("active");
    },
    'click .close-log': function() {
        Session.set('profileBoxId', 0);
        $(".messageWindow").removeClass("active");
    },
    'click .shareable': function(e) {
        $(".share").removeClass("active");
        $(e.target).parents(".card").find(".share").addClass('active');
        return null;
    },
    'click .share.active': function(e) {
        $(e.target).removeClass('active');
    },
    'click .subscribable': function(e) {
        e.preventDefault();
        if (!Meteor.user()) {
            Session.set('loginRedirect', 'subscribeFloor:' + this._id);
            $('#navopen').removeClass("active");
            $('#loginMenu').addClass("active")
        } else {
            Meteor.call('subscribe', this._id);
        }


    },
    'click .removeSubscription': function(e) {
        e.preventDefault();
        Meteor.call('unsubscribe', this._id);
    },
    'click .removeVote': function(e) {
        e.preventDefault();
        Meteor.call('removeVote', this._id);
    },
    'click .postToFacebook': function(e) {
        e.preventDefault();
        //console.log('posting to facebook');
        //console.log(this);
        //REMOVED UNTIL FB APPROVES US
        // Meteor.call('postToFacebook', 
        //     'Im posting to my wall!',
        //     function(err, data) {
        //         if(!err) alert("Posted to facebook");
        // });
        //console.log(this.shortUrl);
        FB.ui({
            method: 'share',
            app_id: getFBAppId(),
            href: this.shortUrl,
        }, function(response) {
            //console.log(response);
        });
    },
    'click .upvotable': function(e, template) {
        e.preventDefault();
        /* animation */
        if (!Meteor.user()) {
            Session.set('loginRedirect', 'heartFloorRedirect:' + this._id);
            $('#loginMenu, #navopen').toggleClass("active");
        } else {
            var upvote = e.target;
            $(e.target).addClass("active");
            pos = $(upvote).offset();
            voteX = pos.left;
            voteY = pos.top;
            clonedVote = '<span class="fa fa-heart animated shake" style="position: absolute; z-index: 6200; top:' + voteY + 'px; left: ' + voteX + 'px"></span>';
            $(clonedVote).appendTo("body").animate({
                top: (voteY - 80),
                left: (voteX - 20),
                fontSize: "80px",
                opacity: 0
            }, 500, "linear", function() {
                $(this).remove();
            });
            Meteor.call('upvote', this._id);
        }
    }
});

Template.answerBox.events({
    'submit form': function(e, template) {
        e.preventDefault();
        $questionId = $(e.target).find('[name=questionId]');
        $floorId = $(e.target).find('[name=floorId]');
        $body = $(e.target).find('[name=body]');
        var $rawBody = $body.val();
        var words = $body.val().split(' ');
        words = words.filter(function(x) {
            return x.length > 30
        });

        $.each(words, function(index, value) {
            $body.val($body.val().replace(value, '<span>' + value + '</span>'));
        });

        var question = {
            questionId: $questionId.val(), // Session.get('answeringQuestion'),
            answerBody: $body.val().linkify(),
            rawAnswerBody: $rawBody,
            floorId: this._id,
            votes: 0
        };

        Meteor.call('answer', question, function(error, questionId) {
            if (error) {
                Errors.
                throw(error.reason);
            } else {
                GAnalytics.event("question", "answered", "floorId: " + this._id);
                $body.val('');
                Session.set('answeringQuestion', '');
            }

        });
    },
    'click .cancel': function(e, template) {
        Session.set('answeringQuestion', '');
        /*$('.theanswer').hide();
        $('.answerQuestion').show();     */
        return null;

    },
    'click .flag-question': function() {
        if (confirm("You can't undo this. Are you sure?")) {

            var q = Questions.findOne(Session.get('answeringQuestion'));
            Meteor.call('flagQuestion', q, function(error, result) {
                if (error) {
                    Errors.
                    throw(error.reason);
                } else {
                    GAnalytics.event("question", "flagged", "questionId: " + q._id);
                    Alerts.insert({
                        title: "Success",
                        message: 'The question has been flagged.',
                        userId: Meteor.userId(),
                        seen: false,
                        alertType: 'alert'
                    });
                    TimeSync.resync();
                    Session.set('answeringQuestion', '');
                }

            });
        }
    }
});

Template.answerBox.helpers({
    openFor: function() {
        var now = TimeSync.serverTime();
        if (typeof now === 'undefined') {
            now = new Date().getTime();
        }
        switch (this.floorStatus) {
            case 'Open':
                if (this.closedToQuestions > now) {
                    // seconds = Math.floor((this.closed - now) / 1000);
                    // minutes = Math.floor(seconds / 60);
                    // if (minutes < 2) {
                    //     Session.set('closingSoon', true);
                    // } else {
                    //     Session.set('closingSoon', false);
                    // }
                    // seconds = seconds % 60;
                    // if (minutes.toString().length == 1) minutes = '0' + minutes;
                    // if (seconds.toString().length == 1) seconds = '0' + seconds;
                    // return minutes + ':' + seconds;
                    seconds = Math.floor((this.closedToQuestions - now) / 1000);
                    minutes = Math.floor(seconds / 60);
                    hours = Math.floor(minutes / 60);
                    days = Math.floor(hours / 24);
                    seconds = seconds % 60;
                    minutes = minutes % 60;
                    hours = hours % 24;

                    if (days.toString().length == 1) days = '0' + days;
                    if (hours.toString().length == 1) hours = '' + hours;
                    if (minutes.toString().length == 1) minutes = '0' + minutes;
                    if (seconds.toString().length == 1) seconds = '0' + seconds;
                    if (minutes < 2) {
                        Session.set('closingSoon', true);
                    } else {
                        Session.set('closingSoon', false);
                    }
                    if (days > 0) {
                        //return days+' days';
                        null
                    } else if (hours > 0) {
                        return hours+'HR';
                    } else {
                        return minutes + ':' + seconds;
                    }
                } else {
                    Session.set('closingSoon', false);
                    if (this.userId == Meteor.userId()) {
                        Floors.update(this._id, {
                            $set: {
                                floorStatus: 'ClosedToQuestions'
                            }
                        });
                    }

                    return '00:00';
                }
                break;

            case 'Closed':
                Session.set('closingSoon', false);
                return '00:00';
                break;

            case 'ClosedToQuestions':
                Session.set('closingSoon', false);

                if (this.closed > now) {
                    seconds = Math.floor((this.closed - now) / 1000);
                    minutes = Math.floor(seconds / 60);
                    seconds = seconds % 60;
                    if (minutes.toString().length == 1) minutes = '0' + minutes;
                    if (seconds.toString().length == 1) seconds = '0' + seconds;
                    return minutes + ':' + seconds;
                } else {
                    Session.set('closingSoon', false);
                    if (this.userId == Meteor.userId()) {
                        Floors.update(this._id, {
                            $set: {
                                floorStatus: 'Closed'
                            }
                        });
                    }
                    return '00:00';
                }
                break;

            case 'Scheduled':
                if (this.openOn > now) {
                    seconds = Math.floor((this.closedToQuestions - now) / 1000);
                    minutes = Math.floor(seconds / 60);
                    hours = Math.floor(minutes / 60);
                    days = Math.floor(hours / 24);
                    seconds = seconds % 60;
                    minutes = minutes % 60;
                    hours = hours % 24;

                    if (days.toString().length == 1) days = '0' + days;
                    if (hours.toString().length == 1) hours = '0' + hours;
                    if (minutes.toString().length == 1) minutes = '0' + minutes;
                    if (seconds.toString().length == 1) seconds = '0' + seconds;

                    if (days > 0) {
                        //return days+' days';
                        null
                    } else if (hours > 0) {
                        //return hours+' hours';
                    } else {
                        return minutes + ':' + seconds;
                    }
                    //return days + ':' + hours + ':' + minutes + ':' + seconds;
                } else {
                    if (this.userId == Meteor.userId()) {
                        Floors.update(this._id, {
                            $set: {
                                floorStatus: 'Open'
                            }
                        });
                    }

                    return '00:00';
                }
                break;

        }
    },
    questionBody: function() {
        var question = Questions.findOne(Session.get('answeringQuestion'));
        PNotify.desktop.permission();
        return ((typeof question === 'undefined') ? '' : question.body);
    },
    questionId: function() {
        return Session.get('answeringQuestion');
    }
});
