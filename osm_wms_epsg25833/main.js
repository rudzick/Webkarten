import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import TileWMS from 'ol/source/TileWMS';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {
    Circle as CircleStyle,
    Fill,
    RegularShape,
    Stroke,
    Icon,
    Style,
    Text,
} from 'ol/style.js';
import {Draw, Modify} from 'ol/interaction.js';
import {LineString, Point} from 'ol/geom.js';
import {getArea, getLength} from 'ol/sphere.js';
import Feature from 'ol/Feature';
import View from 'ol/View';
import {OSM, XYZ,  Vector as VectorSource} from 'ol/source.js';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {getRenderPixel} from 'ol/render.js';
import LayerGroup from 'ol/layer/Group';
import LayerTile from 'ol/layer/Tile';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

const typeSelect = document.getElementById('type');
const showSegments = document.getElementById('segments');
const clearPrevious = document.getElementById('clear');

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: '14px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

const tipStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const modifyStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
  text: new Text({
    text: 'Ziehen zum Ändern',
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const segmentStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textBaseline: 'bottom',
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
});

const segmentStyles = [segmentStyle];

const formatLength = function (line) {
    const length = getLength(line, {projection:'EPSG:25833'});
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

const formatArea = function (polygon) {
    const area = getArea(polygon,{projection:'EPSG:25833'});
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
  } else {
    output = Math.round(area * 100) / 100 + ' m\xB2';
  }
  return output;
};

const measureSource = new VectorSource();

const modify = new Modify({source: measureSource, style: modifyStyle});

let tipPoint;

function styleFunction(feature, segments, drawType, tip) {
  const styles = [];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type || type === 'Point') {
    styles.push(style);
    if (type === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new LineString([a, b]);
      const label = formatLength(segment);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count]);
      count++;
    });
  }
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  if (
    tip &&
    type === 'Point' &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

const measureVector = new VectorLayer({
  source: measureSource,
  style: function (feature) {
    return styleFunction(feature, showSegments.checked);
  },
});

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
//var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857')
var center = transform([13.31233, 52.47416], 'EPSG:4326', 'EPSG:25833')
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

const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});

const osm = new TileLayer({
    'title' : 'OSM',
    visible: true,
    combine: true,
    source: new OSM(),
    minZoom: mapMinZoom,
    maxZoom: 17
});

const obstbaumkarte = new TileLayer({
    'title' : 'obstbaumkarte',
    visible: true,
    type: 'overlay',
    combine: true,
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

const berlin2023 = new LayerTile({
    'title' : 'Berlin 2023',
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

const brandenburg2023 = new TileLayer({
    'title' : 'Brandenburg/Berlin 2022',
    type: 'base',
    visible: false,
//    extent: extentBerlin,
    extent: mapExtent,
    source: new TileWMS({
	projection: 'EPSG:25833',
	url: 'https://isk.geobasis-bb.de/mapproxy/dop20c/service/wms',
	crossOrigin: 'anonymous',
	attributions:
	'© GeoBasis-DE/LGB, dl-de/by-2-0</a>' +
	    ' &amp; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	params: {
	    'SERVICE': 'WMS',
	    'VERSION': '1.3.0',
	    'LAYERS': 'bebb_dop20c',
	    'CRS': 'EPSG:25833',
	    'FORMAT': 'image/png',
	},
	serverType: 'mapserver',
    })
});

const baseMaps = new LayerGroup({
    title: 'Luftbilder (True Orthophotos) als Hintergrund',
    layers: [brandenburg2023, berlin2023,]
});

const rasterOverlays = new LayerGroup({
    title: 'OSM-Karten als transparente Overlays',
    type: 'none',
    layers: [osm, obstbaumkarte]
});

var map = new Map({
  target: 'map',
    layers: [baseMaps, rasterOverlays, measureVector],
    view: new View({
//	projection: 'EPSG:3857',
	projection: 'EPSG:25833',
	center: center,
	zoom: zoom,
	rotation: rotation
    }),
    controls: defaultControls({attribution: false}).extend([attribution,massstab,new FullScreen()]),
    //   controls: defaultControls({attribution: true}).extend([attribution,massstab,new FullScreen()]),
});

map.addControl(layerSwitcher);

map.addInteraction(modify);

if(marker > 0) map.addLayer(vectorLayer);  // setze Marker im Kartenzentrum

let draw; // global so we can remove it later

function addInteraction() {
  const drawType = typeSelect.value;
  const activeTip =
    'Klicken zum Weiterzeichnen ' +
    (drawType === 'Polygon' ? 'des Polygons' : 'der Linie');
  const idleTip = 'Klicken zum Starten der Messung';
    let tip = idleTip;
    if (drawType == 'none')  {
	map.removeInteraction(draw);
	return;
    }
  draw = new Draw({
    source: measureSource,
    type: drawType,
    style: function (feature) {
      return styleFunction(feature, showSegments.checked, drawType, tip);
    },
  });
  draw.on('drawstart', function () {
    if (clearPrevious.checked) {
      measureSource.clear();
    }
    modify.setActive(false);
    tip = activeTip;
  });
  draw.on('drawend', function () {
    modifyStyle.setGeometry(tipPoint);
    modify.setActive(true);
    map.once('pointermove', function () {
      modifyStyle.setGeometry();
    });
    tip = idleTip;
  });
  modify.setActive(true);
  map.addInteraction(draw);
}

typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();

showSegments.onchange = function () {
  measureVector.changed();
  draw.getOverlay().changed();
};

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

