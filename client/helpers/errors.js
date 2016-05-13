/* 
 * @Author: georgediab
 * @Date:   2014-07-27 11:56:21
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-07-27 12:00:06
 * @File: errors.js
 */

throwError = function(message) {
    console.log('error');
    Alerts.insert({
        title: 'Error',
        userId: Meteor.userId(),
        message: message,
        seen: false,
        alertType: 'error'
    });
}
