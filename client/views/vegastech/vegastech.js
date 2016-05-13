/* 
* @Author: georgediab
* @Date:   2014-07-21 23:32:45
* @Last Modified by:   max
* @Last Modified time: 2015-06-07 09:38:49
* @File: vegastech.js
*/

var OpenFloorAds;

OpenFloorAds = {
  "ads": [
    {
      "url": "http://www.alicereceptionist.com",
      "imagePath": "http://openfloor.co/images/banners/alice.png",
      "customer": "ALICE Receptionist",
      "smImagePath": "http://openfloor.co/images/banners/alice_sm.png"
    },
    {
      "url": "http://themilldtlv.com/",
      "imagePath": "http://openfloor.co/images/banners/themill.png",
      "customer": "The Mill",
      "smImagePath": "http://openfloor.co/images/banners/themill_sm.png"
    },
    {
      "url": "http://wedgies.com/",
      "imagePath": "http://openfloor.co/images/banners/wedgies.png",
      "customer": "Wedgies",
      "smImagePath": "http://openfloor.co/images/banners/wedgies_sm.png"
    },
    {
      "url": "http://primeloop.com/ann",
      "imagePath": "http://openfloor.co/images/banners/primeloop.png",
      "customer": "Primeloop",
      "smImagePath": "http://openfloor.co/images/banners/primeloop_sm.png"
    },
    {
      "url": "http://workingon.co",
      "imagePath": "http://openfloor.co/images/banners/workingon-ad-300x250.png",
      "customer": "WorkingOn",
      "smImagePath": "http://openfloor.co/images/banners/workingon-ad-300x50.png"
    },
    // {
    //   "url": "https://tech-cocktail-celebrate-2014-tickets.eventbrite.com/?discount=OpenFloor",
    //   "imagePath": "http://openfloor.co/images/banners/celebrate.png",
    //   "customer": "Tech Cocktail",
    //   "smImagePath": "http://openfloor.co/images/banners/celebrate_sm.png"
    // },
    {
      "url": "http://rocketship.fm/podcast/",
      "imagePath": "http://openfloor.co/images/banners/rocketship-300x250.png",
      "customer": "RocketShip Podcase",
      "smImagePath": "http://openfloor.co/images/banners/rocketship-300x50.png"
    }
  ]
};

Template.vegastech.helpers({
	ads: function() {
		var ad = OpenFloorAds.ads[Math.floor(Math.random()*OpenFloorAds.ads.length)];
		return ad;
  }
});

Template.vegastech.events({
	'click .ad': function(e) {
		GAnalytics.event("ads", "click", "client: " + $(e.currentTarget).attr("rel"));
	}
});