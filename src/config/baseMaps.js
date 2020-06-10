import RasterSource from '../RasterSource';

const baseMaps = [
	new RasterSource({
		name: 'Satellite',
		mapboxId: 'mapbox.satellite',
		isDefault: true,
	}),
	new RasterSource({
		name: 'Terrain',
		mapboxId: 'mapbox.mapbox-terrain-v2',
	}),
	new RasterSource({
		name: 'Streets',
		mapboxId: 'mapbox.mapbox-streets-v8',
	}),
];

export default baseMaps;
