var map = L.map('map').setView([52.6312, 13.1542], 13);
// add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(map);

      // show the scale bar on the lower left corner
L.control.scale({imperial: true, metric: true}).addTo(map);

// add GXP-Track
var gpxTrack = 'data/2022-09-10.gpx'; // URL to your GPX file or the GPX itself
new L.GPX(gpxTrack, {
    async: true,
    max_point_interval: 30000,
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
	totalTimeIso = gpx.get_duration_string_iso(totalTime, hidems),
	movingTime = gpx.get_moving_time(),
	movingTimeIso = gpx.get_duration_string_iso(movingTime, hidems),
	startTime = gpx.get_start_time(),
	endTime = gpx.get_end_time(),
	movingSpeed = gpx.get_moving_speed(),
	movingSpeedRnd = movingSpeed.toFixed(2),
	totalSpeed = gpx.get_total_speed(),
	totalSpeedRnd = totalSpeed.toFixed(2);
    
    var hidems = false;
 
	// register popup on click
	gpx.getLayers()[0].bindPopup(
	    "Gesamtstrecke " + distKmRnd + " km </br>" +
		"Start " + startTime + "</br>" +
		"Ende " + endTime + "</br>" +
		"Gesamtzeit " + totalTimeIso + "</br>" +		
		"Zeit in Bewegung " + movingTimeIso + "</br>" +
		"Durchschnittsgeschw. " + totalSpeedRnd + " km/h </br>" +
		"Schnitt in Bewegung " + movingSpeedRnd + " km/h </br>"
	),
	map.fitBounds(gpx.getBounds());
}).addTo(map);
