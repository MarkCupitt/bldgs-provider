var BLDGS = (function(window) {

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


var baseURL = 'http://data.osmbuildings.org/0.2/';

function BLDGS(options) {
  options = options || {};

  this._minZoom = options.minZoom !== undefined ? options.minZoom : 14;
  this._maxZoom = options.maxZoom || Infinity;

  baseURL += (options.key || 'anonymous');
}

BLDGS.TILE_SIZE = 256;
BLDGS.ATTRIBUTION = 'Data Service &copy; <a href="http://bld.gs">BLDGS</a>';

BLDGS.prototype = {
  getTile: function(x, y, zoom, callback) {
    if (zoom < this._minZoom || zoom > this._maxZoom) {
      return false;
    }

    var url = baseURL +'/tile/'+ zoom +'/'+ x +'/'+ y +'.json';
    return loadJSON(url, callback);
  },

  getFeature: function(id, callback) {
    var url = baseURL +'/feature/'+ id +'.json';
    return loadJSON(url, callback);
  },

  getBBox: function(n, e, s, w, callback) {
    var url = baseURL +'/bbox.json?bbox='+ [n.toFixed(5), e.toFixed(5), s.toFixed(5), w.toFixed(5)].join(',');
    return loadJSON(url, callback);
  },

  destroy: function() {
    // TODO: abort pending requests
  }
};
return BLDGS; }(this));