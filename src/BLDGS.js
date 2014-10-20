
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
