/* 
* @Author: georgediab
* @Date:   2014-06-09 23:55:58
* @Last Modified by:   georgediab
* @Last Modified time: 2014-09-15 20:36:17
* @File: notifications.js
*/

Notifications = new Meteor.Collection('notifications');

Notifications.allow({
	update: ownsDocument
});

Meteor.methods({
    seenNotification: function() {
    	console.log('Meteor method: seenNotification');
    	Notifications.update({userId: Meteor.userId()}, 
				{$set: {read: true}},
        {multi: true})
    }
});

createQuestionNotification = function(question) {
	var floor = Floors.findOne(question.floorId);
	var now = new Date().getTime();
	if(question.userId !== floor.userId) {
		Notifications.insert({
			userId: floor.userId,
			floorId: floor._id,
			questionId: question._id,
			name: question.author,
			type: 'Question',
			read: false,
			submitted: now
		});

	}
},
createAnswerNotification = function(answer) {
	var floor = Floors.findOne(answer.floorId);
	var now = new Date().getTime();
		Notifications.insert({
			userId: answer.userId,
			floorId: floor._id,
			questionId: answer._id,
			name: answer.answerAuthor,
			type: 'Answer',
			read: false,
			submitted: now
		});
};