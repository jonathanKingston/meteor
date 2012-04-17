Meteor.http = Meteor.http || {};

(function() {

  Meteor.http.call = function(method, url, options, callback) {
    if (! callback && typeof options === "function") {
      // support (method, url, callback) argument list
      callback = options;
      options = null;
    }

    options = options || {};

    if (typeof callback !== "function")
      throw new Error(
        "Can't make a blocking HTTP call from the client; callback required.");

    method = (method || "").toUpperCase();
    if (method !== "GET" && method !== "POST")
      throw new Error("HTTP method on client must be GET or POST.");

    var req = new XMLHttpRequest();

    var query_match = /^(.*?)(\?.*)?$/.exec(url);
    url = Meteor.http._buildPath(query_match[1], query_match[2],
                                 options.query, options.params);


    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    xhr.onreadystatechange = function(evt) {
      if (xhr.readyState === 4) { // COMPLETE
        if (! xhr.status) {
          // no HTTP response
          callback(new Error("network"), null);
        } else {
          var response = {};
          response.statusCode = xhr.status;
          response.content = function() {
            return xhr.responseText;
          };
          response.data = function() {
            return JSON.parse(response.content());
          };

          var error = null;
          if (xhr.status >= 400)
            error = new Error("failed");

          callback(error, response);
        }
      }
    };

    xhr.send(null); // XXX post content
  };




})();

