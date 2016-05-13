/* 
* @Author: georgediab
* @Date:   2014-05-28 18:44:28
* @Last Modified by:   georgediab
* @Last Modified time: 2014-10-18 22:26:57
* @File: fixtures.js
*/

Meteor.startup(function() {
	Migrations.migrateTo('latest');
});

if(Plans.find().count() === 0) {
	var now = new Date().getTime();
	
	// //create two plans
	var goldPlanId = Plans.insert({
		planName: 'Gold',
		stripePlanId: 'ofg_monthly_30daytrial',
		planPrice: '$50.00',
		planDescription: 'Gold Membership / $50 per month / 30 day trial',
		active: true
	});

	var silverPlanId = Plans.insert({
		planName: 'Silver',
		stripePlanId: 'ofs_monthly_30daytrial',
		planPrice: '$25.00',
		planDescription: 'Silver Membership / $25 per month / 30 day trial',
		active: true
	});
	
}