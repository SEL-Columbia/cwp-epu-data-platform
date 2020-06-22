import VectorSource from '../VectorSource';

/*
 * name: display name, required. Must be unique.
 * tableIdentifier: The fully qualified Redivis table identifier. Make sure to point to the current version
 * geoVariables:
 * filterVariables
 * metadataVariables
 * leafletType
 * leafletOptions
 * */

const vectorPriorityByNameMap = { // higher numbers will be rendered on top of lower numbers
	'Uganda Regions': 0,
	'Uganda Districts': 1,
	'Uganda Subcounties': 2,
	'Uganda Parishes': 3,
}

const adminVectors = [
	new VectorSource({
		name: 'Uganda Regions',
		label: 'Uganda',
		isDefault: true,
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_regions:8',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'AREA' }, { name: 'PERIMETER' }, { name: 'ID' }, { name: 'CAPTION' }],
		leafletType: 'geoJSON',
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key': vectorPriorityByNameMap['Uganda Regions'],
			},
			paint: {
				'line-color': '#787b8c',
				'line-width': [
					'interpolate',
					['linear'],
					['zoom'],
					3,
					0.5,
					10,
					2,
				],
				'line-dasharray': [10, 0],
			},
		},
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 2, fill: false };
			},
		},
		maxZoom: 7,
	}),
	new VectorSource({
		name: 'Uganda Districts',
		label: 'Uganda',
		isDefault: true,
		tableIdentifier: 'imathews.uganda_boundaries.uganda_districts',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DNAME2016' }, { name: 'DNAMA2017' }, { name: 'DNAME2018' }, { name: 'DNAME2019' }],
		leafletType: 'geoJSON',
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key': vectorPriorityByNameMap['Uganda Districts'],
			},
			paint: {
				'line-color': '#9699a6',
				'line-width': [
					"interpolate",
					["linear"],
					["zoom"],
					7,
					0.75,
					12,
					1.5
				],
				'line-dasharray': [
					"step",
					["zoom"],
					["literal", [2, 0]],
					7,
					["literal", [2, 2, 6, 2]],
				],
			},
		},
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 2, fill: false, dashArray: '4' };
			},
		},
		minZoom: 7,
		maxZoom: 8,
	}),
	new VectorSource({
		name: 'Uganda Subcounties',
		label: 'Uganda',
		isDefault: true,
		tableIdentifier: 'imathews.uganda_boundaries.uganda_subcounties',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'District' }, { name: 'County' }, { name: 'Subcounty' }, { name: 'regions' }],
		leafletType: 'geoJSON',
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key': vectorPriorityByNameMap['Uganda Subcounties'],
			},
			paint: {
				'line-color': '#9699a6',
				'line-width': [
					"interpolate",
					["linear"],
					["zoom"],
					7,
					0.75,
					12,
					1.5
				],
				'line-dasharray': [
					"step",
					["zoom"],
					["literal", [2, 0]],
					7,
					["literal", [2, 2, 6, 2]],
				],
			},
		},
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 1, fill: false, dashArray: '2' };
			},
		},
		minZoom: 8,
		maxZoom: 9,
	}),
	new VectorSource({
		name: 'Uganda Parishes',
		label: 'Uganda',
		isDefault: true,
		tableIdentifier: 'imathews.uganda_boundaries.uganda_parishes',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DName2016' }, { name: 'CName2016' }, { name: 'SName2016' }],
		leafletType: 'geoJSON',
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key': vectorPriorityByNameMap['Uganda Parishes'],
			},
			paint: {
				'line-color': '#9699a6',
				'line-width': [
					"interpolate",
					["linear"],
					["zoom"],
					7,
					0.75,
					12,
					1.5
				],
				'line-dasharray': [
					"step",
					["zoom"],
					["literal", [2, 0]],
					7,
					["literal", [2, 2, 6, 2]],
				],
			},
		},
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 1, fill: false, dashArray: '1' };
			},
		},
		minZoom: 9,
	}),
];

export default adminVectors;
