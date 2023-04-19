import './style.css';
import MVT from 'ol/format/MVT.js';
import {Map, View} from 'ol';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import {Fill, Icon, Stroke, Style, Text} from 'ol/style.js';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import OSM from 'ol/source/OSM';

const center = transform([13.3355811, 52.4833225], 'EPSG:4326', 'EPSG:3857');

// Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
const resolutions = [];
for (let i = 0; i <= 24; ++i) {
  resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}

// Calculation of tile urls for zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
function tileUrlFunction(tileCoord) {
  return (
    'https://vectortiles.obstbaumkarte.de/osm/' +
    '{z}/{x}/{y}.pbf'
  )
    .replace('{z}', String(tileCoord[0] * 2 - 1))
    .replace('{x}', String(tileCoord[1]))
    .replace('{y}', String(tileCoord[2]))
    .replace(
      '{a-d}',
      'abcd'.substr(((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1)
    );
}

const map = new Map({
    layers: [
        new VectorTileLayer({
            source: new VectorTileSource({
		format: new MVT(),
		tileGrid: new TileGrid({
		    extent: getProjection('EPSG:3857').getExtent(),
		    resolutions: resolutions,
		    tileSize: 512,
		}),
		tileUrlFunction: tileUrlFunction
//		url: 'https://vectortiles.obstbaumkarte.de/osm/{z}/{x}/{y}.pbf'
            })
        })
    ],
    target: 'map',
    view: new View({
        center: center,
        zoom: 17
    })
});
