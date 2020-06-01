var mymap = L.map('map').setView([8, 40], 7);

const geosurveyTableIdentifier = 'modilab.uganda_geodata:1.uganda_geosurvey_results:1';

async function fetchData() {
	const geosurveyResponse = await fetch(`/data/geosurvey.csv`, {
		method: 'GET',
	});
	const geoSurveyText = await geosurveyResponse.text();
	const geoSurvey = Papa.parse(geoSurveyText, { header: true });

	const powerlineResponse = await fetch(`/data/powerlines.csv`, {
		method: 'GET',
	});
	const powerlineText = await powerlineResponse.text();
	const powerlines = Papa.parse(powerlineText, { header: true });

	return { geoSurveyData: geoSurvey.data, powerlineData: powerlines.data };
}

function drawMap({ geoSurveyData, powerlineData } = {}) {
	L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.satellite',
		tileSize: 512,
		zoomOffset: -1,
		accessToken: 'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
	}).addTo(mymap);

	// Use this for OSM layer
	// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	//     attribution:
	//         'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	// }).addTo(mymap);

	for (const row of geoSurveyData) {
		// This just shows 0.1% of points for performance purposes
		if (Math.random() > 0.001) {
			continue;
		}
		const marker = L.marker([row.lat, row.lon]).addTo(mymap);
		marker
			.bindPopup(
				Object.keys(row)
					.map((key) => `<p><b>${key}</b><br>${row[key]}</p>`)
					.join(''),
			)
			.openPopup();
	}

	for (const row of powerlineData) {
		if (!row.geom) continue;
		let geometry;
		try {
			geometry = JSON.parse(row.geom);
		} catch (e) {
			console.log('Invalid JSON:', row.geom);
			continue;
		}

		// Shows 1% of powerlines for performance purposes
		// if (Math.random() > 0.01) {
		// 	continue;
		// }


		let latLngs;
		// GeoJSON stores as lng,lat; we need to invert for Leaflet. Though Leaflet also supports GeoJSON directly — thought this might be more performant, but not sure that it matters.
		if (geometry.type === 'MultiLineString') {
			latLngs = geometry.coordinates.map((lines) => lines.map(([lng, lat]) => [lat, lng]));
		} else {
			latLngs = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
		}

		const polyline = L.polyline(latLngs, { color: 'red', className: 'powerline' }).addTo(mymap);
		polyline
			.bindPopup(
				Object.keys(row)
					.filter((key) => key !== 'geom')
					.map((key) => `<p><b>${key}</b><br>${row[key]}</p>`)
					.join(''),
			)
			.openPopup();
	}
}

fetchData().then(drawMap);
