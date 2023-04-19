import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import WKT from 'ol/format/WKT.js';
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
    center: transform([13.3353000, 52.4833225], 'EPSG:4326', 'EPSG:3857'),
   // center: [1484343.95,6888133.02],
    //      center: vectorExtent.getCenter(),
    zoom: mapZoom
});

var vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function(extent) {
        return 'https://mymapnik.rudzick.it/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=Kleingartenparzellen:planet_osm_polygon:Wildbienenprojekt&' +
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
//    document.write(mapZoom);
    if (mapZoom > maxzoom) {
	text = '';
    }
    
    return text;
};

var style = new Style({
    stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
            width: 1.6
        }),
//	fill: new Fill({
//	    color: 'rgba(189, 2, 64, 0.1)'
//	}),
    text: new Text({
        font: '15px Arial,sans-serif',
	stroke: new Stroke({
            color: 'rgba(189, 2, 64, 1.0)',
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
    var viewResolution = map.getView().getResolution();
    
    map.once('rendercomplete', function() {
	var mapCanvas = document.createElement('canvas');
	mapCanvas.width = width;
	mapCanvas.height = height;
	var mapContext = mapCanvas.getContext('2d');
	Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function(canvas) {
	    if (canvas.width > 0) {
		var opacity = canvas.parentNode.style.opacity;
		mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
		var transform = canvas.style.transform;
		// Get the transform parameters from the style's transform matrix
		var matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
		// Apply the transform to the export map context
		CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
		mapContext.drawImage(canvas, 0, 0);
	    }
	});
	var pdf = new jsPDF('potrait', undefined, format);
	pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
	pdf.save('map.pdf');
	// Reset original map size
	map.setSize(size);
	map.getView().setResolution(viewResolution);
	exportButton.disabled = false;
	document.body.style.cursor = 'auto';
    });
    
    // Set print size
    var printSize = [width, height];
    map.setSize(printSize);
    var scaling = Math.min(width / size[0], height / size[1]);
    map.getView().setResolution(viewResolution / scaling);
    
}, false);



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
//    document.write(' ' + mapZoom);
}

function checkZoom() {
    mapZoom = view.getZoom();
//    console.log(' ' + mapZoom);
}

window.addEventListener('resize', checkSize);
checkSize();
window.addEventListener('wheel', checkZoom);
checkZoom();
