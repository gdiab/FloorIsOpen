/* 
 * @Author: georgediab
 * @Date:   2014-05-25 23:06:33
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-03 22:08:43
 * @File: floor_item.js
 */
var FLOOR_HEIGHT = 148;
var Positions = new Meteor.Collection(null);


Template.floorItem.helpers({
    hostPic: function() {
        var user = Meteor.users.findOne({_id: this.userId});
        if(typeof user === 'undefined')
        {
            return;
        }
        else
        {
            return user.profile.picture;
        }
        
    },
    ownFloor: function() {
        return this.userId == Meteor.userId();
    },
    openFor: function () {
    	//var now = new Date().getTime();
		var now = TimeSync.serverTime();
    	if(typeof now === 'undefined')
        {
            now = new Date().getTime();
        }
    	if(this.floorStatus != "Closed"){
    		if (this.closed > now)
    		{
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

                if (days > 0) {
                    null
                } else if (hours > 0) {
                    return hours+'HR';
                } else {
                    return minutes + ':' + seconds;
                }
	    	} else {
                Session.set('closingSoon', false);
                Session.set('hasOpenFloor', false); 
				return '00:00'; 
     		}
    	}else {
            Session.set('closingSoon', false);
            Session.set('hasOpenFloor', false); 
            return '00:00'; 
     	}
    },
    upvotedClass: function() {
        var userId = Meteor.userId();
        if(this.userId != Meteor.userId())
        {
	        if (!_.include(this.upvoters, userId)) {
	            return 'upvotable';
	        } else {

	            return 'active removeVote';
	        }
    	} else {
    		return 'disabled';
    	}

    },
    isOpen: function() {
        switch (this.floorStatus) {
            case 'Open':
                Session.set('hasOpenFloor', true);
                if (this.userId == Meteor.userId() && !Session.get('justOpenedShown'))
                {
                    //console.log('openMessage');
                    Meteor.setTimeout(function() {
                        $("#openMessage").addClass('active');
                    },1000);
                    Session.set('justOpenedShown', true);
                }
                return true;

            case 'Closed':
                Session.set('justClosedToQuestionsShown', false);
                return false;

            case 'ClosedToQuestions':
                if (this.userId == Meteor.userId() && !Session.get('justClosedToQuestionsShown'))
                {
                    $("#closeMessage").addClass('active');
                    Session.set('justClosedToQuestionsShown', true);
                    Session.set('justOpenedShown', false)
                }
                return false;
        }

    },
    shortUrl: function() {
        return this.shortUrl;
    },
    shortUrlEncoded: function() {
        return encodeURIComponent(this.shortUrl);
    },
    attributes: function() {
        //console.log('fuck attributes');
        var floor = _.extend({}, Positions.findOne({
            floorId: this._id
        }), this);

        var newPosition = floor._rank * FLOOR_HEIGHT;
        var attributes = {};
        if (_.isUndefined(floor.position)) {
            attributes.class = 'invisible card flex-box';
        } else {
            var delta = floor.position - newPosition;
            attributes.style = "top: " + delta + "px";
            if (delta === 0)
                attributes.class = "animated bounceInUp card flex-box "
        }

        Meteor.setTimeout(function() {
            Positions.upsert({
                floorId: floor._id
            }, {
                $set: {
                    position: newPosition
                }
            })
        });
        return attributes;
    },
    floorStatusText: function() {
        switch (this.floorStatus) {
            case 'Open':
                return 'Open';

            case 'Closed':
                return 'Closed';

            case 'ClosedToQuestions':
                return 'Closed';

            case 'Scheduled':
                return 'Upcoming';
        }
    }
});

Template.floorItem.events({
    'click .floor-content': function(e) {
        e.preventDefault();
        Router.go('floorPage', {_id: this._id});
    },
    'click .shareable': function(e, template) {
    	e.preventDefault();
        $('.share').removeClass('active');
    	var shareDiv = template.find('.share');
		var shareIco = template.find('.shareable');
		$(shareDiv, shareIco).toggleClass('active');
    },
    'click .share.active': function(e, template) {
        $(e.target).removeClass('active');
    },
    'click .upvotable': function(e, template) {
        e.preventDefault();
		/* animation */
		if(!Meteor.user()){
			Session.set('loginRedirect', 'heartFloorRedirect:'+this._id);
			$('#loginMenu, #navopen').toggleClass("active");
		}else{
			var upvote     = template.find('.upvotable .fa-heart');
				pos        = $(upvote).offset();
				voteX      = pos.left;
				voteY      = pos.top;
				clonedVote = '<span class="fa fa-heart animated shake" style="position: absolute; z-index: 6200; top:'+voteY+'px; left: '+voteX+'px"></span>';
				$(clonedVote).appendTo("body").animate({
					top: (voteY-80),
					left: (voteX-20),
					fontSize: "80px", 
					opacity:0
				}, 500, "linear", function() { $(this).remove();
			});
       		Meteor.call('upvote', this._id);		
		}
    },
    'click .removeVote': function(e) {
    	e.preventDefault();
    	Meteor.call('removeVote', this._id);
    },
    'click .postToFacebook': function(e) {
        e.preventDefault();
        
        //console.log('posting to facebook');

        //REMOVED UNTIL FB APPROVES US
        // Meteor.call('postToFacebook', 
        //     'Im posting to my wall!',
        //     function(err, data) {
        //         if(!err) alert("Posted to facebook");
        // });

        FB.ui({
          method: 'share',
          href: Meteor.absoluteUrl() + 'floors/' + this._id,
        }, function(response){
            //console.log(response);
        });    
    }
});
