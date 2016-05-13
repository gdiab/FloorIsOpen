/* 
 * @Author: georgediab
 * @Date:   2014-06-02 22:27:55
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-07-30 23:15:16
 * @File: layout.js
 */

Template.layout.helpers({
    pageTitle: function() {
        return Session.get('pageTitle');
    }
});
