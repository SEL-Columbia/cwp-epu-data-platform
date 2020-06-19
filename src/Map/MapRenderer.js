import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import './styles.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA';

const DEFAULT_CENTER = [33, 1]; // [lng, lat]
const DEFAULT_ZOOM = 7;

export default class MapRenderer {
	constructor(elem, props) {
		this.elem = elem;
		this.props = {};
		this.map = new mapboxgl.Map({
			container: this.elem,
			center: DEFAULT_CENTER,
			zoom: DEFAULT_ZOOM,
		});
		const scale = new mapboxgl.ScaleControl({
			maxWidth: 100,
			unit: 'imperial',
		});
		this.map.addControl(scale);

		this.baseLayers = new Map();
		this.rasterLayers = new Map();
		this.vectorLayers = new Map();

		this.onZoomOrPan = props.onZoomOrPan;

		this.map.on('load', () => this.update(props, true));
		this.map.on('zoomend', this.handleZoomEnd);
		this.map.on('moveend', this.handleMoveEnd);
	}

	handleMoveEnd = () => {
		const zoom = this.map.getZoom();
		const center = this.map.getCenter();
		this.onZoomOrPan(zoom, center);
	};

	handleZoomEnd = () => {
		const zoom = this.map.getZoom();
		const center = this.map.getCenter();
		this.onZoomOrPan(zoom, center);
	};

	update(
		{ baseMapLayer, rasterLayers, vectorLayers, center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM },
		initialRender = false,
	) {
		if (initialRender) {
			this.map.jumpTo({ center, zoom });
		}

		let baseLayer = this.baseLayers.get(baseMapLayer.name);
		if (!baseLayer) {
			for (const [layerName, layer] of this.baseLayers) {
				this.baseLayers.delete(layerName);
			}
			// leaflet
			// baseLayer = L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
			// 	id: baseMapLayer.mapboxId,
			// 	opacity: 1,
			// 	tileSize: 512,
			// 	zoomOffset: -1,
			// 	accessToken: 'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
			// });

			this.map.setStyle(baseMapLayer.mapboxStyle);

			this.baseLayers.set(baseMapLayer.name, baseMapLayer);
			// TODO: baseMap toggling
			// this.map.on('style.load', () => this.update({ baseMapLayer, rasterLayers, vectorLayers, center, zoom }))
		}

		if (this.map.isStyleLoaded()) {
			const rasterLayerNamesSet = new Set(rasterLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.rasterLayers) {
				if (!rasterLayerNamesSet.has(layerName)) {
					this.map.removeLayer(layerName);
					this.rasterLayers.delete(layerName);
				}
			}
			// TODO: raster debug (following 'source' spec from
			for (const rasterLayer of rasterLayers) {
				let layer = this.rasterLayers.get(rasterLayer.name);
				if (!layer) {
					const source = {
						type: 'raster',
						tiles: [
							`https://api.mapbox.com/v4/${rasterLayer.mapboxId}/{z}/{x}/{y}.png?access_token=${mapboxgl.accessToken}`,
						],
						tileSize: 512,
						minzoom: rasterLayer.minNativeZoom,
						maxzoom: rasterLayer.maxNativeZoom,
						bounds: rasterLayer.bounds,
					};
					this.map.addSource(rasterLayer.name, source);
					// leaflet
					// layer = L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
					// 	id: rasterLayer.mapboxId,
					// 	opacity: 0.8,
					// 	tileSize: 512,
					// 	zoomOffset: -1,
					// 	accessToken:
					// 		'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
					// 	minNativeZoom: rasterLayer.minNativeZoom + 1,
					// 	maxNativeZoom: rasterLayer.maxNativeZoom + 1,
					// 	bounds: rasterLayer.bounds,
					// });
					layer = {
						id: rasterLayer.name,
						type: 'raster',
						source: rasterLayer.name,
						minzoom: rasterLayer.minZoom,
						maxzoom: rasterLayer.maxZoom,
					};
					this.map.addLayer(layer);
					console.log('add rasterLayer', rasterLayer, layer);
					this.rasterLayers.set(rasterLayer.name, layer);
				}
			}

			const vectorLayerNamesSet = new Set(vectorLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.vectorLayers) {
				if (!vectorLayerNamesSet.has(layerName)) {
					this.map.removeLayer(layerName);
					this.map.removeSource(layerName);
					this.vectorLayers.delete(layerName);
				}
			}
			for (const vectorLayer of vectorLayers) {
				let layer = this.vectorLayers.get(vectorLayer.name);
				if (!layer) {
					// leaflet
					// layer = new L.FeatureGroup();
					const source = {
						type: vectorLayer.mapboxSourceType,
						data: {
							type: 'FeatureCollection',
							features: vectorLayer.features,
						},
					};
					this.map.addSource(vectorLayer.name, source);
					layer = {
						id: vectorLayer.name,
						type: vectorLayer.mapboxLayerType,
						source: vectorLayer.name,
						...(vectorLayer.mapboxLayerOptions || {}),
					};
					if (vectorLayer.minZoom) {
						layer.minzoom = vectorLayer.minZoom;
					}
					if (vectorLayer.maxZoom) {
						layer.maxzoom = vectorLayer.maxZoom;
					}
					this.map.addLayer(layer);
					console.log('add vectorLayer', vectorLayer, layer);
					this.map.on('click', vectorLayer.name, (e) => {
						const metadata = e.features[0].properties;

						if (Object.keys(metadata).length) {
							const coordinates = [parseFloat(e.lngLat.lng), parseFloat(e.lngLat.lat)];
							// const coordinates = e.features[0].geometry.coordinates.slice(); // FOR 'circle' layers

							// Ensure that if the map is zoomed out such that multiple
							// copies of the feature are visible, the popup appears
							// over the copy being pointed to.
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
							}

							new mapboxgl.Popup()
								.setLngLat(coordinates)
								.setHTML(
									Object.keys(metadata)
										.map((key) => `<p><b>${key}</b><br>${metadata[key]}</p>`)
										.join(''),
								)
								.addTo(this.map);
						}
					});
					this.vectorLayers.set(vectorLayer.name, layer);
				} else {
					this.map.getSource(vectorLayer.name).setData({
						type: 'FeatureCollection',
						features: vectorLayer.features,
					});
				}
				// leaflet
				// layer.clearLayers();
				// for (const feature of vectorLayer.features) {
				// 	const marker = L[vectorLayer.leafletType](feature.geometry, vectorLayer.leafletOptions).addTo(layer);
				//
				// 	if (feature.metadata) {
				// 		marker.bindPopup(
				// 			Object.keys(feature.metadata)
				// 				.map((key) => `<p><b>${key}</b><br>${feature.metadata[key]}</p>`)
				// 				.join(''),
				// 		);
				// 	}
				// }
			}
		}
	}
}
