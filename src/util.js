function loadJSON(url, callback) {
  var req = new XMLHttpRequest();

  req.onreadystatechange = function() {
    if (req.readyState !== 4) {
      return;
    }
    if (!req.status || req.status < 200 || req.status > 299) {
      return;
    }
    if (callback && req.responseText) {
      var json;
      try {
        json = JSON.parse(req.responseText);
      } catch(ex) {}

      callback(json);
    }
  };

  req.open('GET', url);
  req.send(null);

  return req;
}
