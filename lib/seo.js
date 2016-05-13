Meteor.startup(function() {
    if (Meteor.isClient) {
        return SEO.config({
            title: 'OpenFloor - Real-Time Q &amp; A',
            meta: {
                'description': 'OpenFloor changes engagement through short, real-time Q&A'
            },
            og: {
                'image': 'http://openfloor.co/images/openfloor-logo.jpg',
                'description': 'OpenFloor changes engagement through short, real-time Q&A',
                'title': 'OpenFloor'
            }
        });
        
    }
});
