import 'ol/ol.css';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile';
import {Vector as VectorLayer} from 'ol/layer';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';
import {getRenderPixel} from 'ol/render';

var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = getProjection('EPSG:3857').getExtent();

var attribution = new Attribution({
    collapsible: true,
    collapsed:true
});

var massstab = new ScaleLine({
      units: 'metric'
});

// default zoom, center and rotation
var zoom = 8;
// var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857')
// var center = [755150.66, 6661955.98];
var center = [1179547.94,6752021.59];
var rotation = 0;
var marker = 0;

if (window.location.hash !== '') {
  // try to restore center, zoom-level and rotation from the URL
  var hash = window.location.hash.replace('#map=', '');
  var parts = hash.split('/');
  if (parts.length === 4) {
    zoom = parseInt(parts[0], 10);
    center = [
      parseFloat(parts[1]),
      parseFloat(parts[2])
    ];
    rotation = parseFloat(parts[3]);
  } else if (parts.length === 5) {  // wenn 1 dann Marker im Zentrum der Karte
    zoom = parseInt(parts[0], 10);
    center = [
      parseFloat(parts[1]),
      parseFloat(parts[2])
    ];
    rotation = parseFloat(parts[3]);
    marker = parseInt(parts[4]);     
  }
}

var iconFeature = new Feature({
  geometry: new Point(center)
});

var iconStyle = new Style({
  image: new Icon({
    color: '#4271AE',
    crossOrigin: 'anonymous',
    src: 'data/dot.png'
  })
});

// iconFeature.setStyle(iconStyle);

var vectorSource = new VectorSource({
  features: [iconFeature]
});

var vectorLayer = new VectorLayer({
  source: vectorSource
});

var GaslaternenLayer = new TileLayer({
    extent: mapExtent,
    opacity: 1.0,
    source: new XYZ({
        attributions: '<p style="text-align:left;font-family:verdana;"> © ' +
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors<br/>'+
	    'Fotos D&uuml;sseldorf: <a href="https://wiki.openstreetmap.org/wiki/User:BlackBike">BlackBike</a><br/>'+
	    'Fotos Berlin: <a href="http://www.gaslicht-kultur.de/">gaslicht-kultur.de</a><br/>'+
            '<a href="https://gasleuchtenkarte.de/about/">Über diese Karte</a></p>',
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/gaslaternen_dd_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
    })
});

var GaslaternenNachtLayer = new TileLayer({
    extent: mapExtent,
    opacity: 1.0,
    source: new XYZ({
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/gaslaternen_dd_nacht_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
    })
});

var map = new Map({
  target: 'map',
    layers: [
	new TileLayer({
	    source: new OSM(),
	    minZoom: mapMinZoom,
	    maxZoom: 19
	}),
	new TileLayer({
	    extent: mapExtent,
	    source: new XYZ({
		url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
		tilePixelRatio: 2  // THIS IS IMPORTANT
	    }),
	    minZoom: 19,
	    maxZoom: mapMaxZoom
	}), GaslaternenNachtLayer, GaslaternenLayer
    ],
    view: new View({
	projection: 'EPSG:3857',
	center: center,
	zoom: zoom,
	rotation: rotation
    }),
    controls: defaultControls({attribution: false}).extend([attribution,massstab,new FullScreen()]),
    //   controls: defaultControls({attribution: true}).extend([attribution,massstab,new FullScreen()]),
});

var swipe = document.getElementById('swipe');

GaslaternenNachtLayer.on('prerender', function(event) {
  var ctx = event.context;
  var mapSize = map.getSize();
  var width = mapSize[0] * (swipe.value / 100);
  var tl = getRenderPixel(event, [width, 0]);
  var tr = getRenderPixel(event, [mapSize[0], 0]);
  var bl = getRenderPixel(event, [width, mapSize[1]]);
  var br = getRenderPixel(event, mapSize);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(tr[0], tr[1]);
  ctx.closePath();
  ctx.clip();
});

GaslaternenNachtLayer.on('postrender', function(event) {
  var ctx = event.context;
  ctx.restore();
});

GaslaternenLayer.on('prerender', function(event) {
  var ctx = event.context;
  var mapSize = map.getSize();
  var width = mapSize[0] * (swipe.value / 100);
  var tl = getRenderPixel(event, [0, 0]);
  var tr = getRenderPixel(event, [width, 0]);
  var bl = getRenderPixel(event, [0, mapSize[1]]);
  var br = getRenderPixel(event, [width, mapSize[1]]);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(tr[0], tr[1]);
  ctx.closePath();
  ctx.clip();
});

GaslaternenLayer.on('postrender', function(event) {
  var ctx = event.context;
  ctx.restore();
});

swipe.addEventListener('input', function() {
  map.render();
}, false);



if(marker > 0) map.addLayer(vectorLayer);  // setze Marker im Kartenzentrum

function onChangeScaleText() {
  scaleBarText = scaleTextCheckbox.checked;
  map.removeControl(massstab);
  map.addControl(scaleControl());
}

function checkSize() {
  var small = map.getSize()[0] < 6000;
  attribution.setCollapsible(small);
  attribution.setCollapsed(small);
}

window.addEventListener('resize', checkSize);
checkSize();

var shouldUpdate = true;
var view = map.getView();
var updatePermalink = function() {
  if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler
    shouldUpdate = true;
    return;
  }

  var center = view.getCenter();
  var hash = '#map=' +
      view.getZoom() + '/' +
      Math.round(center[0] * 100) / 100 + '/' +
      Math.round(center[1] * 100) / 100 + '/' +
      view.getRotation();
  var state = {
    zoom: view.getZoom(),
    center: view.getCenter(),
    rotation: view.getRotation()
  };
  window.history.pushState(state, 'map', hash);
};

map.on('moveend', updatePermalink);

// restore the view state when navigating through the history, see
// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
window.addEventListener('popstate', function(event) {
  if (event.state === null) {
    return;
  }
  map.getView().setCenter(event.state.center);
  map.getView().setZoom(event.state.zoom);
  map.getView().setRotation(event.state.rotation);
  shouldUpdate = false;
});
