Transactions = new Meteor.Collection('transactions');

Meteor.methods({
    upgradeUser: function(transactionAttributes) {
        var now = new Date().getTime();
        var user = Meteor.user();

        if (!user)
            throw new Meteor.Error(401, "You need to login to Open the Floor");

        //pick out the whitelisted keys
        var transaction = _.extend(_.pick(transactionAttributes, 'plan', 'planPrice', 'userIntercomHash'), {
            userId: user._id,
            submitted: now,
            stripeCustomerId: transactionAttributes.id

        });

        var transactionId = Transactions.insert(transaction);
        Meteor.users.update(Meteor.userId(), {
            $set: {
                userSubscriptionStatus: transactionAttributes.plan,
                'profile.last_name': transactionAttributes.last_name,
                'profile.first_name': transactionAttributes.first_name,
                'profile.email': transactionAttributes.email
            }
        });
        if (!this.isSimulation) {
            now = (now / 1000);
            console.log(user);
            var metadata = {
                event_name: 'upgraded',
                user_id: transaction.userIntercomHash,
                created: now | 0,
                plan: transactionAttributes.plan
            };
            ic.createEvent(metadata, function(err, res) {
                if(err) {
                    console.log(err);
                }
            });
            ic.createTag({
                name: 'upgraded-' + transactionAttributes.plan,
                users: [{
                    user_id: transaction.userIntercomHash
                }]
            }, function(err, res) {
                if(err) {
                    console.log(err);
                }
            });
        }
    }
});
