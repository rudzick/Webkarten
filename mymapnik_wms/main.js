import './style.css';
import ImageWMS from 'ol/source/ImageWMS';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';

const layers = [
//  new TileLayer({
//    source: new OSM(),
//  }),
  new ImageLayer({
//        extent: [-13884991, 2870341, -7455066, 6338219],
      extent: [1483748, 6887485, 1484890, 6888623],
   source: new ImageWMS({
//     url: 'https://ahocevar.com/geoserver/wms',
//     params: {'LAYERS': 'topp:states'},
     url: 'https://mymapnik.rudzick.it/MeinMapnikWMS/',
     params: {'LAYERS': 'osm_hq_wms'},
      ratio: 1,
       serverType: 'mapserver',
       crossOrigin: 'anonymous',
   }),
 }),
];
const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
      center: [1484510.10,6887992.62],
    zoom: 17
  }),
});
