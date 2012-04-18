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

    // wrap callback to always return a result object, and always
    // have an 'error' property in result
    callback = (function(callback) {
      return function(error, result) {
        result = result || {};
        result.error = error;
        callback(error, result);
      };
    })(callback);


    callback = _.once(callback); // only call the callback once!


    method = (method || "").toUpperCase();
    if (method !== "GET" && method !== "POST")
      throw new Error("HTTP method on client must be GET or POST.");

    var req = new XMLHttpRequest();

    var query_match = /^(.*?)(\?.*)?$/.exec(url);
    url = Meteor.http._buildUrl(query_match[1], query_match[2],
                                options.query, options.params);


    var content = options.content;
    if (options.data)
      content = JSON.stringify(options.data);


    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    var timed_out = false;
    var timer;
    if (options.timeout) {
      var timer = Meteor.setTimeout(function() {
        timed_out = true;
        xhr.abort();
      }, options.timeout);
    };


    xhr.onreadystatechange = function(evt) {
      if (xhr.readyState === 4) { // COMPLETE
        if (timer)
          Meteor.clearTimeout(timer);

        if (timed_out) {
          callback(new Error("timed out"));
        } else if (! xhr.status) {
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

    xhr.send(content);
  };




})();

