/* 
 * @Author: georgediab
 * @Date:   2014-07-24 18:04:58
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-09-15 10:33:45
 * @File: toaster.js
 */

Template.toaster.helpers({
    popAlert: function() {
        if (Meteor.userId()) {
            var alert = Alerts.findOne({
                userId: Meteor.userId(),
                seen: false
            });
            if (alert) {
                switch (alert.alertType) {
                    case 'info':
                        PNotify.desktop.permission();
                        (new PNotify({
                            title: alert.title,
                            text: alert.message,
                            type: 'info',
                            // addclass: 'stack-bar-top',
                            // stack: 'stack-bar-top',
                            delay: 7000,
                            desktop: {
                                desktop: true
                            }
                        })).get().click(function(e) {
                            if ($('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
                                if(alert.url)
                                    console.log('should be redirecting');
                                    Router.go(alert.url);
                        });
                        var s = new buzz.sound('/sounds/openfloor-mic-tap.mp3');
                        s.play();
                        if (document.title.substring(0, 2) != "* ") {
                            document.title = "* " + document.title;
                        }

                        // Toast.info(alert.message, alert.title, {
                        //     displayDuration: 2000
                        // });
                        break;

                    case 'alert':

                        PNotify.desktop.permission();
                        (new PNotify({
                            title: alert.title,
                            text: alert.message,
                            type: 'notice',
                            width: '100%',
                            // addclass: 'stack-bar-top',
                            // stack: 'stack-bar-top',
                            cornerclass: '',
                            delay: 7000,
                            desktop: {
                                desktop: true
                            }
                        })).get().click(function(e) {
                            if ($('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
                            //alert('Hey! You clicked me!');
                        });

                        if (document.title.substring(0, 2) != "* ") {
                            document.title = "* " + document.title;
                        }

                        // Toast.info(alert.message, alert.title, {
                        //     displayDuration: 2000
                        // });
                        break;

                    case 'error':
                        Toast.error(alert.message, alert.title, {
                            displayDuration: 2000
                        });
                        break;

                }

                updateAlert(alert);

            }
        }
    }
});
