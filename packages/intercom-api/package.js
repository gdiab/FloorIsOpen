Package.describe({
  summary: "meteor package for intercom API"
});

Npm.depends({
  "request": "2.36.0",
  "lodash": "2.4.1",
  "qs": "0.6.6",
  "debug": "0.8.1",
  "q": "1.0.1",
  "intercom.io": "1.0.3"
});

Package.on_use(function (api) {
	api.add_files('intercom_api.js', 'server');
	api.export("ic");
});