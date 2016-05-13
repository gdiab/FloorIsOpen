/* 
* @Author: georgediab
* @Date:   2014-07-24 17:54:16
* @Last Modified by:   georgediab
* @Last Modified time: 2014-07-27 12:32:05
* @File: alerts.js
*/

Alerts = new Meteor.Collection('alerts');

Alerts.allow({
	update: ownsDocument,
	remove: ownsDocument,
	insert: function(){return true}
});

deleteAlert = function(alert) {
	Alerts.remove(alert._id);
},
updateAlert = function(alert) {
	Alerts.update(alert._id, {
	                $set: {
	                    seen: true
	                }
	            });
};