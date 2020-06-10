import L from 'leaflet';
import './styles.css';

export default class MapRenderer {
	constructor(elem, props) {
		this.elem = elem;
		this.props = {};
		this.map = L.map(elem, { preferCanvas: true });
		L.control.scale({ position: 'bottomright' }).addTo(this.map);

		this.layers = new Map();

		this.update(props);
		this.map.on('zoomend', () => {
			this.updateLayers(this.map.getZoom());
		});
	}

	updateLayers = (zoom) => {
		for (const [layerSpec, layer] of this.layers) {
			if (layerSpec.kind === 'raster') {
				this.map.addLayer(layer);
			} else if (zoom < layerSpec.minZoom) {
				this.map.removeLayer(layer);
			} else {
				this.map.addLayer(layer);
			}
		}
	};

	update({ baseMapLayer, rasterLayers, vectorLayers, centroid = [1, 32], zoom = 6 }) {
		this.map.eachLayer((layer) => {
			this.map.removeLayer(layer);
		});

		this.map.setView(centroid, zoom);

		const baseLayer = L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
			id: baseMapLayer.mapboxId,
			opacity: 1,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: 'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
		});

		this.map.addLayer(baseLayer);

		this.layers = new Map();

		for (const rasterLayer of rasterLayers) {
			const layer = L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
				id: rasterLayer.mapboxId,
				opacity: 0.8,
				tileSize: 512,
				zoomOffset: -1,
				accessToken:
					'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
				minNativeZoom: rasterLayer.minNativeZoom,
				maxNativeZoom: rasterLayer.maxNativeZoom,
				bounds: rasterLayer.boundingBox,
			});
			this.layers.set(rasterLayer, layer);
		}

		for (const vectorLayer of vectorLayers) {
			const layer = new L.FeatureGroup();
			this.layers.set(vectorLayer, layer);

			for (const feature of vectorLayer.features) {
				const marker = L[vectorLayer.leafletType](feature.geometry, vectorLayer.leafletOptions).addTo(layer);

				if (feature.metadata) {
					marker.bindPopup(
						Object.keys(feature.metadata)
							.map((key) => `<p><b>${key}</b><br>${feature.metadata[key]}</p>`)
							.join(''),
					);
				}
			}
		}
		this.updateLayers(this.map.getZoom());
	}
}
