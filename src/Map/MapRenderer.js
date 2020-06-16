import L from 'leaflet';
import './styles.css';

export default class MapRenderer {
	constructor(elem, props) {
		this.elem = elem;
		this.props = {};
		this.map = L.map(elem, { preferCanvas: true });
		L.control.scale({ position: 'bottomright' }).addTo(this.map);

		this.baseLayers = new Map();
		this.rasterLayers = new Map();
		this.vectorLayers = new Map();
		this.minZoomByLayer = new Map();

		this.onZoomOrPan = props.onZoomOrPan;

		this.update(props, true);
		this.map.on('zoomend', this.handleZoomEnd);
		this.map.on('moveend', this.handleMoveEnd)
	}

	handleMoveEnd = () => {
		const zoom = this.map.getZoom();
		const center = this.map.getCenter();
		this.onZoomOrPan(zoom, center);
	}

	handleZoomEnd = () => {
		const zoom = this.map.getZoom();
		const center = this.map.getCenter();
		this.onZoomOrPan(zoom, center);
		this.updateLayers(zoom);
	}

	updateLayers = (zoom) => {
		for (const [layerName, layer] of this.rasterLayers) {
			if (!this.map.hasLayer(layer)){
				this.map.addLayer(layer);
			}
			if (this.minZoomByLayer.get(layerName) && zoom < this.minZoomByLayer.get(layerName)){
				this.map.removeLayer(layer);
			}
		}
		for (const [layerName, layer] of this.vectorLayers) {
			if (!this.map.hasLayer(layer)){
				this.map.addLayer(layer);
			}
			if (this.minZoomByLayer.get(layerName) && zoom < this.minZoomByLayer.get(layerName)){
				this.map.removeLayer(layer);
			}
		}
	};

	update({ baseMapLayer, rasterLayers, vectorLayers, centroid = [1, 32], zoom = 7 }, initialRender = false) {
		if (initialRender){
			this.map.setView(centroid, zoom);
		}

		let baseLayer = this.baseLayers.get(baseMapLayer.name);
		if (!baseLayer){
			for (const [layerName, layer] of this.baseLayers){
				this.map.removeLayer(layer);
				this.baseLayers.delete(layerName);
			}
			baseLayer = L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
				id: baseMapLayer.mapboxId,
				opacity: 1,
				tileSize: 512,
				zoomOffset: -1,
				accessToken: 'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
			});

			this.map.addLayer(baseLayer);
			this.baseLayers.set(baseMapLayer.name, baseLayer);
		}

		const rasterLayerNamesSet = new Set(rasterLayers.map(({ name }) => name));
		for (const [layerName, layer] of this.rasterLayers){
			if (!rasterLayerNamesSet.has(layerName)){
				this.map.removeLayer(layer);
				this.rasterLayers.delete(layerName);
				this.minZoomByLayer.delete(layerName);
			}
		}
		for (const rasterLayer of rasterLayers) {
			let layer = this.rasterLayers.get(rasterLayer.name);
			if (!layer){
				layer = L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
					id: rasterLayer.mapboxId,
					opacity: 0.8,
					tileSize: 512,
					zoomOffset: -1,
					accessToken:
						'pk.eyJ1IjoiaW1hdGhld3MiLCJhIjoiY2thdnl2cGVsMGtldTJ6cGl3c2tvM2NweSJ9.TXtG4gARAf4bUbnPVxk6uA',
					minNativeZoom: rasterLayer.minNativeZoom + 1,
					maxNativeZoom: rasterLayer.maxNativeZoom + 1,
					bounds: rasterLayer.bounds,
				});
				this.rasterLayers.set(rasterLayer.name, layer);
				if (rasterLayer.minZoom){
					this.minZoomByLayer.set(rasterLayer.name, rasterLayer.minZoom);
				}
			}
		}

		const vectorLayerNamesSet = new Set(vectorLayers.map(({ name }) => name));
		for (const [layerName, layer] of this.vectorLayers){
			if (!vectorLayerNamesSet.has(layerName)){
				this.map.removeLayer(layer);
				this.vectorLayers.delete(layerName);
				this.minZoomByLayer.delete(layerName);
			}
		}
		for (const vectorLayer of vectorLayers) {
			let layer = this.vectorLayers.get(vectorLayer.name);
			if (!layer) {
				layer = new L.FeatureGroup();
				this.vectorLayers.set(vectorLayer.name, layer);
				if (vectorLayer.minZoom){
					this.minZoomByLayer.set(vectorLayer.name, vectorLayer.minZoom)
				}
			}
			layer.clearLayers();
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
