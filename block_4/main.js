import './style.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import VectorSource from 'ol/source/Vector.js';
import {Stroke, Fill, Style, Text} from 'ol/style.js';

let map = null;

var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = getProjection('EPSG:3857').getExtent();

// default zoom, center
var zoom = 17;
var center = [1484291.49,6888145.35];

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
});

var vectorSource_Block_4 = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:Block_4&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

function blockStyle(blockLabel) {
    var blockstyle = new Style({
	stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 2.0
        }),
	//	fill: blockFill,
	text: new Text({
            font: '50px Helvetica',
	    offsetY: 20,
            text: blockLabel,
            fill: new Fill({
		color: 'rgba(189, 2, 64, 1.0)'
	    })
	})
    });
    return blockstyle;
}

var style_Block_4 = new Style({
    stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 2.0
        }),
    text: new Text({
        font: '50px Helvetica',
        text: '4',
        fill: new Fill({
	    color: 'rgba(189, 2, 64, 1.0)'
	})
      })
});

var block_4_layer = new VectorLayer({
    source: vectorSource_Block_4,
    style: style_Block_4,
    renderMode:  'vector',
    updateWhileInteracting: true,
    minZoom: 15,
    maxZoom: 18
});

map = new Map({
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
	}),
	block_4_layer
    ],
    view: new View({
	projection: 'EPSG:3857',   
	center: center,
	zoom: zoom
    }),
     controls: defaultControls({attribution: false}).extend([attribution,massstab,new FullScreen()])
});

function onChangeScaleText() {
    scaleBarText = scaleTextCheckbox.checked;
    map.removeControl(massstab);
    map.addControl(scaleControl());
}

 function checkSize() {
     var small = map.getSize()[0] < 6000;
     attribution.setCollapsible(small);
     attribution.setCollapsed(small);
 //    changeFillColor();
  }

window.addEventListener('resize', checkSize);
checkSize();


