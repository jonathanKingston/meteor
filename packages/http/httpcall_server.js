Meteor.http = Meteor.http || {};

(function() {

  var http = __meteor_bootstrap__.require('http');
  var https = __meteor_bootstrap__.require('https');
  var url_util = __meteor_bootstrap__.require('url');


  Meteor.http.call = function(method, url, options, callback) {

    if (! callback && typeof options === "function") {
      // support (method, url, callback) argument list
      callback = options;
      options = null;
    }

    options = options || {};

    method = (method || "").toUpperCase();

    if (! /^https?:\/\//.test(url))
      throw new Error("url must be absolute and start with http:// or https://");

    var url_parts = url_util.parse(url);

    var path = Meteor.http._buildPath(url_parts.pathname, url_parts.search,
                                      options.query, options.params);

    var req_options = {
      method: method,
      host: url_parts.host,
      port: url_parts.port,
      path: path
    };


    var httplib = (url_parts.protocol === "https" ? https : http);
    // XXX make sync version
    httplib.request(req_options, function(error, res) {
      if (error) {
        callback(error);
        return;
      }

      var chunks = [];
      res.setEncoding("utf8");
      res.on("data", function(chunk) {
        chunks.push(chunk); });

      var finish = function(error) {
        var response = null;

        if (! error) {

          response = {};
          response.statusCode = res.statusCode;
          response.content = function() {
            return chunks.join('');
          };
          response.data = function() {
            return JSON.parse(response.content());
          };

          var error = null;
          if (res.statusCode >= 400)
            error = new Error("failed");
        }

        callback(error, response);

      };

      res.on("end", finish);
      res.on("error", finish);
    });

  };

})();