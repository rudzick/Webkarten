import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WKT from 'ol/format/WKT.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';
//import TileLayer from 'ol/layer/Tile.js';
//import VectorLayer from 'ol/layer/Tile.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import XYZ from 'ol/source/XYZ.js';
import VectorSource from 'ol/source/Vector.js';
import {transform} from 'ol/proj.js';

var berlin1928 = new TileLayer({
    source: new XYZ({
//        url: 'https://tiles.codefor.de/berlin-1928/{z}/{x}/{y}.png',
        url: 'https://gartenkarten.rudzick.it/codefortiles/berlin-1928/{z}/{x}/{y}.png',
	crossOrigin: null
    })
});

 var umriss_kml = new VectorLayer({
        source: new VectorSource({
          url: 'https://gartenkarten.rudzick.it/KML/bloecke_neu.kml',
          format: new KML()
        })
 });

var map = new Map({
    layers: [berlin1928,umriss_kml],
    target: 'karte',
    view: new View({
        center: transform([13.33526, 52.48346 ], 'EPSG:4326', 'EPSG:3857'),
        zoom: 17
    })
});

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


