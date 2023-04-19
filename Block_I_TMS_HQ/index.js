import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
// import TileLayer from 'ol/layer/Tile';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import VectorSource from 'ol/source/Vector.js';
import {Stroke, Fill, Style, Text} from 'ol/style.js';

var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = getProjection('EPSG:3857').getExtent();

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
});

var vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:Block1&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

var vectorSourceSchule = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:schule&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

var style = new Style({
    stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 2.0
        }),
//	fill: new Fill({
//	    color: 'rgba(189, 2, 64, 0.1)'
//	}),
    text: new Text({
        font: '25px Calibri,sans-serif',
	stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 0.7
        }),
//        text: feature.get('key'),
        text: 'Block 1',
        fill: new Fill({
	    color: 'rgba(189, 2, 64, 1.0)'
	})
      })
});

var styleSchule = new Style({
    stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2.0
        }),
	fill: new Fill({
	    color: 'rgba(0, 0, 0, 0.0)'
	}),
    text: new Text({
        font: '25px Calibri,sans-serif',
	stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 0.7
        }),
//        text: feature.get('key'),
        text: 'Schulgelände',
        fill: new Fill({
	    color: 'rgba(0, 0, 255, 1.0)'
	})
      })
});

var vector = new VectorLayer({
    source: vectorSource,
    style,
    renderMode: vector,
    updateWhileInteracting: true
});

var vectorSchule = new VectorLayer({
    source: vectorSourceSchule,
    styleSchule,
    renderMode: vectorSchule,
    updateWhileInteracting: true
});

var map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      extent: mapExtent,
      source: new XYZ({
        attributions: ' © ' +
        '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	  // url: 'https://tileserver.maptiler.com/grandcanyon@2x/{z}/{x}/{y}.png',
//	  url: 'https://gartenkarten.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
	  url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
      })
    }),vector
  ],
  view: new View({
    projection: 'EPSG:3857',
    //  center: transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857'),
//      center: [1484420.00, 6887939.26],
      center: [1484420.00, 6887920.00],
    zoom: 18
  }),
   controls: defaultControls({attribution: false}).extend([attribution,massstab,new FullScreen()]),
 //   controls: defaultControls({attribution: true}).extend([attribution,massstab,new FullScreen()]),
});

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
