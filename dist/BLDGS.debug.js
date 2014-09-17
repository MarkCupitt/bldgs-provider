(function(window) { 'use strict'

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
  //    realTileSize = zoom > this._fixedZoom ? this._tileSize <<(zoom-this._fixedZoom) : this._tileSize >>(this._fixedZoom-zoom),
  //    minX = x/realTileSize <<0,
  //    minY = y/realTileSize <<0,
  //    maxX = Math.ceil((x+w)/realTileSize),
  //    maxY = Math.ceil((y+h)/realTileSize),
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


var GeoJSON = (function() {

  var CLOCKWISE = 'CW';
  var COUNTER_CLOCKWISE = 'CCW';
  var RAD = 180/Math.PI;

  function getWinding(points) {
    var
      x1, y1, x2, y2,
      a = 0,
      i, il;
    for (i = 0, il = points.length-3; i < il; i += 2) {
      x1 = points[i];
      y1 = points[i+1];
      x2 = points[i+2];
      y2 = points[i+3];
      a += x1*y2 - x2*y1;
    }
    return (a/2) > 0 ? CLOCKWISE : COUNTER_CLOCKWISE;
  }

  // enforce a polygon winding direcetion. Needed for proper backface culling.
  function makeWinding(points, direction) {
    var winding = getWinding(points);
    if (winding === direction) {
      return points;
    }
    var revPoints = [];
    for (var i = points.length-2; i >= 0; i -= 2) {
      revPoints.push(points[i], points[i+1]);
    }
    return revPoints;
  }

  function getRadius(points) {
    var minLat = 90, maxLat = -90;
    for (var i = 0, il = points.length; i < il; i += 2) {
      minLat = min(minLat, points[i]);
      maxLat = max(maxLat, points[i]);
    }

    return (maxLat-minLat) / RAD * 6378137 / 2 <<0; // 6378137 = Earth radius
  }

  function alignProperties(prop) {
    var item = {};
    prop = prop || {};
    switch (prop.shape) {
      case 'pyramid':
      case 'pyramidal':
        item.shape = 'pyramid';
      break;
    }
    switch (prop.roofShape) {
      case 'pyramid':
      case 'pyramidal':
        item.roofShape = 'pyramid';
      break;
    }
    return item;
  }

  function getGeometries(geometry) {
    var
      i, il, polygon,
      geometries = [], sub;

    switch (geometry.type) {
      case 'GeometryCollection':
        geometries = [];
        for (i = 0, il = geometry.geometries.length; i < il; i++) {
          if ((sub = getGeometries(geometry.geometries[i]))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'MultiPolygon':
        geometries = [];
        for (i = 0, il = geometry.coordinates.length; i < il; i++) {
          if ((sub = getGeometries({ type:'Polygon', coordinates:geometry.coordinates[i] }))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'Polygon':
        polygon = geometry.coordinates;
      break;

      default: return [];
    }

    var
      j, jl,
      p, lat = 1, lon = 0,
      outer = [], inner = [];

    p = polygon[0];
    for (i = 0, il = p.length; i < il; i++) {
      outer.push(p[i][lat], p[i][lon]);
    }

    for (i = 0, il = polygon.length-1; i < il; i++) {
      p = polygon[i+1];
      inner[i] = [];
      for (j = 0, jl = p.length; j < jl; j++) {
        inner[i].push(p[j][lat], p[j][lon]);
      }
      inner[i] = makeWinding(inner[i], COUNTER_CLOCKWISE);
    }

    return [{
      outer: makeWinding(outer, CLOCKWISE),
      inner: inner.length ? inner : null
    }];
  }

  function clone(obj) {
    var res = {};
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        res[p] = obj[p];
      }
    }
    return res;
  }

  var GeoJSON = {};

  GeoJSON.read = function(geojson, onEach) {
    if (!geojson || geojson.type !== 'FeatureCollection') {
      return [];
    }

    var
      collection = geojson.features,
      i, il, j, jl,
      res = [],
      feature,
      geometries,
      baseItem, item;

    for (i = 0, il = collection.length; i < il; i++) {
      feature = collection[i];

      if (feature.type !== 'Feature' || onEach(feature) === false) {
        continue;
      }

      baseItem = alignProperties(feature.properties);
      geometries = getGeometries(feature.geometry);

      for (j = 0, jl = geometries.length; j < jl; j++) {
        item = clone(baseItem);
        item.footprint = geometries[j].outer;
        if (item.shape === 'cone' || item.shape === 'cylinder') {
          item.radius = getRadius(item.footprint);
        }
        if (geometries[j].inner) {
          item.holes = geometries[j].inner;
        }
        if (feature.id || feature.properties.id) {
          item.id = feature.id || feature.properties.id;
        }
        res.push(item); // TODO: this._clone base properties!
      }
    }

    return res;
  };

  return GeoJSON;

}());

  window.BLDGS = BLDGS;
}(this));