Package.describe({
  summary: "Subsciptions with Stripe",
  version: "0.0.1",
  name: "openfloor-stripe",
  git: ""
});

Npm.depends({ "stripe": "2.8.0" });

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.1');
  api.use('underscore');
  api.use('templating', 'client');

  var client = ['stripe_checkout.js', 'stripe_client.js', 'stripe_easy_client.js', 'stripe_easy_inputs.html', 'stripe_easy_inputs.js'];
  var server = ['stripe_easy_server.js'];

  api.addFiles(client, 'client');
  api.addFiles(server, 'server');

  api.export('StripeEasy', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('stripe');
  api.addFiles('stripe-tests.js');
});
