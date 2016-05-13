//floor_edit.js - George Diab - Sun Jun  8 17:02:47 2014

Template.floorEdit.created = function () {
    var now = TimeSync.serverTime();
        
    seconds = Math.floor((now - this.data.opened) / 1000);
    minutes = Math.floor(seconds / 60);

    //console.log(this);
    var floor = Floors.findOne({_id: this.data._id});
    if (floor.floorStatus != 'Scheduled')
    {
    	if (minutes > 2) Router.go('/floors/' + this.data._id);
    }
};

Template.floorEdit.events({
	'submit form' : function(e) {
		e.preventDefault();

		var currentFloorId = this._id;

		var floorProperties = {
			url: $(e.target).find('[name=url]').val(),
			title: $(e.target).find('[name=title]').val(),
			description: $(e.target).find('[name=description]').val()
		}

		Floors.update(currentFloorId, {$set: floorProperties}, function(error)
		{
			if(error) {
				//display error to user
				Errors.throw(error.reason);

			} else {
				Router.go('floorPage', {_id: currentFloorId});
			}

		});
	},
	'click .delete': function(e) {
		e.preventDefault();

		if (confirm("Delete this floor?")) {
			var currentFloorId = this._id;
			Floors.remove(currentFloorId);
			Router.go('main');
		}
	},
	'click .cancel': function(e) {
		e.preventDefault();
		var currentFloorId = this._id;
		Router.go('floorPage', {_id: currentFloorId});
	}
});