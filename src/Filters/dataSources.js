import Papa from 'papaparse';

export default [
	{
		kind: 'raster',
		name: 'satellite',
		id: 'mapbox.satellite',
	},
	{
		kind: 'raster',
		name: 'Drew',
		id: 'droquo.camx1r7v',
	},
	{
		kind: 'vector',
		name: 'powerlines',
		leafletType: 'geoJSON',
		leafletOptions: {
			style: () => {
				return { color: 'green' };
			},
		},
		fetchData: async (filters) => {
			const response = await fetch(`/data/powerlines.csv`, {
				method: 'GET',
			});
			const text = await response.text();
			return Papa.parse(text, { header: true })
				.data.filter((row) => row.geom)
				.map((row) => {
					// TODO: metadata
					return { geography: JSON.parse(row.geom) };
				});
		},
	},
	{
		kind: 'vector',
		name: 'geosurvey',
		leafletType: 'circleMarker',
		leafletOptions: { color: '#ff3333', radius: 1 },
		fetchData: async (filters) => {
			const response = await fetch(`/data/geosurvey.csv`, {
				method: 'GET',
			});
			return [];
			const text = await response.text();
			return Papa.parse(text, { header: true })
				.data.filter((row) => row.lat !== undefined && row.lon !== undefined)
				.map((row) => {
					// TODO: metadata
					return { geography: [row.lat, row.lon] };
				});
		},
	},
];
