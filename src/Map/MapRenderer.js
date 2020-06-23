import mapboxgl from 'mapbox-gl';
import './styles.css';
import baseMaps from '../config/baseMaps';

mapboxgl.accessToken = 'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA';

const DEFAULT_CENTER = [33, 1]; // [lng, lat]
const DEFAULT_ZOOM = 7;

export default class MapRenderer {
	constructor(elem, props) {
		this.elem = elem;
		this.props = {};

		this.baseLayers = new Map();
		this.rasterLayers = new Map();
		this.vectorLayers = new Map();
		this.observationVectorLayers = new Map();
		this.adminVectorLayers = new Map();

		const { baseMapLayer, center, zoom } = props;

		const initialBaseMapLayer = baseMapLayer || baseMaps.find(({ isDefault }) => isDefault);
		this.baseLayers.set(initialBaseMapLayer.name, initialBaseMapLayer);

		this.map = new mapboxgl.Map({
			container: this.elem,
			style: initialBaseMapLayer.mapboxStyle,
			center: center || DEFAULT_CENTER,
			zoom: zoom || DEFAULT_ZOOM,
		});
		const scale = new mapboxgl.ScaleControl({
			maxWidth: 100,
			unit: 'imperial',
		});
		this.map.addControl(scale);

		this.onZoomOrPan = props.onZoomOrPan;
		this.map.on('zoomend', this.handleZoomEnd);
		this.map.on('moveend', this.handleMoveEnd);

		this.map.once('style.load', () => {
			this.waitForStyleLoad(() => {
				this.update(props, { initialRender: true });
			});
		})
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

	waitForStyleLoad = (callback = () => {}, timeout = 200) => {
		const waiting = () => {
			// TODO: isStyleLoaded() is unreliable - monitor https://github.com/mapbox/mapbox-gl-js/issues/8691
			if (!this.map.isStyleLoaded()) {
				setTimeout(waiting, timeout);
			} else {
				callback();
			}
		};
		waiting();
	}

	update(
		{
			baseMapLayer,
			rasterLayers,
			vectorLayers,
			observationVectorLayers,
			adminVectorLayers,
			center = DEFAULT_CENTER,
			zoom = DEFAULT_ZOOM,
		},
		{ initialRender = false } = {},
	) {
		if (initialRender) {
			this.map.jumpTo({ center, zoom });
		}

		let baseLayer = this.baseLayers.get(baseMapLayer.name);
		if (!baseLayer) {
			for (const [layerName, layer] of this.baseLayers) {
				this.baseLayers.delete(layerName);
			}

			this.baseLayers.set(baseMapLayer.name, baseMapLayer);

			this.map.setStyle(baseMapLayer.mapboxStyle);
			this.map.once('style.load', () => {
				this.waitForStyleLoad(() => {
					for (const [layerName, layer] of this.adminVectorLayers) {
						if (this.map.getLayer(layerName)){
							this.map.removeLayer(layerName);
						}
						if (this.map.getSource(layerName)){
							this.map.removeSource(layerName);
						}
						this.adminVectorLayers.delete(layerName);
					}
					for (const [layerName, layer] of this.rasterLayers) {
						if (this.map.getLayer(layerName)){
							this.map.removeLayer(layerName);
						}
						if (this.map.getSource(layerName)){
							this.map.removeSource(layerName);
						}
						this.rasterLayers.delete(layerName);
					}
					for (const [layerName, layer] of this.vectorLayers) {
						if (this.map.getLayer(layerName)){
							this.map.removeLayer(layerName);
						}
						if (this.map.getSource(layerName)){
							this.map.removeSource(layerName);
						}
						this.vectorLayers.delete(layerName);
					}
					this.update(
						{
							baseMapLayer,
							rasterLayers,
							vectorLayers,
							observationVectorLayers,
							adminVectorLayers,
							center,
							zoom,
						},
						{ initialRender: true }
					);
				});
			});
			return;
		}

		if (this.map.isStyleLoaded()) {
			const adminVectorLayerNamesSet = new Set(adminVectorLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.adminVectorLayers) {
				if (!adminVectorLayerNamesSet.has(layerName)) {
					if (this.map.getLayer(layerName)) {
						this.map.removeLayer(layerName);
					}
					if (this.map.getSource(layerName)){
						this.map.removeSource(layerName);
					}
					this.adminVectorLayers.delete(layerName);
				}
			}
			for (const vectorLayer of adminVectorLayers) {
				let layer = this.adminVectorLayers.get(vectorLayer.name);
				if (!layer) {
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
					this.adminVectorLayers.set(vectorLayer.name, layer);
				} else {
					if (this.map.getSource(vectorLayer.name)){
						this.map.getSource(vectorLayer.name).setData({
							type: 'FeatureCollection',
							features: vectorLayer.features,
						});
					}
				}
			}

			const rasterLayerNamesSet = new Set(rasterLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.rasterLayers) {
				if (!rasterLayerNamesSet.has(layerName)) {
					if (this.map.getLayer(layerName)) {
						this.map.removeLayer(layerName);
					}
					if (this.map.getSource(layerName)){
						this.map.removeSource(layerName);
					}
					this.rasterLayers.delete(layerName);
				}
			}
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
					layer = {
						id: rasterLayer.name,
						type: 'raster',
						source: rasterLayer.name,
						minzoom: rasterLayer.minZoom,
						maxzoom: rasterLayer.maxZoom,
						paint: {
							'raster-opacity': 0.8,
						}
					};
					this.map.addLayer(layer);
					this.map.moveLayer(rasterLayer.name, adminVectorLayers[0].name); // place raster underneath first admin layer
					this.rasterLayers.set(rasterLayer.name, layer);
				}
			}

			const vectorLayerNamesSet = new Set(vectorLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.vectorLayers) {
				if (!vectorLayerNamesSet.has(layerName)) {
					if (this.map.getLayer(layerName)) {
						this.map.removeLayer(layerName);
					}
					if (this.map.getSource(layerName)){
						this.map.removeSource(layerName);
					}
					this.vectorLayers.delete(layerName);
				}
			}
			for (const vectorLayer of vectorLayers) {
				let layer = this.vectorLayers.get(vectorLayer.name);
				if (!layer) {
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
					if (this.map.getSource(vectorLayer.name)){
						this.map.getSource(vectorLayer.name).setData({
							type: 'FeatureCollection',
							features: vectorLayer.features,
						});
					}

				}
			}

			const observationVectorLayerNamesSet = new Set(observationVectorLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.observationVectorLayers) {
				if (!observationVectorLayerNamesSet.has(layerName)) {
					if (this.map.getLayer(layerName)) {
						this.map.removeLayer(layerName);
					}
					if (this.map.getSource(layerName)){
						this.map.removeSource(layerName);
					}
					this.observationVectorLayers.delete(layerName);
				}
			}
			for (const vectorLayer of observationVectorLayers) {
				let layer = this.observationVectorLayers.get(vectorLayer.name);
				if (!layer) {
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
					this.adminVectorLayers.set(vectorLayer.name, layer);
				} else {
					if (this.map.getSource(vectorLayer.name)){
						this.map.getSource(vectorLayer.name).setData({
							type: 'FeatureCollection',
							features: vectorLayer.features,
						});
					}
				}
			}
		}
	}
}
