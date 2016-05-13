/* 
 * @Author: georgediab
 * @Date:   2014-06-08 20:02:53
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-03 22:02:07
 * @File: question.js
 */

Template.question.helpers({
    submittedText: function() {
        return new Date(this.submitted).toString();
    },
    bodyTextAbr: function() {
        return this.body.replace(/#|\/*/, '').substring(0,100).toString()+'...';
    },
    answerShow: function() {
        return Session.get('answerShow');
    },
    upvotedQuestionClass: function() {
        var userId = Meteor.userId();
        if (this.userId != Meteor.userId()) {
            if (!_.include(this.upvoters, userId)) {
                return 'upvotable-question';
            } else {
                return 'active remove-question-vote';
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
                return 'upvotable-answer';
            } else {
                return 'active remove-answer-vote';
            }
        } else {
            return 'disabled';
        }

    },
    ownFloor: function() {
        var floor = Floors.findOne(this.floorId);
        //console.log(floor.userId);
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
    isEvent: function() {
        var floor = Floors.findOne(this.floorId);
        if (typeof floor.eventCode !== 'undefined' && floor.floorStatus != "Closed") {
            return true;
        } else {
            return false;
        }
    },
    profilePic: function() {
        var user = Meteor.users.findOne({_id: this.answerUserId});
        if(typeof user.profile === 'undefined')
            return null;
        
        return user.profile.picture;
    },
    profileId: function() {
        var user = Meteor.users.findOne({_id: this.answerUserId});
        if(typeof user.profile === 'undefined')
            return null;
        //console.log(user._id);
        return user._id;
    },
    authorPic: function() {
        var user = Meteor.users.findOne({_id: this.userId});
        //console.log(user);
        if(typeof user === 'undefined')
        {
            if(typeof this.authorPicture === 'undefined'){
                return null;
            }
            else
            {
                //console.log('go to question for picture');
                return this.authorPicture;
            }
        }
        
        return user.profile.picture;
    },
    authorId: function() {
        var user = Meteor.users.findOne({_id: this.userId});
        if(typeof user !== 'undefined')
        {
            return user._id;
        }
        else
        {
            return this.authorId
        }
    },
    submittedText: function() {
        return moment(this.submitted).fromNow();
    },
    answerSubmittedText: function() {
        return moment(this.answerSubmitted).fromNow();
    },
    fqaShareUrl: function() {
        return Meteor.absoluteUrl() + 'fqa/' + this._id;
    },
    fqaShareUrlEncoded: function() {
        return encodeURIComponent(Meteor.absoluteUrl() + 'fqa/' + this._id);
    },
    authorText: function() {
        var questionAuthorName = this.author.split(' ');
        var initial = ((typeof questionAuthorName[1] === 'undefined') ? '' : questionAuthorName[1].charAt(0) + '.');
        return questionAuthorName[0] + ' ' + initial.toUpperCase();
    },
    answerAuthorText: function() {
        var answerAuthorName = this.answerAuthor.split(' ');
        var initial = ((typeof answerAuthorName[1] === 'undefined') ? '' : answerAuthorName[1].charAt(0) + '.');
        return answerAuthorName[0] + ' ' + initial.toUpperCase();    
    }
});

Template.question.events({
    'click .upvotable-question': function(e, template) {
        e.preventDefault();
        if (!Meteor.user()) {
            //console.log(this._id);
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
    'click .answerQuestion': function(e, template) {
        //$(e.target).hide();
        //$('.theanswer').hide();
        Session.set('answeringQuestion', template.data._id);
        
    },
    'click .flag-question': function() {
        if(confirm("You can't undo this. Are you sure?")) {
            Meteor.call('flagQuestion', this, function(error, result) {
                if (error) {
                    Errors.
                    throw (error.reason);
                } else {
                    GAnalytics.event("question","flagged","questionId: " + this._id  );
                    Alerts.insert({
                           title: "Success",
                           message: 'The question has been flagged.',
                           userId: Meteor.userId(),
                           seen: false,
                           alertType: 'alert'
                    });
                    TimeSync.resync();
                }

            });
        }
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
});

