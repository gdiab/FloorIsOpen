Errors = { 
  throw: function(message) {
  	console.log('error');
    Alerts.insert({
            title: 'Error',
            userId: Meteor.userId(),
            message: message,
            seen: false,
            alertType: 'error'
        });
  }
};
