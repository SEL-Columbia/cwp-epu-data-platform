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
	// {
	// 	name: 'Streets',
	// 	mapboxStyle: 'mapbox://styles/mapbox/streets-v11',
	// 	isDefault: true,
	// },
	{
		name: 'Streets',
		mapboxStyle: 'mapbox://styles/imathews/ckbpms3l74h4e1ipbxbhqivs4',
		isDefault: true,
	},
	{
		name: 'BasemapSatellite',
		mapboxStyle: 'mapbox://styles/imathews/ckbjw25s806j01ipj5fjyi9f4',
	},
	{
		name: 'BasemapSimple_WithTopo',
		mapboxStyle: 'mapbox://styles/imathews/ckbk71nle03i41il6uorr1jpz',
	},
	{
		name: 'SatelliteSimple_MonochromeDark',
		mapboxStyle: 'mapbox://styles/imathews/ckbl1ek0e00g51ipskyv1xtpb',
	},
	{
		name: 'BasemapSimple',
		mapboxStyle: 'mapbox://styles/imathews/ckbjwv03707b21ipjjukqohfw',
	},
	{
		name: 'RoadNetwork_LowOpacityRaster',
		mapboxStyle: 'mapbox://styles/imathews/ckbk765ng03l11im05dbcfscv',
	},
	{
		name: 'Terrain_RGB_Edit1',
		mapboxStyle: 'mapbox://styles/imathews/ckbjwd4a804cy1imp0tf8kz90',
	},
];

export default baseMaps;
