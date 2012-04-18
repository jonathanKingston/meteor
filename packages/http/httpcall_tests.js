

var _XHR_URL_PREFIX = "/test_responder";

testAsyncMulti("httpcall - basic", [
  function(test, expect) {
    if (Meteor.is_server && _XHR_URL_PREFIX.indexOf("http") !== 0) {
      var address = __meteor_bootstrap__.app.address();
      _XHR_URL_PREFIX = "http://127.0.0.1:" + address.port + _XHR_URL_PREFIX;
    }

    var basic_get = function(url, options, expected_url) {

      var callback = function(error, result) {
        test.isFalse(error);
        if (! error) {
          test.equal(typeof result, "object");
          test.equal(result.statusCode, 200);

          var data = result.data();
          test.equal(data.url, expected_url);
          test.equal(data.method, "GET");
        }
      };


      Meteor.http.call("GET", _XHR_URL_PREFIX+url, options, expect(callback));

      if (Meteor.is_server) {
        // test sync version
        var result = Meteor.http.call("GET", _XHR_URL_PREFIX+url, options);
        callback(result.error, result);
      }
    };

    basic_get("/foo", null, "/foo");
    basic_get("/foo?", null, "/foo?");
    basic_get("/foo?a=b", null, "/foo?a=b");
    basic_get("/foo", {params: {fruit: "apple"}},
              "/foo?fruit=apple");
    basic_get("/foo", {params: {fruit: "apple", dog: "Spot the dog"}},
              "/foo?fruit=apple&dog=Spot%20the%20dog");
    basic_get("/foo?", {params: {fruit: "apple", dog: "Spot the dog"}},
              "/foo?fruit=apple&dog=Spot%20the%20dog");
    basic_get("/foo?bar", {params: {fruit: "apple", dog: "Spot the dog"}},
              "/foo?bar&fruit=apple&dog=Spot%20the%20dog");
    basic_get("/foo?bar", {params: {fruit: "apple", dog: "Spot the dog"},
                           query: "baz"},
              "/foo?baz&fruit=apple&dog=Spot%20the%20dog");
    basic_get("/foo", {params: {fruit: "apple", dog: "Spot the dog"},
                       query: "baz"},
              "/foo?baz&fruit=apple&dog=Spot%20the%20dog");
    basic_get("/foo?", {params: {fruit: "apple", dog: "Spot the dog"},
                       query: "baz"},
              "/foo?baz&fruit=apple&dog=Spot%20the%20dog");
    basic_get("/foo?bar", {query: ""}, "/foo?");
    basic_get("/foo?bar", {params: {fruit: "apple", dog: "Spot the dog"},
                           query: ""},
              "/foo?fruit=apple&dog=Spot%20the%20dog");
  },
  function(test, expect) {

    // Accessing unknown server (should fail to make any connection)
    Meteor.http.call("GET", "http://asfd.asfd/", expect(
      function(error, result) {
        test.isTrue(error);
        test.isTrue(result);
        test.equal(error, result.error);
      }));

    // Following redirect
    Meteor.http.call("GET", _XHR_URL_PREFIX+"/redirect", expect(
      function(error, result) {
        test.isFalse(error);
        test.isTrue(result);

        // should be redirected transparently to /foo
        test.equal(result.statusCode, 200);
        var data = result.data();
        test.equal(data.url, "/foo");
        test.equal(data.method, "GET");
      }));

    // Server serves 500
    Meteor.http.call("GET", _XHR_URL_PREFIX+"/fail", expect(
      function(error, result) {
        test.isTrue(error);
        test.isTrue(result);
        test.equal(error, result.error);

        test.equal(result.statusCode, 500);
      }));

    // Timeout
    Meteor.http.call(
      "GET", _XHR_URL_PREFIX+"/slow",
      { timeout: 200 },
      expect(function(error, result) {
        test.isTrue(error);
        test.equal(error, result.error);
      }));
    Meteor.http.call(
      "GET", _XHR_URL_PREFIX+"/foo",
      { timeout: 2000 },
      expect(function(error, result) {
        test.isFalse(error);
        test.isTrue(result);
        test.equal(result.statusCode, 200);
        var data = result.data();
        test.equal(data.url, "/foo");
        test.equal(data.method, "GET");

      }));
  },
  function(test, expect) {
    var test_method = function(meth, should_throw) {
      var maybe_expect = (should_throw ? _.identity : expect);
      var func = function() {
        Meteor.http.call(
          meth, _XHR_URL_PREFIX+"/foo",
          maybe_expect(function(error, result) {
            test.isFalse(error);
            test.isTrue(result);
            test.equal(result.statusCode, 200);
            var data = result.data();
            test.equal(data.url, "/foo");
            test.equal(data.method, meth);
          }));
      };
      if (should_throw)
        test.throws(func);
      else
        func();
    };

    test_method("POST");
    test_method("PUT", Meteor.is_client);
    test_method("DELETE", Meteor.is_client);
  },
  function(test, expect) {
    Meteor.http.call(
      "POST", _XHR_URL_PREFIX+"/foo",
      { content: "Hello World!" },
      expect(function(error, result) {
        test.isFalse(error);
        test.isTrue(result);
        test.equal(result.statusCode, 200);
        var data = result.data();
        test.equal(data.body, "Hello World!");
      }));

    Meteor.http.call(
      "POST", _XHR_URL_PREFIX+"/data-test",
      { data: {greeting: "Hello World!"} },
      expect(function(error, result) {
        test.isFalse(error);
        test.isTrue(result);
        test.equal(result.statusCode, 200);
        var data = result.data();
        test.equal(data.body, {greeting: "Hello World!"});
      }));
  }
]);


// TO TEST:
// - Redirects nofollow
// - in IE
// - form-encoding params
// - https
// - headers
// - cookies?
// - basicauth
// - human-readable error reason/cause?
