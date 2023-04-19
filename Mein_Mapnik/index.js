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

var meinmapnik = new TileLayer({
    source: new XYZ({
//        url: 'https://tiles.codefor.de/berlin-1928/{z}/{x}/{y}.png',
        url: 'https://gartenkarten.rudzick.it/osmtiles/{z}/{x}/{y}.png',
	crossOrigin: null
    })
});

var map = new Map({
    layers: [meinmapnik],
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
