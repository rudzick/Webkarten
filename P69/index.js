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
import {getCenter} from 'ol/extent';
import {getZoom} from  'ol/View';

var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = getProjection('EPSG:3857').getExtent();
var mapZoom = 18;

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
});

var view =  new View({
    projection: 'EPSG:3857',
    //  center: transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857'),
    center: [1484543.18,6887733.45],
    //      center: vectorExtent.getCenter(),
    zoom: mapZoom
});

var vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://mymapnik.rudzick.it/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:Parz69&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

//var vectorExtent = vectorSource.getExtent();
//var point = vectorExtent.getCenter();
//document.write(vectorExtent);

var getText = function(text, maxzoom) {
//  var type = dom.text.value;
//  var minResolution = dom.maxreso.value;
//  var text = feature.get('name');

//    var zoom = view.getZoom();
    document.write(mapZoom);
    if (mapZoom > maxzoom) {
	text = '';
    }
    
    return text;
};

var style = new Style({
    stroke: new Stroke({
            color: 'rgba(255, 0, 0, 1.0)',
            width: 3.0
        }),
//	fill: new Fill({
//	    color: 'rgba(189, 2, 64, 0.1)'
//	}),
    text: new Text({
        font: '15px Arial,sans-serif',
	stroke: new Stroke({
            color: 'rgba(255, 0, 0, 1.0)',
            width: 0.7
        }),
	//        text: feature.get('ref'),
//        text: 'Parz.\n112',
        text: getText('Parz.\n112',16),
	overflow: true,
	textAlign: 'left',
	offsetX: 10,
        fill: new Fill({
	    color: 'rgba(189, 2, 64, 1.0)'
	})
      })
});

var vector = new VectorLayer({
    source: vectorSource,
    style,
    renderMode: vector,
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
	  url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
        tilePixelRatio: 2, // THIS IS IMPORTANT
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom
      })
    }),vector
  ],
  view: view,
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
    mapZoom = view.getZoom();
    document.write(' ' + mapZoom);
}

function checkZoom() {
    mapZoom = view.getZoom();
    console.log(' ' + mapZoom);
}

window.addEventListener('resize', checkSize);
checkSize();
window.addEventListener('wheel', checkZoom);
checkZoom();
