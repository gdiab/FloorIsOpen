/* 
* @Author: georgediab
* @Date:   2014-07-20 14:40:27
* @Last Modified by:   georgediab
* @Last Modified time: 2014-07-20 17:19:05
* @File: user_card.js
*/

Template.userCard.helpers({
  name: function() {
    if (this && this.profile && this.profile.first_name && this.profile.last_name) {
      return "" + this.profile.first_name + " " + this.profile.last_name;
    } else {
      return "";
    }
  },
  subhead: function() {
    if (this && this.profile) {
      if (this.profile.organization && this.profile.location) {
        return [this.profile.organization, this.profile.location].join(' - ');
      } else {
        if (this.profile.organization) {
          return this.profile.organization;
        }
        if (this.profile.location) {
          return this.profile.location;
        }
      }
    }
  },
  bio: function() {
    if (this && this.profile) {
      return this.profile.bio;
    }
  },
  url: function() {
    if (this && this.profile) {
      return this.profile.url;
    }
  },
  googlePlusUrl: function() {
    if (this && this.profile) {
      return this.profile.googlePlusUrl;
    }
  },
  twitterHandle: function() {
    if (this && this.profile) {
      return this.profile.twitterHandle;
    }
  }
});