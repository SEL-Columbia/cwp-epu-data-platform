import Papa from 'papaparse';

export default [
	{
		kind: 'raster',
		displayName: 'Satellite',
		name: 'satellite',
		id: 'mapbox.satellite',
		centroid: [11.2, 37],
	},
	{
		kind: 'raster',
		displayName: 'Streets',
		name: 'streets',
		id: 'mapbox.mapbox-streets-v8',
		centroid: [11.2, 37],
	},
	{
		kind: 'raster',
		displayName: 'Terrain',
		name: 'terrain',
		id: 'mapbox.mapbox-terrain-v2',
		centroid: [11.2, 37],
	},
	{
		kind: 'raster',
		displayName: 'Vegetation',
		name: 'qgis_orig_ethiopia_raster_wgs-9hdbbn',
		id: 'droquo.0rcmj345',
		bounds: [
			[11.2, 37.0],
			[13.1, 38.3],
		],
		minNativeZoom: 9,
		maxNativeZoom: 15,
	},
	{
		kind: 'vector',
		displayName: 'Power lines',
		name: 'powerlines',
		leafletType: 'geoJSON',
		leafletOptions: {
			style: () => {
				return { color: 'rgba(255,129,255,0.3)' };
			},
		},
		filterNamesWhitelist: new Set(['Voltage', 'Status', 'Phase']),
		fetchData: async (filters) => {
			const response = await fetch(`./data/powerlines.csv`, {
				method: 'GET',
			});
			const text = await response.text();
			return Papa.parse(text, { header: true })
				.data.filter((row) => row.geom)
				.map((row) => {
					// TODO: metadata
					const geography = JSON.parse(row.geom);
					delete row.geom;
					return { geography, metadata: row };
				});
		},
	},
	{
		kind: 'vector',
		displayName: 'Geo survey',
		name: 'geosurvey',
		minZoom: 10,
		leafletType: 'circleMarker',
		leafletOptions: { color: 'rgba(51,255,150,0.6)', radius: 1 },
		filterNamesWhitelist: new Set(['cs', 'wp', 'cp']),
		fetchData: async (filters) => {
			const response = await fetch(`./data/geosurvey.csv`, {
				method: 'GET',
			});
			const text = await response.text();
			return Papa.parse(text, { header: true })
				.data.filter((row) => row.lat !== undefined && row.lon !== undefined)
				.map((row) => {
					// TODO: metadata
					return { geography: [row.lat, row.lon], metadata: row };
				});
		},
	},
];
