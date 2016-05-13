/* 
* @Author: georgediab
* @Date:   2014-08-23 10:23:13
* @Last Modified by:   georgediab
* @Last Modified time: 2014-11-05 00:30:20
*/

Session.setDefault('selectedPricing', false);

Session.setDefault('triedToConvert', false);

Session.setDefault('planSelected', '');

Session.setDefault('planPrice', '$0.00');

Template.plans.events({
	'click .Silver': function () {
		Session.set('selectedPricing', true);
		Session.set('planSelected', 'Silver');
		Session.set('planPrice', '$24.99');
		return Router.go('pricingInfo', {plan:'Silver'});
	},
	'click .Gold': function () {
		Session.set('selectedPricing', true);
		Session.set('planSelected', 'Gold');
		Session.set('planPrice', '$49.99');
		return Router.go('pricingInfo', {plan:'Gold'});
	}
});

Template.pricing.helpers({
	convertedUser: function() {
		var user = Meteor.user();
		console.log(user.userSubscriptionStatus);
		switch (user.userSubscriptionStatus)
		{
			case 'Gold':
			case 'Silver':
				return true;

			default:
				return false;
		}

    }
});

Template.payingMember.helpers({
	planPurchased: function() {
		var user = Meteor.user();
		return user.userSubscriptionStatus;
	}
});
