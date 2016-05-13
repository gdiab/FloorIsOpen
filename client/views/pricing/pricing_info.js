/* 
* @Author: georgediab
* @Date:   2014-08-27 12:56:20
* @Last Modified by:   georgediab
* @Last Modified time: 2014-11-03 22:11:49
*/

Session.setDefault('converted', false);

var isRealValue = function (obj) {
    return obj && obj !== "null" && obj !== "undefined"
}

Template.pricingInfo.rendered = function() {
    if (!Meteor.user()) {
        Session.set('loginRedirect', 'pricingInfo');
        $('#loginMenu, #navopen').toggleClass("active");
    }
    if (Session.get('planSelected') == "")
    {
        Router.go('pricing');
    }
}

Template.pricingInfo.helpers({
    planSelected: function() {
        return Session.get('planSelected');
    },
    planPrice: function() {
        return Session.get('planPrice');
    },
    convertedUser: function() {
        return Session.get('converted');
    },
    userFirstName: function() {
        var user = Meteor.user();
        if (isRealValue(user)) {
            return user.profile.first_name;
        }
    },
    userLastName: function() {
        var user = Meteor.user();
        if (isRealValue(user)) {
            return user.profile.last_name;
        }
    },
    userEmail: function() {
        var user = Meteor.user();
        if (isRealValue(user)) {
            return user.profile.email;
        }
    }
});

Template.pricingInfo.events({
    'submit form': function(e) {
        e.preventDefault();
        if (!Meteor.user()) {
            Session.set('loginRedirect', 'upgradeUser');
            $('#loginMenu, #navopen').toggleClass("active");
        } else {
            var easy = StripeEasy.submitHelper(e);
            
            
            first_name_value = $(event.target).find("input[name='first_name']").val();
            last_name_value = $(event.target).find("input[name='last_name']").val();
            email_value = $(event.target).find("input[name='email']").val();

            var errorMessage = '';
            if (first_name_value.trim() == '') {
                $(event).find("input[name='first_name']").val(first_name_value.trim());

                errorMessage += 'Your first name is required. '

            }

            if (last_name_value.trim() == '') {
                $(event).find("input[name='last_name']").val(last_name_value.trim());

                errorMessage += 'Your last name is required. '

            }

            if (email_value.trim() == '') {
                $(event).find("input[name='email']").val(email_value.trim());

                errorMessage += 'Your email is required. '

            }

            if (errorMessage.length > 0) {
                PNotify.desktop.permission();
                (new PNotify({
                    title: 'Error',
                    text: errorMessage,
                    type: 'notice',
                    delay: 7000,
                    desktop: {
                        desktop: true
                    }
                })).get().click(function(e) {
                    if ($('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
                });
                return;
            }

            var plan = Plans.findOne({'planName': Session.get('planSelected')});

            StripeEasy.subscribe(easy, plan.stripePlanId, function(err, result) {
                // if no error, will return the newly created customer object from Stripe
                if(!err) {
                    var user = Meteor.user();
                    result.stripePlanId = plan.stripePlanId;
                    result.plan = plan.planName;
                    result.planPrice = plan.planPrice;
                    result.last_name = last_name_value;
                    result.first_name = first_name_value;
                    result.email = email_value;
                    result.userIntercomHash = user.intercomHash;
                    console.log(result);
                    Meteor.call('upgradeUser', result, function(err, data) {
                       if(!err) {
                            Session.set('converted', true);
                       }
                    });
                }
                console.log(err);
                
            });

            
        }
    }
});

