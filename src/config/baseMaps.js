import RasterSource from '../RasterSource';

const baseMaps = [
	// new RasterSource({
	// 	name: 'Satellite',
	// 	mapboxId: 'mapbox.satellite',
	// 	isDefault: true,
	// }),
	// new RasterSource({
	// 	name: 'Terrain',
	// 	mapboxId: 'mapbox.mapbox-terrain-v2',
	// }),
	// new RasterSource({
	// 	name: 'Streets',
	// 	mapboxId: 'mapbox.mapbox-streets-v8',
	// }),
	{
		name: 'Streets',
		mapboxStyle: 'mapbox://styles/mapbox/streets-v11',
		isDefault: true,
	},
	// {
	// 	name: 'Terrain_RGB_Edit1',
	// 	mapboxStyle: 'mapbox://styles/imathews/ckbjwd4a804cy1imp0tf8kz90',
	// },
	// {
	// 	name: 'Satellite_Basemap1',
	// 	mapboxStyle: 'mapbox://styles/imathews/ckbjw25s806j01ipj5fjyi9f4',
	// },
	// {
	// 	name: 'Streets_Networks_Basemap',
	// 	mapboxStyle: 'mapbox://styles/imathews/ckbjwv03707b21ipjjukqohfw',
	// },
	// {
	// 	name: 'Decimal',
	// 	mapboxStyle: 'mapbox://styles/imathews/ckbjw724006nh1ipj86huoe0s',
	// },
];

export default baseMaps;
