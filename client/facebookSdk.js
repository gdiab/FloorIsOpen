/*
 * @Author: georgediab
 * @Date:   2014-07-08 01:03:25
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-08-14 15:45:07
 * @File: facebookSdk.js
 */




if (Meteor.isClient) {
    window.fbAsyncInit = function() {
    	var sdkAppId;
        // sdkAppId = process.env.FB_ID;

        //console.log('fb appID: ' + sdkAppId);
        FB.init({
            appId: getFBAppId(),
            status: false,
            xfbml: true,
            version: 'v2.1',
            app_id: getFBAppId()
        });
    };

    getFBAppId = function() {
        return process.env.FB_ID;
    }
}
