import './style.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM.js';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';

import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

// https://github.com/walkermatt/ol-layerswitcher-examples/blob/master/parcel/main.js
// npm i ol-layerswitcher@v4.1.0

var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = getProjection('EPSG:3857').getExtent();

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
});

// default zoom, center and rotation
var zoom = 15;
// var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857')
var center = [1489208.9, 6893991.98];
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

var basisKarte = new TileLayer({
    extent: mapExtent,
    source: new OSM({
	maxZoom: 18
    }),
    source: new XYZ({
        attributions: ' © ' +
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	// url: 'https://tileserver.maptiler.com/grandcanyon@2x/{z}/{x}/{y}.png',
	//	  url: 'https://gartenkarten.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: 19,
        maxZoom: mapMaxZoom
    }),
    title: 'OSM-Standardkarte mit Baumarten',
    type: 'base',
    visible: true
});

var basisKarteOSM = new TileLayer({
    extent: mapExtent,
    source: new OSM(),
    title: 'OSM-Standardkarte',
    type: 'base',
    visible: true,
    maxZoom: 18
});  

var geldautomatenCashgroup = new TileLayer({
    extent: mapExtent,
    source: new XYZ({
        attributions: ' © ' +
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/geldautomaten_cashgroup_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
    }),
    title: 'CashGroup',
    visible: true
});

var geldautomatenGenossenschaftsbanken = new TileLayer({
    extent: mapExtent,
    source: new XYZ({
        attributions: ' © ' +
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/geldautomaten_genossenschaftsbanken_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
    }),
    title: 'Genossenschaftsbanken',
    visible: true
});

var geldautomatenCashpool = new TileLayer({
    extent: mapExtent,
    source: new XYZ({
        attributions: ' © ' +
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/geldautomaten_cashpool_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
    }),
    title: 'CashPool',
    visible: true
});

var geldautomatenSparkassen = new TileLayer({
    extent: mapExtent,
    source: new XYZ({
        attributions: ' © ' +
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/geldautomaten_sparkassen_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
    }),
    title: 'Sparkassen',
    visible: true
});

var geldautomatenweiterebanken = new TileLayer({
    extent: mapExtent,
    source: new XYZ({
        attributions: ' © ' +
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/geldautomaten_weiterebanken_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
    }),
    title: 'sonstige Banken',
    visible: true
});

var basisLayers = new LayerGroup({
    'title': 'OSM-Grundkarte',
    layers: [basisKarte]
});

var overlaysGeldautomaten = new LayerGroup({
    'title': 'Geldautomaten',
    layers: [geldautomatenweiterebanken,
	     geldautomatenCashpool,
	     geldautomatenGenossenschaftsbanken,
	     geldautomatenSparkassen,
	     geldautomatenCashgroup
	    ]
});

var map = new Map({
    target: 'map',
    layers: [
	basisLayers,
	overlaysGeldautomaten
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

const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);

function onChangeScaleText() {
  scaleBarText = scaleTextCheckbox.checked;
  map.removeControl(massstab);
  map.addControl(scaleControl());
}

function checkSize() {
  var small = map.getSize()[0] < 600;
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
