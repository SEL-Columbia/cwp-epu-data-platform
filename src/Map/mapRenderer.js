import L from 'leaflet';
import './styles.css';

export default class MapRenderer {
	constructor(elem, props) {
		this.elem = elem;
		this.props = {};
		this.map = L.map(elem).setView([-8, 32], 6);

		this.update(props);
	}

	update({ tileLayerId, vectorLayers }) {
		// tileLayerId = 'droquo.camx1r7v';
		// this.map.remove();
		// this.map.setView([12, 40], 6);
		L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
			attribution:
				'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			preferCanvas: true,
			id: tileLayerId,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: 'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
		}).addTo(this.map);
		// return;
		for (const vectorLayer of vectorLayers) {
			for (const feature of vectorLayer.features) {
				const marker = L[vectorLayer.leafletType](feature.geography, feature.leafletOptions).addTo(this.map);

				if (feature.metadata) {
					marker
						.bindPopup(
							Object.keys(feature.metadata)
								.map((key) => `<p><b>${key}</b><br>${feature.metadata[key]}</p>`)
								.join(''),
						)
						.openPopup();
				}
			}
		}
	}
}
