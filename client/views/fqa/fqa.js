/* 
* @Author: georgediab
* @Date:   2014-08-05 08:17:04
* @Last Modified by:   georgediab
* @Last Modified time: 2014-09-03 20:31:54
* @File: fqa.js
*/
 
 Template.fqaPage.events({
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
    },
    'click .shareable': function(e) {
        $(".share").removeClass("active");
        $(e.target).parents(".card").find(".share").addClass('active');
        return null;
    },
    'click .share.active': function(e) {
        $(e.target).removeClass('active');
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
            href: this.shortUrl,
        }, function(response) {
            //console.log(response);
        });
    },
    'click .upvotable-question': function(e, template) {
        e.preventDefault();
        if (!Meteor.user()) {
            console.log(this._id);
            Session.set('loginRedirect', 'heartQuestionRedirect:' + this._id);
            $('#loginMenu, #navopen').toggleClass("active");
        } else {
            $(e.currentTarget).addClass("active");
            pos = $(e.currentTarget).offset();
            voteX = pos.left;
            voteY = pos.top;
            clonedVote = '<span class="fa fa-heart animated shake" style="position: absolute; z-index: 6200; top:' + voteY + 'px; left: ' + voteX + 'px"></span>';
            $(clonedVote).appendTo("body").animate({
                top: (voteY),
                left: (voteX),
                fontSize: "80px",
                opacity: 0
            }, 500, "linear", function() {
                $(this).remove(); 
            });
            Meteor.call('upvoteQuestion', this._id);
        }
    },
    'click .upvotable-answer': function(e, template) {
        e.preventDefault();

        /* animation */
        if (!Meteor.user()) {
            Session.set('loginRedirect', 'heartAnswerRedirect:' + this._id);
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
            Meteor.call('upvoteAnswer', this._id);
        }
    },
    'click .remove-question-vote': function(e) {
        e.preventDefault();
        $(e.currentTarget).removeClass("active");
        Meteor.call('removeQuestionVote', this._id);
    },
    'click .remove-answer-vote': function(e) {
        e.preventDefault();
        $(e.currentTarget).removeClass("active");
        Meteor.call('removeAnswerVote', this._id);
    },
    'click .postFQAToFacebook': function(e, template) {
        e.preventDefault();
        //console.log('posting to facebook');
        //console.log(this);
        //REMOVED UNTIL FB APPROVES US
        // Meteor.call('postToFacebook', 
        //     'Im posting to my wall!',
        //     function(err, data) {
        //         if(!err) alert("Posted to facebook");
        // });
        //console.log(template.data._id);
        var answerText = ((typeof template.data.answerBody == 'undefined') ? '' : template.data.answerBody);
        FB.ui({
            method: 'share',
            href: Meteor.absoluteUrl() + 'fqa/' + template.data._id,
            description: answerText,
            title: template.data.body
        }, function(response) {
            //console.log(response);
        });
    }
 })

 Template.fqaPage.helpers({
    submittedText: function() {
        return new Date(this.submitted).toString();
    },
    bodyTextAbr: function() {
        var answerText = ((typeof this.rawAnswerBody == 'undefined') ? '' : this.rawAnswerBody);
        var combinesQandA = 'Q: ' + this.rawBody + ' A: ' + answerText;
        return combinesQandA.substring(0,100).toString()+'...';
    },
    fqaShareUrlEncoded: function() {
        return encodeURIComponent(Meteor.absoluteUrl() + 'fqa/' + this._id);
    },
    upvotedQuestionClass: function() {
        var userId = Meteor.userId();
        if (this.userId != Meteor.userId()) {
            if (!_.include(this.upvoters, userId)) {
                return ' upvotable-question';
            } else {
                return ' remove-question-vote';
            }
        } else {
            return 'disabled';
        }

    },
    upvotedAnswerClass: function() {
        var userId = Meteor.userId();
        var floor = Floors.findOne(this.floorId);
        if (floor.userId != Meteor.userId()) {
            if (!_.include(this.answerUpvoters, userId)) {
                return ' upvotable-answer';
            } else {
                return ' remove-answer-vote';
            }
        } else {
            return 'disabled';
        }

    },
    ownFloor: function() {
        //console.log(this);
        var floor = Floors.findOne(this.floorId);
        //console.log(floor.userId);
        if(typeof floor !== 'undefined')
            return floor.userId == Meteor.userId();
    },
    isOpen: function() {
        var floor = Floors.findOne(this.floorId);
        switch (floor.floorStatus) {
            case 'Open':
                return true;

            case 'ClosedToQuestions':
                return true;
                
            case 'Closed':
                return false;
        }

    },
    profilePic: function() {
        var user = Meteor.users.findOne({_id: this.answerUserId});
        //console.log(this.answerUserId);
        return user.profile.picture;
    },
    floorHostPic: function() {
        //console.log(this);
        var user = Meteor.users.findOne(this.userId);
        //console.log(user);
        return user.profile.picture;
    },
    hostPic: function() {
        console.log(this);
        var user = Meteor.users.findOne({_id: this.userId});
        //console.log(user);
        return user.profile.picture;
    },
    submittedText: function() {
        return moment(this.submitted).fromNow();
    },
    answerSubmittedText: function() {
        return moment(this.answerSubmitted).fromNow();
    },
    floor: function() {
        //console.log(this.floorId);

        return Floors.findOne({
            _id: this.floorId
        });
    },
    ownFloor: function() {
        //var floor = Floors.findOne(this._id);
        if(typeof Meteor.userId() !== 'undefined')
            return this.userId == Meteor.userId();
    },
    canEdit: function() {
        var now = TimeSync.serverTime();

        seconds = Math.floor((now - this.opened) / 1000);
        minutes = Math.floor(seconds / 60);

        if (minutes > 2) return false;
        return true;
    },
    closingSoon: function() {
        return Session.get('closingSoon');
    },
    openFor: function() {
        var now = TimeSync.serverTime();
        switch (this.floorStatus) {
            case 'Open':
                if (this.closed > now) {
                    seconds = Math.floor((this.closed - now) / 1000);
                    minutes = Math.floor(seconds / 60);
                    if (minutes < 2) {
                        Session.set('closingSoon', true);
                    } else {
                        Session.set('closingSoon', false);
                    }
                    seconds = seconds % 60;
                    if (minutes.toString().length == 1) minutes = '0' + minutes;
                    if (seconds.toString().length == 1) seconds = '0' + seconds;
                    return minutes + ':' + seconds;
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
                if (this.closedToQuestions > now) {
                    seconds = Math.floor((this.closedToQuestions - now) / 1000);
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
    }
});
