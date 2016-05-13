/* 
 * @Author: georgediab
 * @Date:   2014-07-27 21:01:41
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-08-06 11:06:02
 * @File: feedback_submit.js
 */

Template.feedbackSubmit.events({
    'submit form': function(e, template) {
        e.preventDefault();
        
            var user = Meteor.user();

            //var name = user.profile.name;
            var $body = $(e.target).find('[name=feedback]');
            var feedback = {
                body: $body.val(),
                user: user
            };

            Meteor.call('sendFeedbackToSlack', feedback, function(error, result) {
                if (error) {
                	console.log(error);
                    Errors.throw(error.reason);
                } else {
                    GAnalytics.event("question", "asked", "floorId: " + template.data._id);
                    $body.val('');
                    Alerts.insert({
                           title: 'Thanks!',
                           userId: Meteor.userId(),
                           message: 'Your feedback has been saved!',
                           seen: false,
                           alertType: 'info'
                    });

                    Router.go('main');
                }

            });
        
    }
});

Template.feedbackSubmit.rendered = function() {
	if (!Meteor.user()) {
        Session.set('loginRedirect', 'feedbackSubmit');
        $('#loginMenu, #navopen').toggleClass("active");
    }
}