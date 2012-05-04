Package.describe({
  summary: "Stellar is a basic MVC framework to sit on top of Backbone and Meteor"
});

Package.on_use(function (api) {
  api.use(['backbone'], 'client');

  //TODO seperate out these now this is a package
  api.add_files(['stellar.js'], ['client', 'server']);
});