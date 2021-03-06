TwitterApi = function(options) {
  this._url = "https://api.twitter.com";
  this._version = "1.1";
  this.app_auth_token = "";
  if (options) _.extend(this, options);
};

TwitterApi.prototype._getUrl = function(url){
  return [this._url, this._version, url].join('/');
};

TwitterApi.prototype.get = function(url, params){
  return this.call('GET',url,params);
};

TwitterApi.prototype.getnew = function(url, params,accessToken,accessTokenSecret){
  return this.callnew('GET',url,params,accessToken,accessTokenSecret);
};


TwitterApi.prototype.post = function(url, params){
  return this.call('POST',url,params);
};

TwitterApi.prototype.call = function(method, url, params){
  //this.unblock();

  oauthBinding = this.getOauthBindingForCurrentUser();

  result = oauthBinding.call(method,
    this._getUrl(url),
    params
  );

  return result;
};

TwitterApi.prototype.callnew = function(method, url, params,accessToken,accessTokenSecret){
  //this.unblock();

  oauthBinding = this.getOauthBindingForUserLoggingIn(accessToken,accessTokenSecret);

  result = oauthBinding.call(method,
    this._getUrl(url),
    params
  );

  return result;
};


TwitterApi.prototype.callAsApp = function(method, url, params){

  this.createApplicationToken();

  result = Meteor.http.call(method,
    this._getUrl(url), {
    params : params,
    headers : {
      'Authorization': 'Bearer ' + this.app_auth_token
    }
  });
  //00console.log(result);
  return result;
};

TwitterApi.prototype.getOauthBinding = function() {
  var config = Accounts.loginServiceConfiguration.findOne({service: 'twitter'});

  var urls = {
    requestToken: "https://api.twitter.com/oauth/request_token",
    authorize: "https://api.twitter.com/oauth/authorize",
    accessToken: "https://api.twitter.com/oauth/access_token",
    authenticate: "https://api.twitter.com/oauth/authenticate"
  };

  return new OAuth1Binding(config, urls);
};

TwitterApi.prototype.getOauthBindingForCurrentUser = function(){
  var oauthBinding = this.getOauthBinding();

  var user = Meteor.user();
  oauthBinding.accessToken = user.services.twitter.accessToken;
  oauthBinding.accessTokenSecret = user.services.twitter.accessTokenSecret;

  return oauthBinding;
};

TwitterApi.prototype.getOauthBindingForUserLoggingIn = function(accessToken,accessTokenSecret){
  var oauthBinding = this.getOauthBinding();

  oauthBinding.accessToken = accessToken;
  oauthBinding.accessTokenSecret = accessTokenSecret;

  return oauthBinding;
};

TwitterApi.prototype.publicTimeline = function() {
  return this.get('statuses/sample.json');
};

TwitterApi.prototype.userTimeline = function() {
  return this.get('statuses/user_timeline.json');
};

TwitterApi.prototype.homeTimeline = function() {
  return this.get('statuses/home_timeline.json');
};

TwitterApi.prototype.postTweet = function(text, reply_to){
  tweet = {
    status: text,
    in_reply_to_status_id: reply_to || null
  };

  return this.post('statuses/update.json', tweet);
};

TwitterApi.prototype.follow = function(screenName){
  return this.post('friendships/create.json',{screen_name: screenName, follow: true});
};

TwitterApi.prototype.getLists = function(user) {
  if (user) {
    return this.get("lists/list.json", {
      screen_name: user
    });
  } else {
    return this.get("lists/list.json");
  }
};

TwitterApi.prototype.getListMembers = function(listId, cursor) {
  if (cursor === null) {
    cursor = "-1";
  }
  return this.get("lists/members.json", {
    list_id: listId,
    cursor: cursor
  });
};

TwitterApi.prototype.usersSearch = function(query, page, count, includeEntities) {
  if (page === null) {
    page = 0;
  }
  if (count === null) {
    count = 10;
  }
  if (includeEntities === null) {
    includeEntities = true;
  }
  return this.get("users/search.json", {
    q: query,
    page: page,
    count: count,
    include_entities: includeEntities
  });
};

TwitterApi.prototype.search = function (query) {

  return this.callAsApp('GET', 'search/tweets.json', {
    'q': query
  });
};

TwitterApi.prototype.createApplicationToken = function() {
  console.log('TwitterApi.prototype.createApplicationToken');
  var url = 'https://api.twitter.com/oauth2/token'
  var config = Accounts.loginServiceConfiguration.findOne({service: 'twitter'});
  var base64AuthToken = new Buffer(config.consumerKey + ":" + config.secret).toString('base64');
  //console.log(config);
  var result = Meteor.http.post(url, {
    params: {
      'grant_type': 'client_credentials'
    },
    headers: {
      'Authorization': 'Basic ' + base64AuthToken,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  });
  this.app_auth_token = result.data.access_token;
  console.log(this.app_auth_token);
  return this.app_auth_token;
};