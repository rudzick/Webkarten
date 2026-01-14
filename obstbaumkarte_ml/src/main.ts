import './style.css'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
		MaplibreExportControl,
		Size,
		PageOrientation,
		Format,
		DPI
	} from '@watergis/maplibre-gl-export';
	import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';

const map = new maplibregl.Map({
    container: 'map', // container id
//    style: 'map_style.json', // style URL
    style: 'myversatiles_colorfull_style.json', // style URL
    center: [13.31233, 52.47416], // starting position [lng, lat]
    zoom: 17 // starting zoom
});

	map.on('load', async () => {
//        	       image = await map.loadImage('https://commons.wikimedia.org/wiki/File:WLE_garden.svg');
        	       var image = await map.loadImage('WLE_garden.png');
        map.addImage('obstbaum', image.data);
        	       image = await map.loadImage('trees_broad_leaved.png');
        map.addImage('laubbaum', image.data);
        	       image = await map.loadImage('trees_conifer.png');
        map.addImage('nadelbaum', image.data);
        	       image = await map.loadImage('shrub.png');
        map.addImage('strauch', image.data);
    });
    // Add zoom and rotation controls to the map.
    map.addControl(new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true
    }));
    map.addControl(new maplibregl.ScaleControl({
    //	maxWidth: 100,
    	unit: 'metric'
    }));

// Show tags of OSM objects in the lower left corner on hover:

    map.on('mousemove', (e : any) => {const features = map.queryRenderedFeatures(
			e.point,
		{ layers: [ 'public.trees','public.trees_fruittrees_17','public.trees_broadleaved_17','public.trees_coniferes_17'] }
	);		

        // Limit the number of properties we're displaying for
        // legibility and performance
        const displayProperties = [
         //   'type',
            'properties',
         //   'id',
         //   'layer',
         //   'source',
         //   'sourceLayer',
         //   'state'
        ];
	
        const displayFeatures = features.map((feat : any) => {
            const displayFeat:  {[key: string]:any} = {};
            displayProperties.forEach((prop) => {
                displayFeat[prop] = feat[prop];
            });
            return displayFeat;
        });

  	 if (displayFeatures.length > 0){
   		document.getElementById('features')!.style.background = 'rgba(255, 255, 255, 0.8)';
            document.getElementById('features')!.innerHTML = JSON.stringify(
            	displayFeatures,
		 null,
           	 2
        );
	} else {
		document.getElementById('features')!.innerHTML = ''
    		document.getElementById('features')!.style.background = 'rgba(255, 255, 255, 0.0)';
	      }
    });

    const exportControl = new MaplibreExportControl({
		PageSize: Size.A3,
		PageOrientation: PageOrientation.Portrait,
		Format: Format.SVG,
		DPI: DPI[96],
		Crosshair: true,
		PrintableArea: true,
		Local: 'de',
		
	});
	map.addControl(exportControl, 'top-right');