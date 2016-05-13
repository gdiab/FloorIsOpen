hasEmail = function() {
        var user = Meteor.user();
        if(!user) {
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
    };

validateEmail = function(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};