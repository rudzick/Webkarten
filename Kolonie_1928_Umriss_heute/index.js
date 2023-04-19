import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';
//import TileLayer from 'ol/layer/Tile.js';
//import VectorLayer from 'ol/layer/Tile.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import XYZ from 'ol/source/XYZ.js';
import VectorSource from 'ol/source/Vector.js';
import {Stroke, Fill, Style} from 'ol/style.js';
import {transform} from 'ol/proj.js';

var berlin1928 = new TileLayer({
    source: new XYZ({
//        url: 'https://tiles.codefor.de/berlin-1928/{z}/{x}/{y}.png',
        url: 'https://gartenkarten.rudzick.it/codefortiles/berlin-1928/{z}/{x}/{y}.png',
	crossOrigin: null
    })
});

/*
 var umriss_kml = new VectorLayer({
        source: new VectorSource({
          url: 'https://gartenkarten.rudzick.it/KML/bloecke_neu.kml',
          format: new KML()
        })
 });
*/

var vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://gartenkarten.rudzick.it/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    strategy: bboxStrategy
});
/*
var vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://ahocevar.com/geoserver/wfs?service=WFS&' +
              'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
              'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    strategy: bboxStrategy
});
*/
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

var osm_kml = new VectorLayer({
    source: new VectorSource({
        url: 'https://gartenkarten.rudzick.it/geoserver/Kleingartenparzellen/wms/kml?layers=Kleingartenparzellen:planet_osm_polygon',
          format: new KML()
    })
});

var map = new Map({
    layers: [berlin1928,vector],
    target: 'karte',
    view: new View({
        center: transform([13.33526, 52.48346 ], 'EPSG:4326', 'EPSG:3857'),
        zoom: 17
    })
});


document.getElementById('export-png').addEventListener('click', function() {
    map.once('rendercomplete', function(event) {
        var canvas = event.context.canvas;
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
        } else {
            canvas.toBlob(function(blob) {
		saveAs(blob, 'map.png');
            });
        }
    });
    map.renderSync();
});
