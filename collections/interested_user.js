Interested = new Meteor.Collection('interested');

Meteor.methods({
    interested: function(interestedAttributes) {
    	var now = new Date().getTime();
    	var user = Meteor.user();

        //pick out the whitelisted keys
        var interest = _.extend(_.pick(interestedAttributes, 'firstName', 'lastName', 'email', 'plan', 'planPrice'), {
            userId: ((typeof user === 'undefined') ? '' : user._id),
            submitted: now
            
        });

        var interestedId = Interested.insert(interest);
        console.log(interestedId);
    }
});