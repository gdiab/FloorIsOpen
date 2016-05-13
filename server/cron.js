/* 
* @Author: georgediab
* @Date:   2014-06-19 21:44:09
* @Last Modified by:   georgediab
* @Last Modified time: 2014-11-03 22:15:38
* @File: cron.js
*/

var closeFloorsJob = new Cron(function() {
    var now = new Date().getTime();

    var floorsToUpdate = Floors.find({closed: { $lt: now}, $or: [ {floorStatus: 'Open'},{floorStatus: 'ClosedToQuestions'} ]}).count();
    Floors.update({closed: { $lt: now}, $or: [ {floorStatus: 'Open'},{floorStatus: 'ClosedToQuestions'} ] } , 
        {$set: {floorStatus: 'Closed'}},
        {multi: true});
    console.log('updated floor status to Closed for ' + floorsToUpdate + ' floors.');

    var floorsToUpdate = Floors.find({closedToQuestions: { $lt: now}, floorStatus: 'Open'}).count();
    Floors.update({closedToQuestions: { $lt: now}, floorStatus: 'Open' } , 
        {$set: {floorStatus: 'ClosedToQuestions'}},
        {multi: true});
    console.log('updated floor status to ClosedToQuestions for ' + floorsToUpdate + ' floors.');
});

var openFloorJob = new Cron(function() {
    var now = new Date().getTime();

    var floorsToUpdate = Floors.find({$and:[{openOn: { $lt: now}}, {active: false}, {floorStatus: "Scheduled"}]}).count();
    Floors.update({$and:[{openOn: { $lt: now}}, {active: false}, {floorStatus: "Scheduled"}]} , 
        {$set: {floorStatus: 'Open', active: true, opened: now}},
        {multi: true});
    console.log('updated floor status to Open for ' + floorsToUpdate + ' floors.');
        
});

var contactSubscribersJob = new Cron(function() {
    var now = moment(new Date().getTime()).add(5, 'minutes');
    console.log(now.format("h:mm A - ddd, MMM Do, YYYY"));

    var usersToContact = Floors.find({$and:[{openOn: { $lt: now.valueOf()}}, {active: false}, {floorStatus: "Scheduled"}, {usersNotified: false}]});
    console.log('contacting users for ' + Floors.find({$and:[{openOn: { $lt: now.valueOf()}}, {active: false}, {floorStatus: "Scheduled"}, {usersNotified: false}]}).count() + ' floors.');
    if(typeof usersToContact !== 'undefined')
    {
        usersToContact.forEach(function (floor) {
            if(typeof floor.subscribers !== 'undefined')
            {
                floor.subscribers.forEach(function (userId) {

                    var user = Meteor.users.findOne({_id: userId});

                    var reminderEmail = {
                        host: floor.host,
                        email: user.profile.email,
                        name: user.profile.first_name,
                        url: floor.shortUrl
                    };
                    console.log(reminderEmail);

                    Meteor.call('sendReminderEmail', reminderEmail, function(error, result) {
                        if(error)
                            console.log('error sending email: ' + error);

                        if(result)
                            console.log('success sending email: ' + result);
                    });
                }); 
            }
            var user = Meteor.users.findOne({_id: floor.userId});

            var hostReminderEmail = {
                host: floor.host,
                email: user.profile.email,
                name: user.profile.first_name,
                url: floor.shortUrl
            };
            
            Meteor.call('sendHostReminderEmail', hostReminderEmail, function(error, result) {
                if(error)
                    console.log('error sending host email: ' + error);

                if(result)
                    console.log('success sending host email: ' + result);
            });

            Floors.update({_id: floor._id} , 
                {$set: {usersNotified: true}});
        });
        
    }
        
});
