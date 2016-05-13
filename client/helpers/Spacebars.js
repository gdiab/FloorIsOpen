/* 
 * @Author: georgediab
 * @Date:   2014-06-12 01:17:26
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-10-19 20:30:50
 * @File: Spacebars.js
 */

UI.registerHelper('pluralize', function(n, thing) {
    if (n === 1) {
        return '1 ' + thing;
    } else if (n === undefined) {
        return '0 ' + thing + 's';
    } else {
        return n + ' ' + thing + 's';
    }
});

UI.registerHelper('urlSafe', function(str) {
    return escape(str);
});

UI.registerHelper('breakLines', function(str) {
    if (str !== undefined) {
        var text = str.replace(/(?:\\[rn]|[\r\n]+)+/g, '<br>');
        return text
    }

});

UI.registerHelper('hasEmail', function() {

    var user = Meteor.user();
    if (!user) {
        return false;
    }
    if (typeof user.profile.email === 'undefined' || user.profile.email == null) {
        return false;
    } else if (user.profile.email.trim() == '') {
        return false;
    } else {
        //console.log('has email');
        return true;
    }

});
