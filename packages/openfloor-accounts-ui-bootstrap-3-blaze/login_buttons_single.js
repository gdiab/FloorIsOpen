(function() {
    // for convenience
    var loginButtonsSession = Accounts._loginButtonsSession;

    Template._loginButtonsLoggedOutSingleLoginButton.events({
        'click .login-button': function() {
            var serviceName = this.name;
            loginButtonsSession.resetMessages();
            var callback = function(err) {
                if (!err) {
                    loginButtonsSession.closeDropdown();
                } else if (err instanceof Accounts.LoginCancelledError) {
                    // do nothing
                } else if (err instanceof Accounts.ConfigError) {
                    loginButtonsSession.configureService(serviceName);
                } else {
                    loginButtonsSession.errorMessage(err.reason || "Unknown error");
                }
            };

            var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent); // 24
            var display = mobile ? 'touch' : 'popup';
   //          if (mobile && serviceName == 'facebook') {
   //          	var appId = Accounts.loginServiceConfiguration.findOne({
		 //            service: serviceName
		 //        }).appId;
			// 	var url = 'https://www.facebook.com/dialog/oauth?client_id=' +appId+'&response_type=token&redirect_uri='+ Meteor.absoluteUrl() + "/f_oauthlink";
			// 	window.location = url;
			// } else if (mobile && serviceName == 'twitter') {
			// 	// Initialize with your OAuth.io app public key
			// 	if (Meteor.openFloorFunctions.url_domain(Meteor.absoluteUrl()) == 'localhost:3000') {
			// 		OAuth.initialize('aqCyLAE-55QVX9MSylOltsgfH6g');
			// 	} else {
			// 		OAuth.initialize('yvPaANs7p0WVVtOY8Z16AF-_61E');
			// 	}
			// 	// callback_url is the URL where users are redirected
			// 	// after being authorized
			// 	OAuth.redirect('twitter', Meteor.absoluteUrl() + 't_oauthlink');

   //          } else {
            	// Initialize with your OAuth.io app public key
    //         	console.log(window.location.pathname);
        		
				// OAuth.initialize('aqCyLAE-55QVX9MSylOltsgfH6g');
				// // callback_url is the URL where users are redirected
				// // after being authorized
				// console.log(Session.get('loginRedirect')); 
    //     		var action = Session.get('loginRedirect');
    //     		action = action.split(':');
				// var redirectTo = 't_oauthlink'+ action[3];
				// OAuth.redirect('twitter', Meteor.absoluteUrl() + 't_oauthlink/floorisopen');
                

                var loginWithService = Meteor["loginWith" + capitalize(serviceName)];

                var options = {}; // use default scope unless specified
                if (Accounts.ui._options.requestPermissions[serviceName])
                    options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
                // if (mobile)
                options.loginStyle = "redirect";

                loginWithService(options, callback);
            // }
        }
    });
    
    Template._loginButtonsLoggedOutSingleLoginButton.helpers({
        isWebView: function() {
            return /FBSN|Twitter/i.test(navigator.userAgent);
        },
        configured: function() {
            return !!Accounts.loginServiceConfiguration.findOne({
                service: this.name
            });
        },
        capitalizedName: function() {
            if (this.name === 'github')
            // XXX we should allow service packages to set their capitalized name
                return 'GitHub';
            else
                return capitalize(this.name);
        }
    });

    // XXX from http://epeli.github.com/underscore.string/lib/underscore.string.js
    var capitalize = function(str) {
        str = str == null ? '' : String(str);
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
})();