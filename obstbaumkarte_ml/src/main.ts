import './style.css'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
    container: 'map', // container id
//    style: 'map_style.json', // style URL
    style: 'myversatiles_colorfull_style.json', // style URL
    center: [13.31233, 52.47416], // starting position [lng, lat]
    zoom: 17 // starting zoom
});

	map.on('load', async () => {
//        	       image = await map.loadImage('https://commons.wikimedia.org/wiki/File:WLE_garden.svg');
        	       const image = await map.loadImage('WLE_garden.png');
        map.addImage('obstbaum', image.data);
    });
    // Add zoom and rotation controls to the map.
    map.addControl(new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true
    }));