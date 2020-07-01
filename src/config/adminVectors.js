import VectorSource from '../VectorSource';

import {
	DEFAULT_ADMIN_VECTOR_OPACITY,
} from './constants';

/*
 * name: display name, required. Must be unique.
 * label: to assign a grouping to the layer
 * tableIdentifier: The fully qualified Redivis table identifier. Make sure to point to the current version
 * geoVariables:
 * filterVariables
 * metadataVariables
 * */

const vectorPriorityByNameMap = {
	// higher numbers will be rendered on top of lower numbers
	'Uganda Regions': 0,
	'Uganda Districts': 1,
	'Uganda Subcounties': 2,
	'Uganda Parishes': 3,
};

// TODO: monitor https://github.com/mapbox/mapbox-gl-js/issues/4087 for fill layers with outlines

const adminVectorSpecs = [
	{
		name: 'Regions',
		label: 'Uganda',
		hierarchyIndex: 0,
		isDefault: true,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1.uganda_regions:8',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'AREA' }, { name: 'PERIMETER' }, { name: 'ID' }, { name: 'CAPTION' }],
		regionNameVariable: { name: 'ID' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 2],
					'line-dasharray': [10, 0],
				},
			},
		},
	},
	{
		name: 'Districts',
		label: 'Uganda',
		hierarchyIndex: 1,
		isDefault: false,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1:next.uganda_districts:9',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [
			{ name: 'AREA_SQKM', label: 'Area (km^2)' },
			{ name: 'POPPERSQKM', label: 'Population per km^2' },
			{ name: 'CAPTION', label: 'Region' },
		],
		regionNameVariable: { name: 'DNAME2019' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Districts'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
	{
		name: 'Subcounties',
		label: 'Uganda',
		hierarchyIndex: 2,
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:1.uganda_subcounties:11',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'District' }, { name: 'County' }, { name: 'Subcounty' }, { name: 'regions' }],
		regionNameVariable: { name: 'Subcounty' },
		regionParentVariable: { name: 'District' },
		regionBoundingBoxVariable: null,
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Subcounties'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
	{
		name: 'Parishes (full res, 74MB)',
		label: 'Uganda',
		hierarchyIndex: 3,
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:1.uganda_parishes:10',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DName2016' }, { name: 'CName2016' }, { name: 'SName2016' }],
		regionNameVariable: { name: 'P' },
		regionParentVariable: { name: 'S' },
		regionBoundingBoxVariable: null,
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Parishes'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
	// TODO replace duplicate Uganda levels below for actual Ethiopia/Tanzania levels
	{
		name: 'Ethiopia Regions',
		label: 'Ethiopia',
		hierarchyIndex: 0,
		isDefault: true,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1.uganda_regions:8',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'AREA' }, { name: 'PERIMETER' }, { name: 'ID' }, { name: 'CAPTION' }],
		regionNameVariable: { name: 'ID' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 2],
					'line-dasharray': [10, 0],
				},
			},
		},
	},
	{
		name: 'Ethiopia Districts',
		label: 'Ethiopia',
		hierarchyIndex: 1,
		isDefault: false,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1.uganda_districts:9',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DNAME2016' }, { name: 'DNAMA2017' }, { name: 'DNAME2018' }, { name: 'DNAME2019' }],
		regionNameVariable: { name: 'DNAME2019' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Districts'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
	{
		name: 'Tanzania Regions',
		label: 'Tanzania',
		hierarchyIndex: 0,
		isDefault: true,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1.uganda_regions:8',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'AREA' }, { name: 'PERIMETER' }, { name: 'ID' }, { name: 'CAPTION' }],
		regionNameVariable: { name: 'ID' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 2],
					'line-dasharray': [10, 0],
				},
			},
		},
	},
	{
		name: 'Tanzania Districts',
		label: 'Tanzania',
		hierarchyIndex: 1,
		isDefault: false,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:1.uganda_districts:9',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DNAME2016' }, { name: 'DNAMA2017' }, { name: 'DNAME2018' }, { name: 'DNAME2019' }],
		regionNameVariable: { name: 'DNAME2019' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Districts'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
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
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
];

const simplificationTables = [
	{
		name: 'Parishes (100m, 9MB)',
		tableIdentifier: 'imathews.uganda_boundaries:68.table_6:6',
		level: 3,
	},
	{
		name: 'Parishes (500m, 4MB)',
		tableIdentifier: 'imathews.uganda_boundaries:68.table_8:8',
		level: 3,
	},
];

for (const table of simplificationTables) {
	adminVectorSpecs.push({ ...adminVectorSpecs[table.level], ...table });
}

export default adminVectorSpecs.map((obj) => new VectorSource(obj));
