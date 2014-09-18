
var BLDGS = (function() {

  function BLDGS(url, options) {
    options = options || {};
    this._url = (url || BLDGS.URL).replace('{k}', options.key || 'anonymous');
    this._request = new Request();

    this._fixedZoom = 16;
    this._tileSize = 256;
  };

  BLDGS.URL = 'http://data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json';

  var proto = BLDGS.prototype;

  proto._getURL = function(x, y, zoom) {
    var param = { x:x, y:y, z:zoom };
    return this._url.replace(/\{([\w_]+)\}/g, function(tag, key) {
      return param[key] || tag;
    });
  };

  proto.updateBBox = function(x, y, w, h, zoom, callback) {
    var
      realTileSize = zoom > this._fixedZoom ? this._tileSize <<(zoom-this._fixedZoom) : this._tileSize >>(this._fixedZoom-zoom),
      minX = x/realTileSize <<0,
      minY = y/realTileSize <<0,
      maxX = Math.ceil((x+w)/realTileSize),
      maxY = Math.ceil((y+h)/realTileSize),
      x, y;

    for (y = minY; y <= maxY; y++) {
      for (x = minX; x <= maxX; x++) {
        this.load(x, y, this._fixedZoom, callback);
      }
    }
  };

  proto.load = function(x, y, zoom, callback) {
    this._request.get(this._getURL(x, y, zoom), function(json) {
      if (typeof callback === 'function') {
        callback(GeoJSON.read(json));
      }
    });
  };

  return BLDGS;

}());
