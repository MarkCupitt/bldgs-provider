# BLDGS data provider

A JavaScript adapter to BLDGS data service.

## Integration

~~~ html
<head>
  <script src="BLDGS.js"></script>
</head>
 :
 :
<script>
  var provider = new BLDGS();
<script>
~~~

## API

Constructor | Parameters
--- | ---
BLDGS | Options

Constructor Options

Key | Type | Description
--- | --- | ---
key | String | Your BLDGS key (optional)
cacheSize | Number | Cache size in bytes, 1 MB by default

Static | Value | Description
--- | --- | ---
TILE_SIZE | Integer | 256
ATTRIBUTION | HTML | 'Data Service &copy; &lt;a href="http://bld.gs"&gt;BLDGS&lt;/a&gt;'

All methods return the native XHR object in order to cancel requests.<br>
Callback functions are called with a result JSON object.

Method | Parameters | Description
--- | --- | ---
getTile | x, y, zoom, callback | Fetch a data tile according to TMS schema (z/x/y)
getFeature | id, callback | Get feature details by id
getBBox | n, e, s, w, callback | Fetch data for a bounding box
