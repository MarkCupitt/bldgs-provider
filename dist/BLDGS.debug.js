var BLDGS = (function(window) {

var cache = {
  data: {},
  index: [],
  totalSize: 0,
  maxSize: 1024*1024, // 1MB

  setSize: function(maxSize) {
    this.maxSize = maxSize;
  },

  set: function(key, value) {
    this.data[key] = value;
    var size = (''+ value).length;
    this.index.push({ key: key, size: size });
    this.totalSize += size;
    this.purge();
  },

  get: function(key) {
    return this.data[key];
  },

  has: function(key) {
    return this.data[key] !== undefined;
  },

  purge: function() {

    setTimeout(function() {
      while (cache.totalSize > cache.maxSize) {
        var item = cache.index.shift();
        cache.totalSize -= item.size;
        delete cache.data[item.key];
      }
    }, 0);
  },

  clear: function() {
    this.data = {};
    this.index = [];
    this.totalSize = 0;
  }
};

function loadJSON(url, callback) {
  if (cache.has(url)) {
    if (callback) {
      callback(cache.get(url));
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

      cache.set(url, json);
      callback(json);
    }
  };

  req.open('GET', url);
  req.send(null);

  return req;
}


var baseURL = 'http://data.osmbuildings.org/0.2/';

function BLDGS(options) {
  options = options || {};
  baseURL += (options.key || 'anonymous');
  if (options.cacheSize !== undefined) {
    cache.setSize(options.cacheSize);
  }
}

BLDGS.TILE_SIZE = 256;
BLDGS.ATTRIBUTION = 'Data Service &copy; <a href="http://bld.gs">BLDGS</a>';

var proto = BLDGS.prototype;

proto.getTile = function(x, y, zoom, callback) {
  var url = baseURL +'/tile/'+ zoom +'/'+ x +'/'+ y +'.json';
  return loadJSON(url, callback);
};

proto.getFeature = function(id, callback) {
  var url = baseURL +'/feature/'+ id +'.json';
  return loadJSON(url, callback);
};

proto.getBBox = function(n, e, s, w, callback) {
  var url = baseURL +'/bbox.json?bbox='+ [n.toFixed(5), e.toFixed(5), s.toFixed(5), w.toFixed(5)].join(',');
  return loadJSON(url, callback);
};

return BLDGS; }(this));