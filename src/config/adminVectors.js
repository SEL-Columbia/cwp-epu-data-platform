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

// TODO: monitor https://github.com/mapbox/mapbox-gl-js/issues/4087 for fill layers with outlines

const adminVectors = [
	new VectorSource({
		name: 'Uganda Regions',
		label: 'Uganda',
		isDefault: true,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1:next.uganda_regions:8',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'AREA' }, { name: 'PERIMETER' }, { name: 'ID' }, { name: 'CAPTION' }],
		regionNameVariable: { name: 'ID' },
		regionParentVariable: { name: 'CAPTION' },
		regionBboxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					'fill-opacity': 0.1,
					'fill-color': '#787b8c',
				},
			},
			line: {
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
		},
	}),
	new VectorSource({
		name: 'Uganda Districts',
		label: 'Uganda',
		isDefault: false,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1:next.uganda_districts:9',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DNAME2016' }, { name: 'DNAMA2017' }, { name: 'DNAME2018' }, { name: 'DNAME2019' }],
		regionNameVariable: { name: 'DNAME2019' },
		regionParentVariable: { name: 'CAPTION' },
		regionBboxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Districts'],
				},
				paint: {
					'fill-opacity': 0.1,
					'fill-color': '#9699a6',
				},
			},
			line: {
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
		},
	}),
	new VectorSource({
		name: 'Uganda Subcounties',
		label: 'Uganda',
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:1:next.uganda_subcounties:11',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'District' }, { name: 'County' }, { name: 'Subcounty' }, { name: 'regions' }],
		regionNameVariable: { name: 'Subcounty' },
		regionParentVariable: { name: 'County' },
		regionBboxVariable: null,
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Subcounties'],
				},
				paint: {
					'fill-opacity': 0.1,
					'fill-color': '#9699a6',
				},
			},
			line: {
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
		},
	}),
	new VectorSource({
		name: 'Uganda Parishes',
		label: 'Uganda',
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:1:next.uganda_parishes:10',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DName2016' }, { name: 'CName2016' }, { name: 'SName2016' }],
		regionNameVariable: { name: 'P' },
		regionParentVariable: { name: 'S' },
		regionBboxVariable: null,
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Parishes'],
				},
				paint: {
					'fill-opacity': 0.1,
					'fill-color': '#9699a6',
				},
			},
			line: {
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
		},
	}),
];

export default adminVectors;
