import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WKT from 'ol/format/WKT.js';
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

import LayerSwitcher from 'ol-layerswitcher';

var berlin1928 = new TileLayer({
    title: 'Luftbild Berlin 1928',
    visible: true,
    source: new XYZ({
//        url: 'https://tiles.codefor.de/berlin-1928/{z}/{x}/{y}.png',
        url: 'https://gartenkarten.rudzick.it/codefortiles/berlin-1928/{z}/{x}/{y}.png',
	crossOrigin: null
    })
});

var umriss_kml = new VectorLayer({
    title: 'Blöcke von der Kolonie-Webseite (KML)',
    visible: false,
    source: new VectorSource({
        url: 'https://gartenkarten.rudzick.it/KML/bloecke_neu.kml',
        format: new KML()
    })
});

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

var vector = new VectorLayer({
    title: 'Parzellen mit Lauben aus OpenStreetMap (WFS)',
    visible: true,
    source: vectorSource,
    style: new Style({
        stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 8
        }),
//	fill: new Fill({
//	    color: 'rgba(189, 2, 64, 0.3)'
//	}),   
    }),
    renderMode: vector,
    updateWhileInteracting: true
});


var map = new Map({
    layers: [berlin1928,umriss_kml,vector],
    target: 'karte',
    view: new View({
        center: transform([13.33526, 52.48346 ], 'EPSG:4326', 'EPSG:3857'),
        zoom: 17
    })
});

var layerSwitcher = new LayerSwitcher();
map.addControl(layerSwitcher);

var format = new WKT();
      var feature = format.readFeature(
        'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
              '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
              '-39.1552734375, 10.689697265625 -25.0927734375))');
      feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

var dims = {
    a0: [841,1189],
    a1: [594,841],
    a2: [420,594],
    a3: [297,420],
    a4: [210,297],
    a5: [148,210]
};

var exportButton = document.getElementById('export-pdf');

exportButton.addEventListener('click', function() {
    
    exportButton.disabled = true;
    document.body.style.cursor = 'progress';
    
    var format = document.getElementById('format').value;
    var resolution = document.getElementById('resolution').value;
    var dim = dims[format];
    var width = Math.round(dim[0] * resolution / 25.4);
    var height = Math.round(dim[1] * resolution / 25.4);
   var size = /** @type {module:ol/size~Size} */ (map.getSize());
    var extent = map.getView().calculateExtent(size);
    
    map.once('rendercomplete', function(event) {
        var canvas = event.context.canvas;
        var data = canvas.toDataURL('image/jpeg');
        var pdf = new jsPDF('portrait', undefined, format);
        pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
        pdf.save('map.pdf');
        // Reset original map size
        map.setSize(size);
        map.getView().fit(extent, {size: size});
        exportButton.disabled = false;
        document.body.style.cursor = 'auto';
    });
    
    // Set print size
    var printSize = [width, height];
    map.setSize(printSize);
    map.getView().fit(extent, {size: printSize});
    
}, false);


