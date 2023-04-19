import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GPX from 'ol/format/GPX';
import VectorSource from 'ol/source/Vector';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';

var mapMinZoom = 1;
var mapMaxZoom = 21;
var mapExtent = getProjection('EPSG:3857').getExtent();
var massstab = new ScaleLine({
      units: 'metric'
});

// default zoom, center and rotation
var zoom = 13;
//var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857');
var center = [1463752.48, 6894513.44];
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

const style = {
  'Point': new Style({
    image: new CircleStyle({
      fill: new Fill({
        color: 'rgba(255,255,0,0.4)',
      }),
      radius: 5,
      stroke: new Stroke({
        color: '#ff0',
        width: 1,
      }),
    }),
  }),
  'LineString': new Style({
    stroke: new Stroke({
      color: '#0f0',
      width: 3,
    }),
  }),
  'MultiLineString': new Style({
    stroke: new Stroke({
      color: '#f00',
      width: 3,
    }),
  }),
};

const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/2022_01_15_Berliner_Polarnacht.gpx',
    format: new GPX(),
  }),
  style: function (feature) {
    return style[feature.getGeometry().getType()];
  },
});


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
	source: new OSM({maxZoom: mapMaxZoom}),
	minZoom: mapMinZoom,
	maxZoom: mapMaxZoom,
	crossOrigin: 'anonymous'
    }),
      vector
  ],
  view: new View({
     projection: 'EPSG:3857',
      center: center,
      zoom: zoom,
      rotation: rotation
  }),
    controls: defaultControls().extend([massstab,new FullScreen()]),
});

function onChangeScaleText() {
  scaleBarText = scaleTextCheckbox.checked;
  map.removeControl(massstab);
  map.addControl(scaleControl());
}

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
