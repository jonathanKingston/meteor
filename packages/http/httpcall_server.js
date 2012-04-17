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


    var fut;
    if (! callback) {
      // Sync mode
      fut = new Future;
      callback = function(error, result) {
        fut.ret(result);
      };
    } else {
      // Async mode
      // re-enter user code in a Fiber
      callback = Meteor.bindEnvironment(callback, function(e) {
        Meteor._debug("Exception in callback of Meteor.http.call", e.stack);
      });
    }

    callback = _.once(callback); // only call the callback once!

    if (! /^https?:\/\//.test(url))
      throw new Error("url must be absolute and start with http:// or https://");

    var url_parts = url_util.parse(url);

    var path = Meteor.http._buildPath(url_parts.pathname, url_parts.search,
                                      options.query, options.params);

    var req_options = {
      method: method,
      host: url_parts.hostname,
      port: url_parts.port,
      path: path
    };


    var httplib = (url_parts.protocol === "https" ? https : http);
    // XXX make sync version
    var req = httplib.request(req_options, function(res) {

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

          if (res.statusCode >= 400)
            error = new Error("failed");
        }

        callback(error, response);

      };

      res.on("end", finish); // calls finish()
      res.on("error", finish); // calls finish(error)
    });

    req.on("error", callback); // calls callback(error)

    req.end();

    if (fut)
      return fut.wait(); // block in sync mode
  };

})();