/* 
 * @Author: georgediab
 * @Date:   2014-05-28 18:36:54
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-03 22:13:43
 * @File: floors.js
 */


Floors = new Meteor.Collection('floors');

Floors.allow({
    update: ownsDocument,
    remove: ownsDocument
});

Floors.allow({
    update: function(floorId, fieldNames) {
        if (floorId == undefined) {
            return true; //not updating floor status
        }
        if ((_.has(fieldNames, 'userId') || _.has(fieldNames, 'title')) && _.has(fieldNames, 'floorStatus')) {

            return false;
        }
        return (_.has(fieldNames, 'floorStatus'))
    }
});

Floors.deny({
    update: function(userId, floor, fieldNames) {
        //may only edit the following fields
        if (_.without(fieldNames, 'title', 'floorStatus', 'description').length > 0) {
            return true;
        } else {
            return false;
        }
    }
});

Meteor.methods({
    floor: function(floorAttributes) {
        var user = Meteor.user(),
            floorWithSameLink = Floors.findOne({
                url: floorAttributes.url
            }),
            openedFloors = Floors.findOne({
                'userId': Meteor.userId(),
                'floorStatus': 'Open'
            });

        //ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to Open the Floor");

        if (!floorAttributes.title)
            throw new Meteor.Error(422, 'Please describe your Floor');

        //ensure the floor has a title
        if (floorAttributes.url && floorWithSameLink) {
            throw new Meteor.Error(302,
                'This floor has already been opened',
                floorWithSameLink._id);
        }

        if (openedFloors) {
            throw new Meteor.Error(305,
                'You already have an open floor!',
                openedFloors._id);
        }

        if (!this.isSimulation) {
            if (floorAttributes.openDuration != 15) {
                //var user = Meteor.user();
                if (((typeof user.userSubscriptionStatus == 'undefined') ? 'Free' : user.userSubscriptionStatus) == 'Free') {
                    throw new Meteor.Error(303,
                        'You need to upgrade your account to do this.');
                }
            }

            if (floorAttributes.cooldown != 5) {
                //var user = Meteor.user();
                //console.log(((typeof user.userSubscriptionStatus == 'undefined') ? 'Free' : user.userSubscriptionStatus));
                if (((typeof user.userSubscriptionStatus == 'undefined') ? 'Free' : user.userSubscriptionStatus) == 'Free') {
                    throw new Meteor.Error(304,
                        'You need to upgrade your account to do this.');
                }
            }

            if (typeof floorAttributes.eventCode !== 'undefined') {
                if (((typeof user.userSubscriptionStatus == 'undefined') ? 'Free' : user.userSubscriptionStatus) == 'Free') {
                    throw new Meteor.Error(306,
                        'You need to upgrade your account to do this.');
                }
            }
        }
        var opened = null;
        var floorStatus = "Scheduled";

        var now = new Date().getTime();
        var openOn = (typeof floorAttributes.openOn == 'undefined') ? new Date().getTime() : new Date(floorAttributes.openOn).getTime();
        if (typeof floorAttributes.openOn === 'undefined') {
            opened = now;
            floorStatus = "Open";
        }

        var floorNumber = (typeof user.profile.floorsOpened === 'undefined') ? 1 : user.profile.floorsOpened + 1;
        //pick out the whitelisted keys
        var floor = _.extend(_.pick(floorAttributes, 'title', 'description', 'rawTitle', 'rawDescription', 'active', 'cooldown', 'private'), {
            userId: user._id,
            host: floorAttributes.host,
            submitted: new Date().getTime(),
            opened: opened, //this should be set when user wants floor to go live?
            openOn: openOn,
            createdAt: now,
            commentsCount: 0,
            floorStatus: floorStatus,
            upvoters: [],
            openDuration: floorAttributes.openDuration,
            closed: openOn + (floorAttributes.openDuration * 60 * 1000) + (floorAttributes.cooldown * 60 * 1000),
            closedToQuestions: openOn + (floorAttributes.openDuration * 60 * 1000),
            votes: 0,
            hostUsername: user.profile.username,
            floorNumber: floorNumber,
            usersNotified: false
        });

        if (!this.isSimulation) {
            floor.title = sanitizeHtml(floor.title, {
                allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span'],
                allowedAttributes: {
                    'a': ['href', 'target']
                }
            });
            floor.description = sanitizeHtml(floor.description, {
                allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span'],
                allowedAttributes: {
                    'a': ['href', 'target']
                }
            });
        }

        var floorId = Floors.insert(floor);
        // shorten link URL
        if (!this.isSimulation && floorId) {
            var shortUrl;
            var url;
            url = Meteor.absoluteUrl() + 'floors/' + floorId;
            try {
                shortUrl = Bitly.shortenURL(url);
            } catch (err) {
                console.log('Bitly error!');
                shortUrl = url;
            }
            if (typeof shortUrl === 'undefined') {
                shortUrl = url;
            }
            Floors.update(floorId, {
                $set: {
                    shortUrl: shortUrl,
                    url: url
                }
            }, function(error) {
                if (error) {
                    //display error to user
                    Errors.throw(error.reason);

                }

            });
            //if not localhost, post to slack
            if (Meteor.openFloorFunctions.url_domain(Meteor.absoluteUrl()) != 'localhost:3000') {
                var slackMessage;
                if(floorAttributes.active == false)
                {
                    slackMessage = floorAttributes.host + ' just scheduled a floor. ( ' + shortUrl + ' )'
                }
                else
                {
                    slackMessage = floorAttributes.host + ' just opened the floor. ( ' + shortUrl + ' )';
                }
                slack.send({
                    channel: '#openfloor',
                    unfurl_links: 1,
                    text: slackMessage,
                    username: '[FloorOpen] - OpenFloor App'
                });
            }

            var additionalFloorAttributes = {};
            if (typeof floorAttributes.requireLogin !== 'undefined') {
                additionalFloorAttributes['requireLogin'] = floorAttributes.requireLogin;
            }

            if (typeof floorAttributes.requireOptIn !== 'undefined') {
                additionalFloorAttributes['requireOptIn'] = floorAttributes.requireOptIn;
                if(floorAttributes.requireOptIn == true) {
                    if(floorAttributes.optInMessage.trim() == '') // then set default message
                        floorAttributes.optInMessage = 'You need to Opt-In to sharing your contact info with the host to particpate on this floor.';
                    
                    additionalFloorAttributes['optInMessage'] = floorAttributes.optInMessage;
                }
            }

            if (typeof floorAttributes.eventCode !== 'undefined') {
                additionalFloorAttributes['eventCode'] = floorAttributes.eventCode;
            }

            if(Object.keys(additionalFloorAttributes).length > 0)
            {
                Floors.update(floorId, {
                    $set: additionalFloorAttributes
                }, function(error) {
                    if (error) {
                        //display error to user
                        Errors.throw(error.reason);

                    }

                });
            }
            else
            {
                console.log('nothing addtional to update');
            }
            
        }

        Meteor.users.update(user._id, {
            $inc: {
                'profile.floorsOpened': 1
            }
        });

        return floor;
    },
    optedIn: function(floorId) {
        var user = Meteor.user();
        // ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to opt-in");

        Floors.update({
            _id: floorId,
            optedIn: {
                $ne: user._id
            }
        }, {
            $addToSet: {
                optedIn: user._id
            },
            $inc: {
                participating: 1
            }
        });
    },
    upvote: function(floorId) {
        var user = Meteor.user();
        // ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to upvote");

        Floors.update({
            _id: floorId,
            upvoters: {
                $ne: user._id
            }
        }, {
            $addToSet: {
                upvoters: user._id
            },
            $inc: {
                votes: 1
            }
        });
    },
    removeVote: function(floorId) {
        var user = Meteor.user();
        if (!user)
            throw new Meteor.Error(401, "You need to login to remove vote");

        Floors.update({
            _id: floorId,
            upvoters: {
                $exists: user._id
            }
        }, {
            $pull: {
                upvoters: user._id
            },
            $inc: {
                votes: -1
            }
        });
    },
    subscribe: function(floorId) {
        var user = Meteor.user();
        // ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to subscribe");

        Floors.update({
            _id: floorId,
            subscribers: {
                $ne: user._id
            }
        }, {
            $addToSet: {
                subscribers: user._id
            },
            $inc: {
                followers: 1
            }
        });
    },
    unsubscribe: function(floorId) {
        var user = Meteor.user();
        // ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to unsubscribe");

        Floors.update({
            _id: floorId,
            subscribers: {
                $exists: user._id
            }
        }, {
            $pull: {
                subscribers: user._id
            },
            $inc: {
                followers: -1
            }
        });
    },
    addTime: function(floorId, minutes) {
        var user = Meteor.user();
        if (!user)
            throw new Meteor.Error(401, "You need to login to add time");

        var floor = Floors.findOne({
            _id: floorId
        });

        var newClosedDate = new Date(floor.closedToQuestions + (minutes * 2) * 60000).getTime();
        var newClosedToQuestionsDate = new Date(floor.closedToQuestions + minutes * 60000).getTime();

        Floors.update({
                _id: floorId,
                floorStatus: 'Open'
            }, {
                $set: {
                    closed: newClosedDate,
                    closedToQuestions: newClosedToQuestionsDate
                }
            },

            function(error) {
                if (error) {
                    //display error to user
                    console.log(error.reason);
                    Errors.throw(error.reason);

                }
            });
        return 'Success';
    },
    addTimeToAnswerRemainingQuestions: function(floorId, minutes) {
        var user = Meteor.user();
        if (!user)
            throw new Meteor.Error(401, "You need to login to add time");

        var floor = Floors.findOne({
            _id: floorId
        });

        var newClosedToQuestionsDate = new Date(floor.closedToQuestions + minutes * 60000).getTime();

        Floors.update({
                _id: floorId,
                floorStatus: 'ClosedToQuestions'
            }, {
                $set: {
                    closedToQuestions: newClosedToQuestionsDate
                }
            },

            function(error) {
                if (error) {
                    //display error to user
                    Errors.throw(error.reason);

                }
            });
        return 'Success';
    }
});
