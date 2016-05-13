/* 
 * @Author: georgediab
 * @Date:   2014-06-08 17:38:09
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-09-05 22:50:06
 * @File: questions.js
 */


Questions = new Meteor.Collection('questions');


Meteor.methods({
    question: function(questionAttributes) {
        var user = Meteor.user();
        var floor = Floors.findOne({
            _id: questionAttributes.floorId
        });
        //ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to ask questions.");

        if (!questionAttributes.body)
            throw new Meteor.Error(422, "Please write a question.")

        if (!floor)
            throw new Meteor.Error(422, "You must ask questions on the floor.");

        if (floor.floorStatus == "Closed")
            throw new Meteor.Error(413, "The floor is closed.");



        question = _.extend(_.pick(questionAttributes, 'floorId', 'body', 'rawBody'), {
            userId: user._id,
            authorPicture: user.profile.picture,
            author: user.profile.name,
            submitted: new Date().getTime(),
            modified: new Date().getTime(),
            flagged: false,
            votes: 0
        });

        //update the floor with the number of questions
        Floors.update(question.floorId, {
            $inc: {
                questionsCount: 1
            }
        });

        if (!this.isSimulation) {
            question.body = sanitizeHtml(question.body, {
                allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span'],
                allowedAttributes: {
                    'a': ['href', 'target']
                }
            });
            console.log(question.body);
        }
        

        //create question and save id
        question._id = Questions.insert(question);

        //create notification , informing host that there has been a question
        createQuestionNotification(question);
        Alerts.insert({
            title: 'Tapping Mic...',
            userId: floor.userId,
            message: 'You have a new question on the floor!',
            url: '/floors/'+floor._id,
            seen: false,
            alertType: 'info',
            floorId: floor._id
        });
        return question._id;
    },
    answer: function(questionAttributes) {
        var user = Meteor.user();
        var floor = Floors.findOne(questionAttributes.floorId);

        //ensure the user is logged in
        if (!user)
            throw new Meteor.Error(401, "You need to login to answer questions.");

        if (!questionAttributes.answerBody)
            throw new Meteor.Error(422, "Please write an answer.")

        if (!floor)
            throw new Meteor.Error(422, "You must answer on the floor.");

        if (floor.floorStatus == "Closed")
            throw new Meteor.Error(413, "The floor is closed.");

        if (!this.isSimulation) {
            questionAttributes.answerBody = sanitizeHtml(questionAttributes.answerBody, {
                allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span'],
                allowedAttributes: {
                    'a': ['href', 'target']
                }
            });
        }

        //update question
        Questions.update({
            _id: questionAttributes.questionId
        }, {
            $set: {
                answerUserId: user._id,
                answerAuthor: user.profile.name,
                answerSubmitted: new Date().getTime(),
                modified: new Date().getTime(),
                answerVotes: 0,
                answerBody: questionAttributes.answerBody,
                rawAnswerBody: questionAttributes.rawAnswerBody
            }
        });

        var question = Questions.findOne(questionAttributes.questionId);

        //update the floor with the number of answers
        Floors.update(question.floorId, {
            $inc: {
                answersCount: 1
            }
        });


        //create notification , informing poster that there has been an answer

        createAnswerNotification(question);
        Alerts.insert({
            title: 'You Have Answers',
            userId: question.userId,
            message: 'The host has answered your question.',
            url: '/floors/'+floor._id,
            seen: false,
            alertType: 'info',
            floorId: floor._id
        });
        return question._id;
    },
    flagQuestion: function(question) {
        var user = Meteor.user();
        var floor = Floors.findOne(question.floorId);

        if (!user)
            throw new Meteor.Error(401, "You need to login to flag");

        if (user._id != floor.userId)
            throw new Meteor.Error(401, "Only the host can flag a question.");

        Questions.update({
            _id: question._id
        }, {
            $set: {
                flagged: true
            }
        });

        Floors.update(question.floorId, {
            $inc: {
                questionsCount: -1
            }
        });
        //if not localhost, post to slack
        if (Meteor.openFloorFunctions.url_domain(Meteor.absoluteUrl()) != 'localhost:3000') {
            if (!this.isSimulation) {
                slack.send({
                    channel: '#openfloor',
                    unfurl_links: 1,
                    text: floor.host + ' just flagged a question. ( ' + floor.shortUrl + ' ) Question: ' + question.body,
                    username: '[QuestionFlagged] - OpenFloor App'
                });
            }
        }

        return 'success';
    },
    upvoteQuestion: function(questionId) {
        var user = Meteor.user();
        if (!user)
            throw new Meteor.Error(401, "You need to login to upvote");

        Questions.update({
            _id: questionId,
            upvoters: {
                $ne: user._id
            }
        }, {
            $addToSet: {
                upvoters: user._id
            },
            $inc: {
                votes: 1
            }
        });
    },
    removeQuestionVote: function(questionId) {
        var user = Meteor.user();
        if (!user)
            throw new Meteor.Error(401, "You need to login to remove vote");

        Questions.update({
            _id: questionId,
            upvoters: {
                $exists: user._id
            }
        }, {
            $pull: {
                upvoters: user._id
            },
            $inc: {
                votes: -1
            }
        });
    },
    upvoteAnswer: function(questionId) {
        var user = Meteor.user();
        if (!user)
            throw new Meteor.Error(401, "You need to login to upvote");

        Questions.update({
            _id: questionId,
            answerUpvoters: {
                $ne: user._id
            }
        }, {
            $addToSet: {
                answerUpvoters: user._id
            },
            $inc: {
                answerVotes: 1
            }
        });
    },
    removeAnswerVote: function(questionId) {
        var user = Meteor.user();
        if (!user)
            throw new Meteor.Error(401, "You need to login to remove vote");

        Questions.update({
            _id: questionId,
            answerUpvoters: {
                $exists: user._id
            }
        }, {
            $pull: {
                answerUpvoters: user._id
            },
            $inc: {
                answerVotes: -1
            }
        });
    }
});
