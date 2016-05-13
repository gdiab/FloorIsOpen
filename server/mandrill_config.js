/* 
* @Author: georgediab
* @Date:   2014-07-11 10:55:35
* @Last Modified by:   georgediab
* @Last Modified time: 2014-10-01 10:47:24
* @File: sendgrid_config.js
*/

Meteor.startup(function(){
    Meteor.Mandrill.config({
      username: 'admin@openfloor.co',
      key: 'N9ZFDhDjVCrZ2SV4TU0Otg'
    });
  });



Meteor.methods({
    sendWelcomeEmail: function(emailValues) {
        Meteor.Mandrill.sendTemplate({
          key: 'N9ZFDhDjVCrZ2SV4TU0Otg',
          templateSlug: 'openfloor-general',
          templateContent: [
            {
              name: "main",
              content: 'Thanks for joining OpenFloor!<br><br>We hope you have a great experience browsing past floors, participating on open floors and hosting your own floor.<br><br>If you have any feedback or questions, please let us know. We would love to hear from you.<br><br>Thanks and enjoy, George Diab<br>OpenFloor Founder'
            }
          ],
          // globalMergeVars: [
          //     {
          //         name: "name",
          //         content: emailValues.name
          //     }
          // ],
          fromEmail: 'george@openfloor.co',
          toEmail: emailValues.email,
          subject: 'Welcome to OpenFloor!'
        });


    },
    sendReminderEmail: function(emailValues) {
        var result = Meteor.Mandrill.sendTemplate({
          key: 'N9ZFDhDjVCrZ2SV4TU0Otg',
          templateSlug: 'openfloor-general',
          templateContent: [
            {
              name: "main",
              content: emailValues.host + '\'s floor is about to open!<br><br><a href="' + emailValues.url + '" target="_blank" style="text-decoration: none;display: inline-block;margin: 8px 0;padding: 8px 12px;font-weight: 700;font-size: 16px;color: #FFF;background: #f68a1f;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;-moz-border-radius: 4px; -webkit-border-radius: 4px; " >Launch OpenFloor</a>'
            }
          ],
          // globalMergeVars: [
          //     {
          //         name: "name",
          //         content: emailValues.name
          //     }
          // ],
          fromEmail: 'george@openfloor.co',
          toEmail: emailValues.email,
          subject: 'A floor you were interested in is about to Open!'
        });

        return result;
    },
    sendHostReminderEmail: function(emailValues) {
        var result = Meteor.Mandrill.sendTemplate({
          key: 'N9ZFDhDjVCrZ2SV4TU0Otg',
          templateSlug: 'openfloor-general',
          templateContent: [
            {
              name: "main",
              content: 'Your floor is about to open!<br><br><a href="' + emailValues.url + '" target="_blank" style="text-decoration: none;display: inline-block;margin: 8px 0;padding: 8px 12px;font-weight: 700;font-size: 16px;color: #FFF;background: #f68a1f;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;-moz-border-radius: 4px; -webkit-border-radius: 4px; ">Launch OpenFloor</a><br><br>'
            }
          ],
          // globalMergeVars: [
          //     {
          //         name: "name",
          //         content: emailValues.name
          //     }
          // ],
          fromEmail: 'george@openfloor.co',
          toEmail: emailValues.email,
          subject: 'Your floor is about to Open!'
        });

        return result;
    }
});