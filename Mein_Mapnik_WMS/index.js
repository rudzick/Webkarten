import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import {getWidth} from 'ol/extent';
import {transform, transformExtent, get as getProjection} from 'ol/proj.js';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';
import TileGrid from 'ol/tilegrid/TileGrid';

var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = [-112.261791, 35.983744, -112.113981, 36.132062];

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
});

var projExtent = getProjection('EPSG:3857').getExtent();
var startResolution = getWidth(projExtent) / 256;
var resolutions = new Array(25);
for (var i = 0, ii = resolutions.length; i < ii; ++i) {
  resolutions[i] = startResolution / Math.pow(2, i);
}
var tileGrid = new TileGrid({
//    extent: [-13884991, 2870341, -7455066, 6338219],
//    extent: [1374749, 6787906, 1574125, 6993566],
    extent: projExtent,
    resolutions: resolutions,
    tileSize: [256, 256]
});


var wmsSource = new TileWMS({
 // url: 'https://ahocevar.com/geoserver/wms',
  url: 'https://gartenkarten.rudzick.it/MeinMapnikWMS/wms',
  params: {'LAYERS': 'osm', 'TILED': true},
  serverType: 'geoserver',
    crossOrigin: 'anonymous',
    tileGrid: tileGrid
});

var wmsLayer = new TileLayer({
  source: wmsSource
});

var view = new View({
   center: transform([13.33526, 52.48346 ], 'EPSG:4326', 'EPSG:3857'),
   zoom: 17
});

var map = new Map({
    layers: [wmsLayer],
    controls: defaultControls({attribution: false}).extend([attribution,massstab,new FullScreen()]),
    target: 'map',
    view: view
});

map.on('singleclick', function(evt) {
  document.getElementById('info').innerHTML = '';
  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = wmsSource.getFeatureInfoUrl(
    evt.coordinate, viewResolution, 'EPSG:3857',
    {'INFO_FORMAT': 'text/html'});
  if (url) {
    fetch(url)
      .then(function (response) { return response.text(); })
      .then(function (html) {
        document.getElementById('info').innerHTML = html;
      });
  }
});

map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }
  var pixel = map.getEventPixel(evt.originalEvent);
  var hit = map.forEachLayerAtPixel(pixel, function() {
    return true;
  });
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

function checkSize() {
    var small = map.getSize()[0] < 600;
    attribution.setCollapsible(small);
    attribution.setCollapsed(small);
}

function onChangeScaleText() {
  scaleBarText = scaleTextCheckbox.checked;
  map.removeControl(massstab);
  map.addControl(scaleControl());
}

wmsSource.setAttributions('<a href="https://www.openstreetmap.org/copyright" style="text-decoration: none;">&copy; OpenStreetMap</a> contributors');

window.addEventListener('resize', checkSize);
checkSize();
