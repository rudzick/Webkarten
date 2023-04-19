var map = L.map('map').setView([52.6312, 13.1542], 13);
// add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(map);

      // show the scale bar on the lower left corner
L.control.scale({imperial: true, metric: true}).addTo(map);

// add GXP-Track
var gpxTrack = 'data/2022-04-24_Fruehlingswanderung.gpx'; // URL to your GPX file or the GPX itself
new L.GPX(gpxTrack, {
    async: true,
    marker_options: {
    startIconUrl: 'images/pin-icon-start.png',
    endIconUrl: 'images/pin-icon-end.png',
    shadowUrl: 'images/pin-shadow.png'
  }
}).on('loaded', function(e) {
    // https://meggsimum.de/webkarte-mit-gps-track-vom-sport/
    var gpx = e.target,
	distM = gpx.get_distance(),
	distKm = distM / 1000,
	distKmRnd = distKm.toFixed(1),
	totalTime = gpx.get_total_time(),
	totalTimeMin = parseInt(totalTime/60000),
	totalTimeHrs = parseInt(totalTimeMin/60),
	totalTimeMin =  totalTimeMin%60,
	movingTime = gpx.get_moving_time(),
	movingTimeMin = parseInt(movingTime/60000),
	movingTimeHrs = parseInt(movingTimeMin/60),
	movingTimeMin =  movingTimeMin%60,
	movingSpeed = gpx.get_moving_speed(),
	movingSpeedRnd = movingSpeed.toFixed(2),
	totalSpeed = gpx.get_total_speed(),
	totalSpeedRnd = totalSpeed.toFixed(2);
 
	// register popup on click
	gpx.getLayers()[0].bindPopup(
	    "Gesamtstrecke " + distKmRnd + " km </br>" +
		"Gesamtzeit " + totalTimeHrs + ":" + String(totalTimeMin).padStart(2,'0') + "</br>" +
		"Zeit in Bewegung " + movingTimeHrs + ":" + String(movingTimeMin).padStart(2,'0') + "</br>" +
		"Durchschnittsgeschw. " + totalSpeedRnd + " km/h </br>" +
		"Schnitt in Bewegung " + movingSpeedRnd + " km/h </br>"
	),
	map.fitBounds(gpx.getBounds());
}).addTo(map);
