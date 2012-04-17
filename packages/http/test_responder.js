
var respond = function(req, res) {
  var url = req.url;

  var response_data = {
    url: url
  };
  var response_string = JSON.stringify(response_data);

  res.statusCode = 200;
  res.end(response_string);
};

var run_responder = function() {

  var app = __meteor_bootstrap__.app;
  app.stack.unshift({ route: '/test_responder', handle: respond });

};

run_responder();
