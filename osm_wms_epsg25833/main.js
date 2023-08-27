import 'ol/ol.css';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import TileWMS from 'ol/source/TileWMS';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Stroke, Fill, Circle, Icon, Style} from 'ol/style.js';
import Feature from 'ol/Feature';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import OSM from 'ol/source/OSM.js';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {getRenderPixel} from 'ol/render.js';

// By default OpenLayers does not know about the EPSG:25833 (Europe) projection.
// https://epsg.io/25833
proj4.defs("EPSG:25833","+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);

var projectionETRS89 = new Projection({
  code: 'EPSG:25833',
  // The extent is used to determine zoom level 0. Recommended values for a
  // projection's validity extent can be found at https://epsg.io/.
    extent: [-2465144.80, 4102893.55, 776625.76, 9408555.22],
  units: 'm',
});

// We also declare EPSG:21781/EPSG:4326 transform functions. These functions
// are necessary for the ScaleLine control and when calling ol/proj~transform
// for setting the view's initial center (see below).

var extentBerlin = [369097.85, 5799298.14, 416865.04, 5838236.21];


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
var zoom = 17;
var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857')
//var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:25833')
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

iconFeature.setStyle(iconStyle);

const osm = new TileLayer({
    'title' : 'OSM',
    type: 'base',
    visible: true,
    source: new OSM(),
    minZoom: mapMinZoom,
    maxZoom: 17
});

const obstbaumkarte = new TileLayer({
    'title' : 'obstbaumkarte',
    type: 'base',
    visible: true,
	    extent: mapExtent,
	    source: new XYZ({
		attributions: '<p style="text-align:left;font-family:verdana;"> © ' +
		    '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors<br />' +
		    '<a href="https://obstbaumkarte.de/about/">Über diese Karte</a></p>',
		url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
		tilePixelRatio: 2 // THIS IS IMPORTANT
	    }),
	    minZoom: 17,
	    maxZoom: mapMaxZoom
});

const berlin2023 = 	new TileLayer({
    'title' : 'Digitale farbige TrueOrthophotos 2023',
    type: 'base',
    visible: true,
//    extent: extentBerlin,
    extent: mapExtent,
    source: new TileWMS({
	projection: 'EPSG:25833',
	url: 'https://gdi.berlin.de/services/wms/truedop_2023',
	crossOrigin: 'anonymous',
	attributions:
	'© <a href="https://gdi.berlin.de/geonetwork/srv/ger/catalog.search#/metadata/07ec4c16-723f-32ea-9580-411d8fe4f7e7">Geoportal Berlin / Digitale farbige TrueOrthophotos 2023</a>' +
	    ' &amp; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	params: {
	    'SERVICE': 'WMS',
	    'VERSION': '1.3.0',
	    'LAYERS': 'truedop_2023',
	    'CRS': 'EPSG:25833',
	    'FORMAT': 'image/png',
	},
	serverType: 'mapserver',
    })
});

var map = new Map({
  target: 'map',
    layers: [berlin2023, osm, obstbaumkarte],
    view: new View({
	projection: 'EPSG:3857',
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

const opacityInput = document.getElementById('opacity-input');
const opacityOutput = document.getElementById('opacity-output');
function update() {
  const opacity = parseFloat(opacityInput.value);
  osm.setOpacity(opacity);
  obstbaumkarte.setOpacity(opacity);
  opacityOutput.innerText = opacity.toFixed(2);
}
opacityInput.addEventListener('input', update);
update();

