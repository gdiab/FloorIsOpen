/* 
 * @Author: georgediab
 * @Date:   2014-05-30 22:59:09
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-10-18 22:55:18
 * @File: router.js
 */

var preloadSubscriptions = [];
preloadSubscriptions.push('alerts');
preloadSubscriptions.push('notifications');
preloadSubscriptions.push('you');


Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    yieldTemplates: {
    'vegastech': {to: 'vegastech'}
    },
    waitOn: function() {
        return _.map(preloadSubscriptions, function(sub) {
            // can either pass strings or objects with subName and subArguments properties
            if (typeof sub === 'object') {
                Meteor.subscribe(sub.subName, sub.subArguments);
            } else {
                Meteor.subscribe(sub);
            }
        });
    },
    onBeforeAction: function() {
        this.next();
    }
});

var coreSubscriptions = new SubsManager({
    cacheLimit: 10,
    expireIn: 5
});

FloorsListController = RouteController.extend({
    template: 'floorsList',
    increment: 10,
    limit: function() {
        return parseInt(this.params.floorsLimit) || this.increment;
    },
    findOptions: function() {
        return {
            sort: this.sort,
            limit: this.limit()
        };
    },
    floors: function() {
        return Floors.find({
        }, this.findOptions());
    },
    data: function() {
        var hasMore = this.floors().count() === this.limit();
        return {
            floors: this.floors(),
            nextPath: hasMore ? this.nextPath() : null
        };
    },
    onBeforeAction: function(pause) {
        return [
            Meteor.subscribe('publicFloors', this.findOptions()),
            Meteor.subscribe('publicFloorsListUsers', this.findOptions()),
            this.next()
        ];
    }
    // ,
    // fastRender: true
});

MyFloorsListController = RouteController.extend({
    template: 'floorsList',
    increment: 10,
    limit: function() {
        return parseInt(this.params.floorsLimit) || this.increment;
    },
    findOptions: function() {
        return {
            sort: {
                submitted: -1
            },
            limit: this.limit()
        };
    },
    floors: function() {
        return Floors.find({
            userId: Meteor.userId()
        }, this.findOptions());
    },
    data: function() {
        var hasMore = this.floors().count() === this.limit();
        return {
            floors: this.floors(),
            nextPath: hasMore ? this.nextPath() : null
        };
    },
    waitOn: function() {
        return [Meteor.subscribe('myFloors', Meteor.userId(), this.findOptions()),
            coreSubscriptions.subscribe('floorsListUsers', this.findOptions())
        ]
    },
    nextPath: function() {
        return Router.routes.myFloors.path({
            floorsLimit: this.limit() + this.increment
        });
    }
});

NewFloorsListController = FloorsListController.extend({
    sort: {
        openOn: -1,
        submitted: -1
        //,
        // _id: -1
    },
    nextPath: function() {
        return Router.routes.newFloors.path({
            floorsLimit: this.limit() + this.increment
        });
    }
});

BestFloorsListController = FloorsListController.extend({
    sort: {
        votes: -1,
        openOn: -1,
        submitted: -1
        //_id: -1
    },
    nextPath: function() {
        return Router.routes.bestFloors.path({
            floorsLimit: this.limit() + this.increment
        })
    }
    // ,
    // fastRender: true
});

