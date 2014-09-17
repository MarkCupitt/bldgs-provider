
var Request = (function() {

  function Request(options) {
    options = options || {};
    var cache = this._cache = {};
    var time =  this._time = 0;
    var maxAge = options.maxAge || 5;

    setInterval(function() {
      for (var url in cache) {
        if (cache[url].time < time) {
          delete cache[url];
        }
      }
      time = Date.now();
    }, maxAge*60*1000);
  };

  var proto = Request.prototype;

  proto.get = function(url, callback) {
    var cache = this._cache;
    if (cache[url]) {
      if (typeof callback === 'function') {
        callback(cache[url].json);
      }
      return;
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (!xhr.status || xhr.status < 200 || xhr.status > 299) {
        return;
      }
      var json;
      if (xhr.responseText) {
        try {
          json = JSON.parse(xhr.responseText);
        } catch(ex) {}
      }

      cache[url] = { json:json, time:Date.now() };

      if (typeof callback === 'function') {
        callback(json);
      }
    };

    xhr.open('GET', url);
    xhr.send(null);
    return xhr;
  };

  return Request;

}());
