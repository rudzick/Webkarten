import 'ol/ol.css';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import proj4 from 'proj4';
//import {get as getProjection} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile';
import {Vector as VectorLayer} from 'ol/layer';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';

proj4.defs('EPSG:25833','+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs');
register(proj4);
const proj25833 = getProjection('EPSG:25833');
proj25833.setExtent([-2465144.8, 3638055.41,
		     2885759.28, 9493779.8]);
//var myProjectionName = 'EPSG:25832'; proj4.defs(myProjectionName,
//						"+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
//var myProjection = ol.proj.get(myProjectionName);



var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = getProjection('EPSG:25833').getExtent();

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
});

// default zoom, center and rotation
var zoom = 17;
var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:25833')
//var center = ol.proj.transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:25833');
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

var map = new Map({
  target: 'map',
    layers: [
	new TileLayer({
	    source: new OSM(),
	    minZoom: mapMinZoom,
	    maxZoom: 17
	}),
	new TileLayer({
	    extent: mapExtent,
	    source: new XYZ({
		attributions: '<p style="text-align:left;font-family:verdana;"> © ' +
		    '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors<br />' +
		    '<a href="https://obstbaumkarte.de/about/">Über diese Karte</a></p>',
		url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/osm_25833_hq/epsg_25833_hq/{z}/{x}/{y}.png?origin=nw',
		tilePixelRatio: 2 // THIS IS IMPORTANT
	    }),
	    minZoom: 17,
	    maxZoom: mapMaxZoom
	})
    ],
    view: new View({
	projection: 'EPSG:25833',
	center: center,
	zoom: zoom,
	rotation: rotation
    }),
    controls: defaultControls({attribution: false}).extend([attribution,massstab,new FullScreen()]),
    //   controls: defaultControls({attribution: true}).extend([attribution,massstab,new FullScreen()]),
});

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
