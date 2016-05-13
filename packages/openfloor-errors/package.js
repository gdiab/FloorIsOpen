Package.describe({
  summary: "A pattern to display application errors to the user"
});

Package.on_use(function (api, where) {
  api.use(['minimongo'], 'client');

  api.add_files('errors.js', ['client']);
  
  if (api.export) 
    api.export('Errors');
});

