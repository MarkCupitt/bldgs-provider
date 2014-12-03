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
      setTimeout(function() {
        callback(cache.get(url));
      }, 0);
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
