
Meteor.http = Meteor.http || {};

(function() {

  Meteor.http._buildPath = function(before_qmark, from_qmark, opt_query, opt_params) {
    var url_without_query = before_qmark;
    var query = from_qmark ? from_qmark.slice(1) : null;

    if (typeof opt_query === "string")
      query = String(opt_query);

    if (opt_params) {
      query = query || "";
      _.each(opt_params, function(value, key) {
        if (query)
          query += "&";
        query += (encodeURIComponent(key) + '=' + encodeURIComponent(value));
      });
    }

    var url = url_without_query;
    if (query !== null)
      url += ("?"+query);

    return url;
  };

})();