/* 
 * @Author: georgediab
 * @Date:   2014-06-10 00:20:20
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-09-15 20:36:47
 * @File: notifications.js
 */

Session.setDefault('notificationPaging', 10);
var ITEMS_INCREMENT = 5;

function showMoreVisible() {
    Session.set("notificationPaging",
        Session.get("notificationPaging") + ITEMS_INCREMENT);
}

Template.notificationsList.helpers({
    moreResults: function() {
        return !(Notifications.find({
            userId: Meteor.userId()
        }).count() < Session.get("notificationPaging"));
    },
    notifications: function() {
        return Notifications.find({
            userId: Meteor.userId()
        }, {
            limit: Session.get('notificationPaging')
        });
    },
    notificationCount: function() {
        return Notifications.find({
            userId: Meteor.userId()
        }).count();
    }
});

Template.notificationsList.events({
    'click .showMoreResults': function() {
        showMoreVisible();
    }
});

Template.notification.helpers({
    notificationFloorPath: function() {
        return Router.routes.floorPage.path({
            _id: this.floorId
        });

    },
    notificationName: function() {

        if (this.type == 'Question') {
            return this.name + ' has asked a question ';
        } else if (this.type == 'Answer') {
            return this.name + ' has answered your question ';
        }
    },
    submittedText: function() {
        return moment(this.submitted).fromNow();
    }
});

Template.notifications.helpers({
    unseenNotificationCount: function() {
        return Notifications.find({
            userId: Meteor.userId(),
            read: false
        }).count();
    }
});

Template.notificationsList.rendered = function() {
    console.log('rendered notificationsList template');
    Meteor.call('seenNotification');
    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    if (!mobile) {
        Session.set("notificationPaging",
            15);
    }
};
