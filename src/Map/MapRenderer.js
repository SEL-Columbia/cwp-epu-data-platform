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
			unit: 'metric',
		});
		this.map.addControl(scale);
		const nav = new mapboxgl.NavigationControl({
			showCompass: false,
		});
		this.map.addControl(nav, 'top-left');

		this.onZoomOrPan = props.onZoomOrPan;
		this.map.on('zoomend', this.handleZoomEnd);
		this.map.on('moveend', this.handleMoveEnd);

		this.map.once('style.load', () => {
			this.waitForStyleLoad(() => {
				this.update(props, { initialRender: true });
			});
		});
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
		clearTimeout(this.styleTimeout);
		const waiting = () => {
			// TODO: isStyleLoaded() is unreliable - monitor https://github.com/mapbox/mapbox-gl-js/issues/8691
			if (!this.map.isStyleLoaded()) {
				this.styleTimeout = setTimeout(waiting, timeout);
			} else {
				callback();
			}
		};
		waiting();
	}

	removeLayerFromMap = (layer) => {
		const name = layer.id;
		const mapboxLayerTypes = layer.type instanceof Array ? layer.type : [layer.type];
		for (const type of mapboxLayerTypes){
			const id = `${name}_${type}`;
			if (this.map.getLayer(id)) {
				// remove layer from map;
				this.map.removeLayer(id);
			}
		}
		if (this.map.getSource(name)){
			// remove source from map;
			this.map.removeSource(name);
		}
	};

	addVectorLayerToMap = (vectorLayer) => {
		const {
			name,
			mapboxSourceType,
			mapboxLayerType,
			mapboxLayerOptions = {},
			features,
			minZoom,
			maxZoom,
			onFeatureClick,
		} = vectorLayer;

		// define source
		const source = {
			type: mapboxSourceType,
			data: {
				type: 'FeatureCollection',
				features,
			},
		};
		// add source to map
		if (!this.map.getSource(name)){
			this.map.addSource(name, source);
		}
		// define layer
		const layer = {
			id: name,
			type: mapboxLayerType,
			source: name,
			...mapboxLayerOptions,
		};
		const mapboxLayerTypes = mapboxLayerType instanceof Array ? mapboxLayerType : [mapboxLayerType];
		for (const type of mapboxLayerTypes){
			const id = `${name}_${type}`;
			const mapLayer = {
				id,
				type,
				source: name,
				...(mapboxLayerType instanceof Array ? mapboxLayerOptions[type] : mapboxLayerOptions),
			};
			if (minZoom) {
				mapLayer.minzoom = minZoom;
			}
			if (maxZoom) {
				mapLayer.maxzoom = maxZoom;
			}
			// add layer to map
			if (!this.map.getLayer(id)){
				this.map.addLayer(mapLayer);
				// set tooltip listener
				this.map.on('click', id, (e) => {
					let features = this.map.queryRenderedFeatures(e.point, { layers: [id] });
					// const metadata = e.features[0].properties;
					const metadata = features[0].properties;

					if (onFeatureClick){
						onFeatureClick(metadata);
						return;
					}

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
			}
		}

		return layer;
	};

	addRasterLayerToMap = (rasterLayer) => {
		const {
			name,
			mapboxId,
			minNativeZoom,
			maxNativeZoom,
			bounds,
			minZoom,
			maxZoom,
		} = rasterLayer;

		// define source
		const source = {
			type: 'raster',
			tiles: [
				`https://api.mapbox.com/v4/${mapboxId}/{z}/{x}/{y}.png?access_token=${mapboxgl.accessToken}`,
			],
			tileSize: 512,
			minzoom: minNativeZoom,
			maxzoom: maxNativeZoom,
			bounds,
		};

		// add source to map
		if (!this.map.getSource(name)){
			this.map.addSource(name, source);
		}

		// define layer
		const layer = {
			id: name,
			type: 'raster',
			source: name,
		};

		const id = `${name}_raster`;
		const mapLayer = {
			id,
			type: 'raster',
			source: name,
			minzoom: minZoom,
			maxzoom: maxZoom,
			paint: {
				'raster-opacity': 0.8,
			}
		};

		// add layer to map
		if (!this.map.getLayer(id)){
			this.map.addLayer(mapLayer);
		}

		return layer;
	};

	update(
		{
			baseMapLayer,
			rasterLayers,
			vectorLayers,
			observationVectorLayers,
			adminVectorLayers,
			center = DEFAULT_CENTER,
			zoom = DEFAULT_ZOOM,
			boundingBox,
		},
		{ initialRender = false } = {},
	) {
		if (initialRender) {
			this.map.jumpTo({ center, zoom });
		}
		if (boundingBox){
			this.map.fitBounds(boundingBox);
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
						this.removeLayerFromMap(layer);
						this.adminVectorLayers.delete(layerName);
					}
					for (const [layerName, layer] of this.rasterLayers) {
						this.removeLayerFromMap(layer);
						this.rasterLayers.delete(layerName);
					}
					for (const [layerName, layer] of this.vectorLayers) {
						this.removeLayerFromMap(layer);
						this.vectorLayers.delete(layerName);
					}
					for (const [layerName, layer] of this.observationVectorLayers) {
						this.removeLayerFromMap(layer);
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

		this.waitForStyleLoad(() => {
			const adminVectorLayerNamesSet = new Set(adminVectorLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.adminVectorLayers) {
				if (!adminVectorLayerNamesSet.has(layerName)) {
					this.removeLayerFromMap(layer);
					this.adminVectorLayers.delete(layerName);
				}
			}
			for (const vectorLayer of adminVectorLayers) {
				let layer = this.adminVectorLayers.get(vectorLayer.name);
				if (!layer) {
					layer = this.addVectorLayerToMap(vectorLayer);
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
					this.removeLayerFromMap(layer);
					this.rasterLayers.delete(layerName);
				}
			}
			for (const rasterLayer of rasterLayers) {
				let layer = this.rasterLayers.get(rasterLayer.name);
				if (!layer) {
					layer = this.addRasterLayerToMap(rasterLayer);
					this.map.moveLayer(
						`${rasterLayer.name}_${layer.type}`,
						`${adminVectorLayers[0].name}_${
							adminVectorLayers[0].mapboxLayerType instanceof Array ?
								adminVectorLayers[0].mapboxLayerType[0] :
								adminVectorLayers[0].mapboxLayerType
						}`,
					); // place raster underneath first admin layer
					this.rasterLayers.set(rasterLayer.name, layer);
				}
			}

			const vectorLayerNamesSet = new Set(vectorLayers.map(({ name }) => name));
			for (const [layerName, layer] of this.vectorLayers) {
				if (!vectorLayerNamesSet.has(layerName)) {
					this.removeLayerFromMap(layer);
					this.vectorLayers.delete(layerName);
				}
			}
			for (const vectorLayer of vectorLayers) {
				let layer = this.vectorLayers.get(vectorLayer.name);
				if (!layer) {
					layer = this.addVectorLayerToMap(vectorLayer);
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
					this.removeLayerFromMap(layer);
					this.observationVectorLayers.delete(layerName);
				}
			}
			for (const vectorLayer of observationVectorLayers) {
				let layer = this.observationVectorLayers.get(vectorLayer.name);
				if (!layer) {
					layer = this.addVectorLayerToMap(vectorLayer);
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
		});
	}
}
