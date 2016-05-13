/* 
* @Author: georgediab
* @Date:   2014-09-15 11:09:28
* @Last Modified by:   georgediab
* @Last Modified time: 2014-09-18 21:24:38
*/

Template.event.events({
    'submit form': function(event) {
    	//console.log('find event form submitted.');
        var data;
        event.preventDefault();

        var code_value = $(event.target).find("input[name='event-code']").val().toLowerCase();
        
        //console.log(code_value);

        var errorMessage = '';
        if (code_value.trim() == '') {
            $(event).find("input[name='event-code']").val(code_value.trim());

            errorMessage += 'Please give us a code to lookup.'

        }
        console.log(errorMessage);
        if (errorMessage.length > 0) {
        	Toast.error(errorMessage, 'Event lookup error!', {
                displayDuration: 2000
            });
            return;
        }

        var floor = Floors.findOne({eventCode: code_value}, {sort: {submitted: -1}});
        if(!floor) {
        	Toast.error('We can\'t find that event code. Want to try another one?', 'Event lookup error!', {
                displayDuration: 2000
            });
            return;
        }
        Router.go('floorPage', {_id: floor._id} );
    }
});