Router.map(function() {
    this.route('profilePage', {
        path: '/profile',
        layoutTemplate: 'layoutNoAds',
        data: function() {
            return User.findOne({
                _id: Meteor.userId()
            });
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        waitOn: function() {
            return [Meteor.subscribe('you'),Meteor.subscribe('allUsernames')];
        }
    });

    this.route('privacy', {
        path: '/privacy',
        layoutTemplate: 'layoutNoAds',
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        onBeforeAction: function() {
            $('html, body').animate({
                scrollTop: 0
            }, 400);
            this.next();
        }
    });

    this.route('terms', {
        path: '/terms',
        layoutTemplate: 'layoutNoAds',
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        onBeforeAction: function() {
            $('html, body').animate({
                scrollTop: 0
            }, 400);
            this.next();
        }
    });



    this.route('userProfile', {
        path: '/profile/:username?',
        layoutTemplate: 'layoutNoAds',
        data: function() {
            return User.findOne({
                'profile.username': this.params.username
            });
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        waitOn: function() {
            return Meteor.subscribe('user', this.params.username);
        }
    });

    this.route('pricingInfo', {
        path: '/pricing-info/:plan?',
        //layoutTemplate: 'layout',
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        onBeforeAction: function() {
            $('html, body').animate({
                scrollTop: 0
            }, 400);
            this.next();
        },
        waitOn: function() {
            return Meteor.subscribe('activePlans');
        },
        fastRender: true
    });

    this.route('feedbackSubmit', {
        path: '/feedback',
        //layoutTemplate: 'layout',
        data: function() {
            return Meteor.user();
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        }
        // ,
        // fastRender: true
    });

    this.route('notificationsList', {
        path: '/notifications',
        //layoutTemplate: 'layout',
        data: function() {
            return [Notifications.find({
                userId: Meteor.userId()
            }), Floors.find({
                userId: Meteor.userId()
            })];
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        waitOn: function() {
            return [Meteor.subscribe('notifications', this.userId), Meteor.subscribe('myFloors', Meteor.userId())];
        }
    });

    this.route('landingPage', {
        path: '/',
        template: 'landingPage',
        layoutTemplate: 'landingLayout',
        waitOn: function() {
            return;
        },
        onAfterAction: function() {
            GAnalytics.pageview();
            SEO.set({
                title: 'OpenFloor : Main',
                meta: {
                    'description': 'OpenFloor changes engagement through short, real-time Q&A'
                },
                og: {
                    'title': 'OpenFloor',
                    'description': 'Real-Time Q&A'

                },
                twitter: {
                    'card': 'summary'
                }
            });
        }
        // ,
        // fastRender: true
    });

    this.route('main', {
        path: '/floorisopen',
        //layoutTemplate: 'layout',
        controller: NewFloorsListController,
        onAfterAction: function() {
            GAnalytics.pageview();
            SEO.set({
                title: 'OpenFloor : Main',
                meta: {
                    'description': 'Floor List'
                },
                og: {
                    'title': 'OpenFloor',
                    'description': 'Main Floor List Page'

                }
            });
        }
        //,
        //fastRender: true
    });

    this.route('about', {
        path: '/about',
        //layoutTemplate: 'layout',
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        onBeforeAction: function() {
            $('html, body').animate({
                scrollTop: 0
            }, 400);
            this.next();
        }
        //,
        //fastRender: true
    });

    this.route('pricing', {
        path: '/pricing',
        //layoutTemplate: 'layout',
        onAfterAction: function() {
            GAnalytics.pageview();
        },
        onBeforeAction: function() {
            $('html, body').animate({
                scrollTop: 0
            }, 400);
            this.next();
        }
        //,
        //fastRender: true
    });

    this.route('newFloors', {
        path: '/new/:floorsLimit?',
        //layoutTemplate: 'layout',
        controller: NewFloorsListController,
        onAfterAction: function() {
            GAnalytics.pageview();
        }
        //,
        //fastRender: true
    });

    this.route('bestFloors', {
        path: '/popular/:floorsLimit?',
        //layoutTemplate: 'layout',
        controller: BestFloorsListController,
        onAfterAction: function() {
            GAnalytics.pageview();
        }
        //,
        //fastRender: true
    });

    this.route('myFloors', {
        path: '/mine/:floorsLimit?',
        //layoutTemplate: 'layout',
        controller: MyFloorsListController,
        onAfterAction: function() {
            GAnalytics.pageview();
        }
        //,
        //fastRender: true
    });

    this.route('floorEdit', {
        path: '/floors/:_id/edit',
        //layoutTemplate: 'layout',
        waitOn: function() {
            return Meteor.subscribe('singleFloor', this.params._id);
        },
        data: function() {
            return Floors.findOne(this.params._id);
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        }
        //,
        //fastRender: true
    });

    //path: '/posts/:paramOne/:paramTwo'
    this.route('userFloorPage', {
        path: '/floors/:_username/:_floorNumber',
        //layoutTemplate: 'layout',
        waitOn: function() {

            var username = this.params._username;
            var floorNumber = this.params._floorNumber;

            var floor = Floors.findOne({
                $and: [{
                    "hostUsername": username
                }, {
                    "floorNumber": parseInt(floorNumber)
                }]
            });
            if (floor) {
                return [
                    Meteor.subscribe('singleFloor', floor._id),
                    Meteor.subscribe('questions', floor._id),
                    Meteor.subscribe('floorUsers', floor._id),
                    coreSubscriptions.subscribe('myFloors', {
                        sort: {
                            submitted: -1
                        }
                    })
                ];
            }


        },
        data: function() {
            if (this.ready()) {
                var username = this.params._username;
                var floorNumber = this.params._floorNumber;
                var floor = Floors.findOne({
                    $and: [{
                        "hostUsername": username
                    }, {
                        "floorNumber": parseInt(floorNumber)
                    }]
                });
                if (!floor) {
                    this.render('notFound');
                } else {
                    return floor;
                }
            }

        },
        action: function() {
            if (this.ready()) {
                this.render('floorPage');
            }
        },
        onBeforeAction: function(pause) {
            // coreSubscriptions.subscribe('floors');
            // var username = this.params._username;
            // var floorNumber = this.params._floorNumber;
            // var floor = Floors.findOne({$and:[{"hostUsername": username}, {"floorNumber": parseInt(floorNumber)}]} );
            if (!this.ready()) {

                this.render('loading');
            }
            return [coreSubscriptions.subscribe('floors'),this.next()];
            // return [
            //     coreSubscriptions.subscribe('floors', this.findOptions()),
            //     coreSubscriptions.subscribe('floorsListUsers', this.findOptions())
            // ];
        },
        onAfterAction: function() {
            GAnalytics.pageview();
            var floor;

            if (!Meteor.isClient) {
                return;
            }
            floor = this.data();
            if (typeof floor !== 'undefined') {
                switch (floor.floorStatus) {
                    case 'Open':
                        SEO.set({
                            title: floor.host + '\'s OpenFloor',
                            meta: {
                                'description': floor.description
                            },
                            og: {
                                'url': floor.shortUrl,
                                'title': floor.host + '\'s OpenFloor',
                                'description': floor.rawTitle + ' For the next 15 minutes I will be answering your questions!'

                            },
                            twitter: {
                                'card': 'summary'
                            }
                        });
                        break;

                    case 'Scheduled':
                        SEO.set({
                            title: floor.host + '\'s OpenFloor',
                            meta: {
                                'description': floor.description
                            },
                            og: {
                                'url': floor.shortUrl,
                                'title': floor.host + '\'s OpenFloor',
                                'description': floor.rawTitle + ' - Opening soon!'

                            },
                            twitter: {
                                'card': 'summary'
                            }
                        });
                        break;


                    default:
                        SEO.set({
                            title: floor.host + '\'s OpenFloor',
                            meta: {
                                'description': floor.description
                            },
                            og: {
                                'url': floor.shortUrl,
                                'title': floor.host + '\'s OpenFloor',
                                'description': floor.rawTitle

                            },
                            twitter: {
                                'card': 'summary'
                            }
                        });
                        break;

                }
            }
        },
        fastRender: true
    });

    this.route('floorPage', {
        path: '/floors/:_id',
        onBeforeAction: function(pause) {
            if (!this.ready()) {
                this.render('loading');
             // otherwise the action will just render the main template.
          }
          this.next();
        },
        waitOn: function() {
            return [
                Meteor.subscribe('singleFloor', this.params._id),
                Meteor.subscribe('questions', this.params._id),
                Meteor.subscribe('floorUsers', this.params._id),
                coreSubscriptions.subscribe('myFloors', {
                    sort: {
                        submitted: -1
                    }
                })
            ];
        },
        data: function() {
            if (this.ready()) {

                var floor = Floors.findOne(this.params._id);
                if (!floor) {
                    this.render('notFound');
                } else {
                    return floor;
                }
            }

        },
        onAfterAction: function() {
            GAnalytics.pageview();
            var floor;

            if (!Meteor.isClient) {
                return;
            }
            floor = this.data();
            if (typeof floor !== 'undefined') {
                switch (floor.floorStatus) {
                    case 'Open':
                        SEO.set({
                            title: floor.host + '\'s OpenFloor',
                            meta: {
                                'description': floor.description
                            },
                            og: {
                                'url': floor.shortUrl,
                                'title': floor.host + '\'s OpenFloor',
                                'description': floor.rawTitle + ' For the next 15 minutes I will be answering your questions!'

                            }
                        });
                        break;

                    case 'Scheduled':
                        SEO.set({
                            title: floor.host + '\'s OpenFloor',
                            meta: {
                                'description': floor.description
                            },
                            og: {
                                'url': floor.shortUrl,
                                'title': floor.host + '\'s OpenFloor',
                                'description': floor.rawTitle + ' - Opening soon!'

                            }
                        });
                        break;


                    default:
                        SEO.set({
                            title: floor.host + '\'s OpenFloor',
                            meta: {
                                'description': floor.description
                            },
                            og: {
                                'url': floor.shortUrl,
                                'title': floor.host + '\'s OpenFloor',
                                'description': floor.rawTitle

                            },
                            twitter: {
                                'card': 'summary'
                            }
                        });
                        break;

                }
            }

        },
        fastRender: true
    });

    this.route('fqaPage', {
        path: '/fqa/:_id',
        //layoutTemplate: 'layout',
        waitOn: function() {
            return [
                Meteor.subscribe('singleQuestion', this.params._id),
                Meteor.subscribe('fqaFloor', this.params._id),
                Meteor.subscribe('fqaListUsers', this.params._id)
            ];
        },
        data: function() {

            return Questions.findOne(this.params._id);
        },
        onAfterAction: function() {
            GAnalytics.pageview();
            var question;

            if (!Meteor.isClient) {
                return;
            }
            question = this.data();
            //console.log(this.data());
            if (typeof question !== 'undefined') {
                var answerText = ((typeof question.rawAnswerBody == 'undefined') ? '' : question.rawAnswerBody);
                SEO.set({
                    title: question.rawBody,
                    meta: {
                        'description': answerText
                    },
                    og: {
                        'url': Router.current().route.path(this),
                        'title': question.rawBody,
                        'description': answerText

                    },
                    twitter: {
                        'card': 'summary'
                    }
                });
                
            }
        },
        floor: function() {
            return Floors.findOne({
                _id: this.params._id
            });
        }
        // ,
        // fastRender: true
    });

    this.route('sfqaPage', {
        path: '/s/:_id',
        template: 'fqaPage',
        waitOn: function() {
            return [
                Meteor.subscribe('singleQuestion', this.params._id),
                Meteor.subscribe('fqaFloor', this.params._id),
                Meteor.subscribe('fqaListUsers', this.params._id)
            ];
        },
        data: function() {

            return Questions.findOne(this.params._id);
        },
        onAfterAction: function() {
            GAnalytics.pageview();
            var question;

            if (!Meteor.isClient) {
                return;
            }
            question = this.data();
            //console.log(this.data());
            if (typeof question !== 'undefined') {
                var answerText = ((typeof question.rawAnswerBody == 'undefined') ? '' : question.rawAnswerBody);
                SEO.set({
                    title: question.rawBody,
                    meta: {
                        'description': answerText
                    },
                    og: {
                        'url': Router.current().route.path(this),
                        'title': question.rawBody,
                        'description': answerText

                    },
                    twitter: {
                        'card': 'summary'
                    }
                });
            }
        },
        floor: function() {
            return Floors.findOne({
                _id: this.params._id
            });
        }
    });

    this.route('oauthFacebookLink', {
        path: '/f_oauthlink',
        action: function() {
            var str = window.location.hash;
            str = str.split('&');
            var accessToken = str[0];
            var expiresIn = str[1];
            accessToken = accessToken.split('=');
            expiresIn = expiresIn.split('=');
            var result = {
                access_token: accessToken[1],
                expires_in: expiresIn[1]
            };
            Meteor.call('fblogin', result, function(error, result) {
                if (!error) {
                    Meteor.loginWithToken(result.token, function(err) {
                        if (err) {
                            Meteor._debug("Error logging in with token: " + err);
                            this.render('loginError');
                        } else {
                            //until I can figure out smarter routing, let's
                            //just send them to main
                            Router.go('main');
                        }
                    });
                } else {
                    this.render('loginError');
                }
            });
        }
    });

    this.route('oauthTwitterLink', {
        path: '/t_oauthlink',
        action: function() {
            //console.log('I made it to the router!');
            OAuth.callback('twitter', function(error, success) {
                // See the result below
                //console.log(error);
                //console.log(success);

                if (!error) {
                    var result = {
                        access_token: success.oauth_token,
                        access_token_secret: success.oauth_token_secret,
                        expires_in: new Date()
                    };
                    //console.log(result);
                    Meteor.call('twitterlogin', result, function(error, result) {
                        if (!error) {
                            Meteor.loginWithToken(result.token, function(err) {
                                if (err) {
                                    Meteor._debug("Error logging in with token: " + err);
                                    this.render('loginError');
                                } else {
                                    //until I can figure out smarter routing, let's
                                    //just send them to main
                                    Router.go('main');
                                }
                            });
                        } else {
                            this.render('loginError');
                        }

                    });
                }
            });


        }
    });

    this.route('floorSubmit', {
        path: '/submit',
        //layoutTemplate: 'layout',
        waitOn: function() {
            return Meteor.subscribe('myFloors', {
                sort: {
                    submitted: -1
                }
            });
        },
        data: function() {
            return Floors.find({
                userId: Meteor.userId(),
                floorStatus: 'Open'
            });
        },
        onBeforeAction: function() {
            return [Meteor.subscribe('myFloors', {
                sort: {
                    submitted: -1
                }
            }),this.next()];
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        }
        //,
        //fastRender: true
    });

    this.route('event', {
        path: '/events',
        //layoutTemplate: 'layout',
        waitOn: function() {
            return Meteor.subscribe('floors');
        },
        onBeforeAction: function() {
            return [Meteor.subscribe('floors'),this.next()];
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        }
        //,
        //fastRender: true
    });

    this.route('apiOpenFloors', {
        where: 'server',
        path: '/api/floors',
        action: function() {
            var parameters = this.request.query,
                limit = !!parameters.limit ? parseInt(parameters.limit) : 20,
                data = Floors.find({}, {
                    limit: limit,
                    fields: {
                        title: 1,
                        host: 1,
                        opened: 1,
                        floorStatus: 1,
                        submitted: 1
                    }
                }).fetch();
            this.response.write(JSON.stringify(data));
            this.response.end();
        },
        onAfterAction: function() {
            GAnalytics.pageview();
        }
    });

    this.route('apiFloors', {
        where: 'server',
        path: 'api/floors/:_id',
        action: function() {
            var floor = Floors.findOne(this.params._id);
            if (floor) {
                this.response.write(JSON.stringify(floor));
            } else {
                this.response.writeHead(404, {
                    'Content-Type': 'text/html'
                });
                this.response.write("Floor not found.");
            }
            this.response.end();
        },
        onAfterAction: function() {
            GAnalytics.pageview();

        }
    })

    /* catch all route for unhandled routes */
    this.route('notFound', {
        path: '*'
    });
});

var requireLogin = function(pause) {
    if (!Meteor.user()) {
        if (Meteor.loggingIn())
            this.render(this.loadingTemplate);
        else
            this.render('accessDenied');
        //console.log('am i here?');
        this.next();
    }
}

var canEditFloor = function(pause) {
    if (!Meteor.user()) {
        if (Meteor.loggingIn())
            this.render(this.loadingTemplate);
        else
            this.render('accessDenied');
        this.next();
    }
}

// if (Meteor.isClient) {
//     //Router.onBeforeAction('loading');
//     Router.onBeforeAction(requireLogin, {
//         only: ['floorSubmit']
//     });
// }
