import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls, Attribution, ScaleLine, FullScreen} from 'ol/control';

var mapMinZoom = 1;
var mapMaxZoom = 24;
var mapExtent = getProjection('EPSG:3857').getExtent();

var attribution = new Attribution({
    collapsible: false
});

var massstab = new ScaleLine({
      units: 'metric'
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
    })
  ],
  view: new View({
    projection: 'EPSG:3857',
      center: transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857'),
    zoom: 17
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
