import 'ol/ol.css';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import TileWMS from 'ol/source/TileWMS';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorSource from 'ol/source/Vector.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import {Stroke, Fill, Style} from 'ol/style.js';
import View from 'ol/View';
import {ScaleLine,  Attribution, FullScreen, defaults as defaultControls} from 'ol/control';
import {
  transform,
} from 'ol/proj';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';

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

var extentBerlin = [-2465144.80, 4102893.55, 776625.76, 9408555.22];

var vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://mymapnik.rudzick.it/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon&' +
            'outputFormat=application/json&srsname=EPSG:25833&' +
            'bbox=' + extent.join(',') + ',EPSG:25833';
    },
    strategy: bboxStrategy
});

var vector = new VectorLayer({
    source: vectorSource,
    style: new Style({
        stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 1
        }),
//	fill: new Fill({
//	    color: 'rgba(189, 2, 64, 0.3)'
//	}),   
    }),
    renderMode: vector,
    updateWhileInteracting: true
});

var layersBerlin = [
    new TileLayer({
    extent: extentBerlin,
    source: new TileWMS({
      url: 'https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild1928',
      crossOrigin: 'anonymous',
      attributions:
        '© <a href="https://fbinter.stadt-berlin.de/fb/berlin/service_intern.jsp?id=k_luftbild1928@senstadt&type=WMS">Geoportal Berlin / Luftbildplan 1928</a>' +
	    ' &amp; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	params: {
	    'SERVICE': 'WMS',
	    'VERSION': '1.3.0',
            'LAYERS': '0',
	    'CRS': 'EPSG:25833',
            'FORMAT': 'image/png',
      },
      serverType: 'mapserver',
    }),
    }), vector ];

var map = new Map({
    controls: defaultControls().extend([
	new ScaleLine({
	    units: 'metric',
	}),
	new FullScreen()
    ]),
    layers: layersBerlin,
    target: 'map',
    view: new View({
	projection: projectionETRS89,
        center: transform([13.3353000, 52.4833225], 'EPSG:4326', 'EPSG:25833'),
//	center: [386956.39, 5816099.66],
        extent: extentBerlin,
	zoom: 14,
  }),
});

// https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild1928?&VERSION=1.3.0&REQUEST=GetCapabilities&SERVICE=WMS&
