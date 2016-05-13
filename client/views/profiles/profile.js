/* 
 * @Author: georgediab
 * @Date:   2014-07-20 14:36:00
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-10-09 10:04:17
 * @File: profile.js
 */
var MeteorProfile;

MeteorProfile = {
    settings: {
        showPreview: false,
        fields: [{
                name: "first_name",
                required: true
            }, {
                name: "last_name",
                required: true
            }, {
                name: "email",
                required: true
            }, {
                name: "city",
                required: false
            }, {
                name: "bio",
                required: false,
                type: 'text_area'
            }, {
                name: "username",
                required: true
            }
            /*
      , {
        name: "url",
        required: false
      }, {
        name: "googlePlusUrl",
        required: false
      }, {
        name: "twitterHandle",
        required: false
      }
*/
        ]
    },
    config: function(options) {
        return this.settings = _.extend(this.settings, options);
    }
};


Template.profilePage.helpers({
    profileFields: function() {
        return MeteorProfile.settings.fields;
    },
    showPreview: function() {
        return MeteorProfile.settings.showPreview;
    },
    isPicture: function() {
        //console.log(this);
        return this.name === 'picture';
    }
});

Template.profilePage.events({
    'submit form': function(event) {
        var data;
        event.preventDefault();

        first_name_value = $(event.target).find("input[name='first_name']").val();
        last_name_value = $(event.target).find("input[name='last_name']").val();
        email_value = $(event.target).find("input[name='email']").val();
        username_value = $(event.target).find("input[name='username']").val();

        console.log(username_value);
        var errorMessage = '';
        if (first_name_value.trim() == '') {
            $(event).find("input[name='first_name']").val(first_name_value.trim());

            errorMessage += 'Your first name is required. '

        }

        if (last_name_value.trim() == '') {
            $(event).find("input[name='last_name']").val(last_name_value.trim());

            errorMessage += 'Your last name is required. '

        }

        if (email_value.trim() == '') {
            $(event).find("input[name='email']").val(email_value.trim());

            errorMessage += 'Your email is required. '

        }

        if (username_value.trim() == '') {
            $(event).find("input[name='username']").val(username_value.trim());

            errorMessage += 'Your user name is required. '

        }

        var usernamesInUse = Meteor.users.find({
            $and: [{
                'profile.username': username_value.toLowerCase()
            }, {
                _id: {
                    $ne: Meteor.userId()
                }
            }]
        }).count();

        if (usernamesInUse > 0) {
            $(event).find("input[name='username']").val(username_value.trim());

            errorMessage += 'That username was taken'

        }

        if (errorMessage.length > 0) {
            Alerts.insert({
                title: 'Profile error!',
                message: errorMessage,
                userId: Meteor.userId(),
                seen: false,
                alertType: 'error'
            });
            return;
        }


        data = SimpleForm.processForm(event.target);

        var userProfile;
        userProfile = Meteor.user().profile;

        if (userProfile) { // logic to handle logged out state
            data.picture = userProfile.picture;
            data.location = userProfile.location;
            data.username = username_value;
            data.floorsOpened = userProfile.floorsOpened;
            data.name = data.first_name + ' ' + data.last_name;
            if (typeof userProfile.email == 'undefined' && data.email.length > 0) {
                //send welcome letter
                //console.log('should be sending email now...');
                Meteor.call('sendWelcomeEmail', data, function(error, result) {

                });
            }
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                profile: data
            }
        });

        Alerts.insert({
            title: 'Profile saved!',
            message: ' ',
            userId: Meteor.userId(),
            seen: false,
            alertType: 'info'
        });

        Router.go('main');
    },
    'change .profileField': function() {
        return event;
    },
    'click #profile-left li a': function(e) {
        var targetId = $(e.currentTarget).data("target");
        $(".profile-info").removeClass("active");
        //console.log(targetId);
        $("#" + targetId).addClass("active");
    },
    'click .logout': function(e) {
        Meteor.logout(function() {
            //loginButtonsSession.closeDropdown();
        });
    }
});

Template._profileField.helpers({
    profile: function() {
        if (Meteor.user()) {
            return Meteor.user().profile;
        } else {
            var user = Meteor.users.findOne({});
            console.table(user);
            return user.profile;
        }
    },
    isTextField: function() {
        return this.type !== 'file' && this.type !== 'text_area';
    },
    isCheckbox: function() {
        return this.type === 'checkbox';
    },
    isFileField: function() {
        return this.type === 'file';
    },
    isTextArea: function() {
        return this.type === 'text_area';
    },
    getLocation: function() {
        //    console.log('get location');
        //    var geo = Geolocation.getInstance();
        //    var latitude = geo.lat;
        // var longitude = geo.lng;
        // console.log(geo);
    }
});
