//Package.js
Package.on_use(function(api) {
    api.use('twitter')
    api.imply('twitter')

    api.add_files('wrapper.js')
});
