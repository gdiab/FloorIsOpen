/* 
* @Author: georgediab
* @Date:   2014-06-19 15:24:59
* @Last Modified by:   georgediab
* @Last Modified time: 2014-08-11 16:42:02
* @File: footer.js
*/



Template.footer.events({
	'click .btn-feedback': function(e) {
    	//console.log('btn-feedback');
        if (!Meteor.user()) {
        	//console.log('clicked feedback');
            Session.set('loginRedirect', 'feedbackSubmit');
            $('#loginMenu, #navopen').toggleClass("active");
        } else {
            Router.go('feedbackSubmit');
        }
    }
});