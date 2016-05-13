# OpenFloor

OpenFloor was a hyper-engaged Q&A platform created while participating in the [Mill Idea Accelerator](http://themill.vc/ideas) and was written with the Meteor framework (version 1.0.1). We decided to shutter the project, thinking we might find some pivot or twist to the idea, but alas, we moved on and I felt like I should share the project with anyone who wants to move it forward or raid the project for useful code snippets.

## Meteor
This app uses [Meteor](https://www.meteor.com/) as the framework. There are tons of places to learn how to get started, if you aren't already familiar. I suggest starting here: [discovermeteor.com](https://www.discovermeteor.com/blog/getting-started-with-meteor/)

## Configuration

1. There is some environment variables in /server/account.js that look to Environment Variables. If you are running locally, you will need to set those before running. Something like this:

```
export TWITTER_SECRET="YOUR_TWIITER_SECRET"
export TWITTER_ID="YOUR_TWITTER_ID"
...

```
Here is the list of all the environment vars necessary as it exists currently:
- TWITTER_SECRET
- TWITTER_KEY
- FB_ID
- FB_SECRET
- INTERCOM_ID
- INTERCOM_SECRET

I suggest a little batch file to set these and run meteor, as it can become a burden to reset this vars with a fresh terminal instance.

2. You will need to create a settings.json for bitly, stripe, intercom, google analytics, slack, and sendgrid configuration. Example below:

```
{
    "bitly": "<bitly key>",
    "slack": "https://<slack room>.slack.com/services/hooks/incoming-webhook?token=<slack token>",
    "public": {
        "ga": {
            "account": "<google analytics account>",
            "trackInterests": true
        },
        "Stripe" : {
          "publicKey" : "<stripe public key>"
        },
        "intercom": {
            "widget": {
              "activator": "#IntercomDefaultWidget"
            },
            "id": "<intercom id>"
        }
    },
    "sendgrid_user": "<sendgrid user>",
    "sendgrid_key": "<sendgrid key>",
    "intercom": {
        "secret": "<intercom secret>"
    },
    "Stripe" : {
        "secretKey" : "<stripe secret key>"
    }
}
```

