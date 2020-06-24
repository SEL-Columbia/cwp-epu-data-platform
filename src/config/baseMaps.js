// default 'Streets' for testing:
// mapboxStyle: 'mapbox://styles/mapbox/streets-v11',

const baseMaps = [
	{
		name: 'Topo',
		mapboxStyle: 'mapbox://styles/imathews/ckbk71nle03i41il6uorr1jpz',
		isDefault: true, // must have one default: true map
	},
	{
		name: 'Satellite',
		mapboxStyle: 'mapbox://styles/imathews/ckbjw25s806j01ipj5fjyi9f4',
	},
	{
		name: 'Streets',
		mapboxStyle: 'mapbox://styles/imathews/ckbpms3l74h4e1ipbxbhqivs4',
	},
	{
		name: 'Dark',
		mapboxStyle: 'mapbox://styles/imathews/ckbl1ek0e00g51ipskyv1xtpb',
	},
	{
		name: 'Simple',
		mapboxStyle: 'mapbox://styles/imathews/ckbjwv03707b21ipjjukqohfw',
	},
];

export default baseMaps;
