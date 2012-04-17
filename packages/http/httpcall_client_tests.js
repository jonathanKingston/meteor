

testAsyncMulti("httpcall - client basic", [
  function(test, expect) {
    Meteor.http.call("GET", "/test_responder/foo",
                     expect(function(error, result) {
                       test.isFalse(error);
                       test.equal(typeof result, "object");
                       test.equal(result.statusCode, 200);

                       var data = result.data();
                       test.equal(data, {url: "/foo"});
                     }));
  }
]);

