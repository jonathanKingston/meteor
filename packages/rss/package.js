Package.describe({
  summary: "RSS rendering with Meteor"
});

var fs = require('fs');

Package.register_extension(
  "rss.js", function(bundle, source_path, serve_path, where) {
    serve_path = serve_path.substring(0, serve_path.length - 3); //remove .js extension
    var contents = fs.readFileSync(source_path);
    contents = eval(' ' + contents.toString('utf8'));
    contents = new Buffer(contents+"\n"); //Add in new line otherwise no output crashes this :(

    bundle.add_resource({
      type: "xml",
      path: serve_path,
      data: contents,
      where: where
    });
  }
);