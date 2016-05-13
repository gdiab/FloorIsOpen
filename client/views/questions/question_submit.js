/* 
* @Author: georgediab
* @Date:   2014-06-09 00:16:19
* @Last Modified by:   georgediab
* @Last Modified time: 2014-11-03 22:12:47
* @File: question_submit.js
*/
var $body;

Template.questionSubmit.events({
	'submit form': function(e, template) {
		e.preventDefault();

		$("input[type=submit]").attr("disabled", "disabled");
        $body = $(e.target).find('[name=body]');
        var $rawBody = $body.val();
        var words = $body.val().split(' ');
        words = words.filter(function(x){return x.length > 30});
        //$('#container').html($('#container').html().replace(/(dog)/g,'<span class="highlight">$1</span>'));

		$.each(words, function (index,value) {
              $body.val($body.val().replace(value, '<span>'+value+'</span>'));          
        });


        Meteor.call('updateProfileUrl', Meteor.userId(), function(err, data) {
        });

		var question = {
			body: $body.val(),
			rawBody: $rawBody,
			floorId: template.data._id,
			votes: 0
		};

		Meteor.call('question', question, function (error, questionId) {
			if (error) {
				$("input[type=submit]").removeAttr("disabled");
				Errors.throw(error.reason);
			} else {
				GAnalytics.event("question","asked","floorId: " + template.data._id);
				$body.val('');
				$("input[type=submit]").removeAttr("disabled");
				$(".ask-question-form").hide();
				$(".ask-question").show();
				var user = Meteor.user();
				ic.createTag({name: 'opened-floor', users: [{email: user.profile.email}]});
			}

		});
	}
});

function spanify(element, index, array) {
	// console.log($body);
 //    console.log("a[" + index + "] = " + element);
}


