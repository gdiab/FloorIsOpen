// /* 
// * @Author: georgediab
// * @Date:   2014-07-28 14:27:53
// * @Last Modified by:   georgediab
// * @Last Modified time: 2014-11-20 12:25:46
// * @File: migrations.js
// */

Migrations.add({
  name: 'Add flagged to questions.',
  version: 1,

  up: function() {
    var questions = Questions.find({flagged: {$exists: false}});
    questions.forEach(function(question) {
      Questions.update(question._id, {$set: {
        flagged: false
      }});
    });
  },

  down: function() {
    Questions.update({}, {$unset: {flagged: true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Add notification timestamp.',
  version: 2,

  up: function() {
    var notifications = Notifications.find({submitted: {$exists: false}});
    notifications.forEach(function(notification) {
    	var question = Questions.findOne({_id: notification.questionId});
    	var now = question.submitted;
      	Notifications.update(notification._id, {$set: {
        submitted: now
      }});
    });
  },

  down: function() {
    Notifications.update({}, {$unset: {submitted: true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Add rawBody and rawAnswerBody to question.',
  version: 3,

  up: function() {
    var questions = Questions.find({rawBody: {$exists: false}});
    questions.forEach(function(question) {
      var body = question.body;
      var answerBody = ((typeof questions.answerBody == 'undefined') ? '' : questions.answerBody);
      Questions.update(question._id, {$set: {
        rawAnswerBody: answerBody, rawBody: body
      }});
    });
  },

  down: function() {
    Questions.update({}, {$unset: {rawAnswerBody: true, rawBody:true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Add rawTitle and rawDescription to floor.',
  version: 4,

  up: function() {
    var floors = Floors.find({rawTitle: {$exists: false}});
    floors.forEach(function(floor) {
      var title = floor.title;
      var description = ((typeof floor.description == 'undefined') ? '' : floor.description);
      Floors.update(floor._id, {$set: {
        rawTitle: title, rawDescription: description
      }});
    });
  },

  down: function() {
    Floors.update({}, {$unset: {rawTitle: true, rawDescription:true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Add active flag to floor.',
  version: 5,

  up: function() {
    var floors = Floors.find({active: {$exists: false}});
    floors.forEach(function(floor) {
      Floors.update(floor._id, {$set: {
        active: true
      }});
    });
  },

  down: function() {
    Floors.update({}, {$unset: {active: true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Add private flag to floor.',
  version: 6,

  up: function() {
    var floors = Floors.find({private: {$exists: false}});
    floors.forEach(function(floor) {
      Floors.update(floor._id, {$set: {
        private: false
      }});
    });
  },

  down: function() {
    Floors.update({}, {$unset: {private: true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Default username to users profile',
  version: 7,

  up: function() {
    //console.log('version 7');
    var users = Meteor.users.find({'profile.username': {$exists: false}});
    //console.log(users);
    users.forEach(function(user) {
      var userNameArray = user.profile.name.toLowerCase().split(' ');
      for(var i = userNameArray.length-1; i--;){
          if (userNameArray[i] === "") userNameArray.splice(i, 1);
      }
      var initial = ((typeof userNameArray[1] === 'undefined') ? '' : userNameArray[1].charAt(0));
      var username = userNameArray[0] + initial;

      var usernamesInUse = Meteor.users.find({'profile.username': username}).count();
      if(usernamesInUse > 0) {
        $loop = true;
          while($loop) {
              var num = Math.floor(Math.random() * 90000) + 10000;
              var usernamesInUse = Meteor.users.find({'profile.username': username + num}).count();
              username = username + num;
              $loop = (usernamesInUse != 0);
              
          }
      }

      Meteor.users.update(user._id, {$set: {
        'profile.username': username
      }});
    });
  },

  down: function() {
    Meteor.users.update({}, {$unset: {'profile.username': true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Default floorsOpened to users profile',
  version: 8,

  up: function() {
    var users = Meteor.users.find({'profile.floorsOpened': {$exists: false}});
    //console.log(users);
    users.forEach(function(user) {
      var floorsOpened = Floors.find({'userId': user._id} ).count()
      Meteor.users.update(user._id, {$set: {
        'profile.floorsOpened': floorsOpened
      }});
    });
  },

  down: function() {
    Meteor.users.update({}, {$unset: {'profile.floorsOpened': true}}, {multi: true});
  }
});

Migrations.add({
  name: 'get fb id into profile',
  version: 9,

  up: function() {
    var users = Meteor.users.find({ $and:[{'profile.facebookId': {$exists: false}},{'services.facebook.id': {$exists: true}}]});
    users.forEach(function(user) {
      Meteor.users.update(user._id, {$set: {
        'profile.registeredWith': 'facebook','profile.facebookId': user.services.facebook.id, 'profile.accountId':user.services.facebook.id 
      }});
    });
  },

  down: function() {
    Meteor.users.update({}, {$unset: {'profile.facebookId': true, 'profile.accountId': true, 'profile.registeredWith': true}}, {multi: true});
  }
});

Migrations.add({
  name: 'get twitter id into profile',
  version: 10,

  up: function() {
    var users = Meteor.users.find({ $and:[{'profile.twitterId': {$exists: false}},{'services.twitter.id': {$exists: true}}]});
    // 'services.facebook.id': {$exists: true}
    users.forEach(function(user) {
      Meteor.users.update(user._id, {$set: {
        'profile.registeredWith': 'twitter','profile.twitterId': user.services.twitter.id, 'profile.accountId':user.services.twitter.id 
      }});
    });
  },

  down: function() {
    Meteor.users.update({}, {$unset: {'profile.twitterId': true, 'profile.accountId': true, 'profile.registeredWith': true}}, {multi: true});
  }
});

Migrations.add({
  name: 'Default userSubscriptionStatus to Gold',
  version: 11,

  up: function() {
    var users = Meteor.users.find({'userSubscriptionStatus': {$exists: false}});
    //console.log(users);
    users.forEach(function(user) {
      Meteor.users.update(user._id, {$set: {
        'userSubscriptionStatus': 'Gold'
      }});
    });
  },

  down: function() {
    Meteor.users.update({}, {$unset: {'userSubscriptionStatus': true}}, {multi: true});
  }
});