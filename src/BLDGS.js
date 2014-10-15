
// TODO: load tiles for a bbox
// TODO: allow WMS calls

var BLDGS = (function() {

  var baseURL = 'http://data.osmbuildings.org/0.2/';

//  // http://mathiasbynens.be/notes/localstorage-pattern#comment-9
//  var storage;
//  try {
//    storage = localStorage;
//  } catch (ex) {
//    storage = (function() {
//      return {
//        getItem: function() {},
//        setItem: function() {}
//      };
//    }());
//  }

  var cache = JSON.parse(storage.getItem('BLDGS') || '{}');

  function xhr(url, callback) {
    if (cache[url]) {
      if (callback) {
        callback(cache[url].json);
      }
      return;
    }

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
        cache[url] = { json: json, time: Date.now() };
        callback(json);
      }
    };

    req.open('GET', url);
    req.send(null);

    return req;
  }

  function BLDGS(options) {
    options = options || {};

    baseURL += (options.key || 'anonymous');

    var maxAge = options.maxAge || 5*60*1000;

    setInterval(function() {
      var minTime = Date.now()-maxAge;
      var newCacheData = {};
      for (var key in cache) {
        if (cache[key].time >= minTime) {
          newCacheData[key] = cache[key];
        }
      }
      cache = newCacheData;
    }, maxAge);
  };

  var proto = BLDGS.prototype;

  proto.getTile = function(x, y, zoom, callback) {
    var url = baseURL +'/tile/'+ zoom +'/'+ x +'/'+ y +'.json';
    xhr(url, callback);
  };

  proto.getFeature = function(id, callback) {
    var url = baseURL +'/feature/'+ id +'.json';
    xhr(url, callback);
  };

  // TODO: optionally drop unused tiles
  // TODO: load from center (CAM POS) out

  proto.updateBBox = function(x, y, w, h, zoom, callback) {
    var
      tileSize = 256,
      fixedZoom = 16,
      realTileSize = zoom > fixedZoom ? tileSize <<(zoom-fixedZoom) : tileSize >>(fixedZoom-zoom),
      minX = x/realTileSize <<0,
      minY = y/realTileSize <<0,
      maxX = Math.ceil((x+w)/realTileSize),
      maxY = Math.ceil((y+h)/realTileSize),
      tx, ty;

    for (ty = minY; ty <= maxY; ty++) {
      for (tx = minX; tx <= maxX; tx++) {
        this.getTile(tx, ty, fixedZoom, callback);
      }
    }
  };

//  try {
//    storage.setItem('BLDGS', JSON.stringify(cache));
//  } catch(ex) {}

  return BLDGS;

}());
