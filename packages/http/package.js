Package.describe({
  summary: "Make HTTP calls to remote servers"
});

Package.on_use(function (api) {
  api.add_files('httpcall_client.js', 'client');
  api.add_files('httpcall_server.js', 'server');
});

Package.on_test(function (api) {
  // XXX add tests
});
