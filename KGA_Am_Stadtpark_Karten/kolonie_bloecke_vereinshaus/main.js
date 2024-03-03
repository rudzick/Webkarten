import './style.css';
import {Map, View} from 'ol';
import OSM from 'ol/source/OSM.js';
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
var center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857')

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
});

var vectorSource_Block_1 = new VectorSource({
    format: new GeoJSON(),
    
    url: function(extent, resolution, projection, success, failure) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:Block1&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

var vectorSource_Block_2 = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:Block_2&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});


var vectorSource_Block_3 = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:Block_3&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

var vectorSource_Vereinshaus = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:Vereinshaus&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

var vectorSource_Weg_zum_Vereinshaus = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://www.kolonie-am-stadtpark.de/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:Weg_zum_Vereinshaus&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    crossOrigin: "anonymous",
    strategy: bboxStrategy
});

 var blockFill = new Fill({
	color: 'rgba(255,255,255,0.4)'
 });

var blockFillCount = 1;

function blockStyle(blockLabel) {
    var blockstyle = new Style({
	stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 2.0
        }),
	fill: blockFill,
//	fill: new Fill({
//	    color: 'rgba(255,255,255,0.4)'
//	}),
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

var style_Block_1 = new Style({
    stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 2.0
        }),
    fill: blockFill,
    text: new Text({
        font: '50px Helvetica',
	offsetY: 20,
        text: '1',
        fill: new Fill({
	    color: 'rgba(189, 2, 64, 1.0)'
	})
      })
});

var style_Block_2 = new Style({
    stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 2.0
    }),
    fill: blockFill,
    text: new Text({
        font: '50px Helvetica',
	offsetX: -30,
	offsetY: -20,
        text: '2',
        fill: new Fill({
	    color: 'rgba(189, 2, 64, 1.0)'
	})
      })
});

var style_Block_3 = new Style({
    stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 2.0
        }),
    fill: blockFill,
    text: new Text({
        font: '50px Helvetica',
	overflow: true,
        text: '3',
        fill: new Fill({
	    color: 'rgba(189, 2, 64, 1.0)'
	})
      })
});

var style_Vereinshaus = new Style({
    stroke: new Stroke({
            color: 'Navy',
            width: 1.5
    }),
    fill: new Fill({
	color: 'LightBlue'
    }),
    text: new Text({
        font: '16px Helvetica',
//	stroke: new Stroke({
//            color: 'Navy',
//            width: 3.0
//        }),
	outlineColor: 'rgba(255,255,255,1.0)',
	outlineWidth: 5,
	offsetY: 19,
	overflow: true,
        text: 'Vereinshaus',
	fill: new Fill({
	    color: 'Navy'
	})
      })
});

var style_Weg_zum_Vereinshaus = new Style({
    stroke: new Stroke({
            color: 'DodgerBlue',
            width: 2.0
    }),
    fill: new Fill({
	color: 'DodgerBlue'
    })
});

var block_1_layer = new VectorLayer({
    source: vectorSource_Block_1,
    style: blockStyle('1'),
    renderMode: 'vector',
    updateWhileInteracting: true,
    minZoom: 15,
    maxZoom: 18,
    transition: 0
});

var block_2_layer = new VectorLayer({
    source: vectorSource_Block_2,
    style: style_Block_2,
    renderMode: 'vector',
    updateWhileInteracting: true,
    minZoom: 15,
    maxZoom: 18
});

var block_3_layer = new VectorLayer({
    source: vectorSource_Block_3,
    style: style_Block_3,
    renderMode: 'vector',
    updateWhileInteracting: true,
    minZoom: 15,
    maxZoom: 18
});

var vereinshaus_layer = new VectorLayer({
    source: vectorSource_Vereinshaus,
    style: style_Vereinshaus,
    renderMode:  'vector',
    updateWhileInteracting: true,
    minZoom: 15,
    maxZoom: 19
});

var weg_zum_vereinshaus_layer = new VectorLayer({
    source: vectorSource_Weg_zum_Vereinshaus,
    style: style_Weg_zum_Vereinshaus,
    renderMode:  'vector',
    updateWhileInteracting: true,
    minZoom: 15,
    maxZoom: 19
});


map = new Map({
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
		attributions: ' © ' +
		    '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/tiles/osm_hq/webmercator_hq/{z}/{x}/{y}.png?origin=nw',
		tilePixelRatio: 2 // THIS IS IMPORTANT
	    }),
	    minZoom: 17,
	    maxZoom: mapMaxZoom
	}),
	block_1_layer, block_2_layer, block_3_layer, vereinshaus_layer, weg_zum_vereinshaus_layer
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

function changeFillColor(evt) {
    const vectorsource = evt.vectorSource_Block_1;
     var opa = 0.4 / blockFillCount;
     var farbe = 'rgba(255,255,255,' + opa + ')';
     blockFill.setColor(farbe);
    blockFillCount += 1;
    console.log( blockFill.getColor(farbe));
 //   vectorSource_Block_1.refresh()
}

window.addEventListener('resize', checkSize);
checkSize();
map.on('moveend',block_2_layer.getSource().clear());
vectorSource_Block_1.on('featuresloadend',changeFillColor);

