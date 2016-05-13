/* 
 * @Author: georgediab
 * @Date:   2014-05-28 19:08:19
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-11-05 00:26:02
 * @File: publications.js
 */

Meteor.publish('activePlans', function() {
    return Plans.find({'active': true});
});

Meteor.publish('floors', function(options) {
    return Floors.find({}, options);
});

Meteor.publish('publicFloors', function(options) {
    return Floors.find({'private': false}, options);
});

Meteor.publish('myFloors', function(userId, options) {
    return Floors.find({
        userId: userId
    }, options
    );
});

Meteor.publish('singleFloor', function(id) {
    return id && Floors.find(id);
});

Meteor.publish('floorUsers', function(id) {
    //console.log('id: ' + id);
    var questions = Questions.find({floorId: id}),
        hostUserId = Floors.findOne(id).userId,
        userIds = _.pluck(questions.fetch(), ['userId']);
    //console.log(userIds);
    //console.log(answerUserIds);
    //console.log(Meteor.users.find({$or:[{_id: {$in: userIds}}, {_id: hostUserId}]}).count());
    return Meteor.users.find({$or:[{_id: {$in: userIds}}, {_id: hostUserId}]}, {fields: {
            'profile.name': 1,
            'profile.createdAt': 1,
            'profile.picture': 1,
            'profile.bio': 1,
            'profile.registeredWith': 1,
            'profile.accountId': 1,
            'profile.facebookId': 1,
            'profile.twitterId': 1
        }, multi: true});

});

Meteor.publish('fqaFloor', function(id) {
    var floorId = Questions.findOne(id).floorId;
    return Floors.find({_id: floorId});
});

Meteor.publish('fqaListUsers', function(id) {
    var questions = Questions.find(id),
        userIds = _.pluck(questions.fetch(), ['userId']);
        answerUserIds = _.pluck(questions.fetch(), ['answerUserId']);
    //console.log(userIds);
    //console.log(answerUserIds);
    return Meteor.users.find({$or:[{_id: {$in: userIds}}, {_id: {$in: answerUserIds}}]}, {fields: {
            'profile.name': 1,
            'profile.createdAt': 1,
            'profile.picture': 1
        }, multi: true});
});

Meteor.publish('singleQuestion', function(id) {
    //console.log('singleQuestion: ' + id);
    return id && Questions.find(id);
});

Meteor.publish('questions', function(floorId) {
    return Questions.find({
        floorId: floorId,
        flagged: false
    }, {
        sort: {
            submitted: -1
        }
    });
});

Meteor.publish('answers', function(questionId) {
    return Answers.find({
        questionId: questionId
    });
});

Meteor.publish('notifications', function() {
    return Notifications.find({
        userId: this.userId
    }, {
        sort: {
            submitted: -1
        }
    });
});

Meteor.publish('floorsListUsers', function(terms) {
    var parameters = getParameters(terms),
        floors = Floors.find({}, parameters.options),
        userIds = _.pluck(floors.fetch(), 'userId');
    return Meteor.users.find({_id: {$in: userIds}}, {fields: {
            'profile.name': 1,
            'profile.createdAt': 1,
            'profile.picture': 1
        }, multi: true});
});

Meteor.publish('publicFloorsListUsers', function(terms) {
    var parameters = getParameters(terms),
        floors = Floors.find({'private': false}, parameters.options),
        userIds = _.pluck(floors.fetch(), 'userId');
    return Meteor.users.find({_id: {$in: userIds}}, {fields: {
            'profile.name': 1,
            'profile.createdAt': 1,
            'profile.picture': 1
        }, multi: true});
});

Meteor.publish('allUsers', function() {
    return Meteor.users.find({}, {
        fields: {
            'profile.name': 1,
            'profile.createdAt': 1,
            'profile.picture': 1,
            'profile.bio': 1,
            'profile.registeredWith': 1,
            'profile.accountId': 1,
            'profile.facebookId': 1,
            'profile.twitterId': 1
        }
    });
});

Meteor.publish('allUsernames', function() {
    return Meteor.users.find({}, {
        fields: {
            'profile.username': 1
        }
    });
});

Meteor.publish('alerts', function(options) {
    return Alerts.find({
        userId: this.userId,
        seen: false
    });
});

Meteor.publish('you', function() {
    //console.log(this.userId);
    return Meteor.users.find(this.userId, {
        fields: {
            'profile.name': 1,
            'profile.createdAt': 1,
            'profile.picture': 1, 
            'profile.email': 1, 
            'profile.last_name': 1, 
            'profile.first_name': 1, 
            'profile.bio': 1, 
            'profile.city': 1,
            'profile.username': 1,
            'profile.floorsOpened': 1,
            'profile.registeredWith': 1,
            'userSubscriptionStatus': 1,
            'services.facebook.accessToken': 1
        }});
});

Meteor.publish('username', function(username) {
    //console.log(username);
    return Meteor.users.find({'profile.username': username}, {
        fields: {
            'profile.name': 1,
            'profile.createdAt': 1,
            'profile.picture': 1,  
            'profile.last_name': 1, 
            'profile.first_name': 1, 
            'profile.bio': 1, 
            'profile.city': 1
        }});
});