import VectorSource from '../VectorSource';

/*
 * name: display name, required. Must be unique.
 * tableIdentifier: The fully qualified Redivis table identifier. Make sure to point to the current version
 * geoVariables:
 * filterVariables
 * metadataVariables
 * leafletOptions
 * */

import adminVectors from './adminVectors';

const vectorPriorityByNameMap = {
	// higher numbers will be rendered on top of lower numbers
	'Uganda Electricity Transmission Lines': 0,
	'UMEME REA power distribution lines 2018': 1,
};

const vectors = [
	new VectorSource({
		name: 'Uganda Electricity Transmission Lines',
		label: 'Uganda',
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_electricity_transmission_lines:12',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [{ name: 'VOLTAGE_KV' }, { name: 'STATUS' }, { name: 'INSTALLATI' }, { name: 'STRUCTURE_' }],
		metadataVariables: [
			{ name: 'OBJECTID' },
			{ name: 'LINE_ID' },
			{ name: 'LINE_NAME' },
			{ name: 'VOLTAGE_KV' },
			{ name: 'STATUS' },
			{ name: 'STATUS_DET' },
			{ name: 'YEAR_COMMI' },
			{ name: 'YEAR_UPGRA' },
			{ name: 'YEAR_DECOM' },
			{ name: 'INSTALLATI' },
			{ name: 'STRUCTURE_' },
			{ name: 'FINANCIER' },
			{ name: 'CONTRACTOR' },
		],
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key': adminVectors.length + vectorPriorityByNameMap['Uganda Electricity Transmission Lines'],
			},
			paint: {
				// 'line-color': 'rgb(32,89,255)',
				// conditional styling with 'match' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#match
				'line-color': [
					'match',
					['get', 'VOLTAGE_KV'],
					'400',
					'#e55e5e',
					'220',
					'#fbb03b',
					'132',
					'rgb(32,89,255)',
					'66',
					'rgb(51,255,150)',
					'#ccc' /* other */,
				],
				'line-width': 4,
				// TODO: 'line-dasharray' doesn't yet support data expressions (check for 'data-driven styling' row in each layer property at https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line)
				// 'line-dasharray':[
				// 	'match',
				// 	['get', 'STATUS'],
				// 	'Operational',
				// 	['literal', [10, 0]],
				// 	'At Planning Stage',
				// 	['literal', [2, 2, 6, 2]],
				// 	'Under Construction',
				// 	['literal', [2, 2, 6, 2]],
				// 	['literal', [2, 2, 6, 2]], /* other */
				// ],
			},
		},
	}),
	new VectorSource({
		name: 'UMEME REA power distribution lines 2018',
		label: 'Uganda',
		isDefault: true,
		tableIdentifier: `modilab.uganda_geodata:1:v2_5.umeme_rea_power_distribution_lines_2018:7`,
		geoVariables: [{ name: 'geom' }],
		filterVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		metadataVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key':
					adminVectors.length + vectorPriorityByNameMap['UMEME REA power distribution lines 2018'],
			},
			paint: {
				// 'line-color': 'rgb(255,129,255)',
				// conditional styling with 'match' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#match
				'line-color': ['match', ['get', 'Voltage'], '33 kV', '#e55e5e', '11 kV', '#fbb03b', '#ccc' /* other */],
				'line-width': 2,
				// TODO: 'line-dasharray' doesn't yet support data expressions (check for 'data-driven styling' row in each layer property at https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line)
				// 'line-dasharray':[
				// 	'match',
				// 	['get', 'Status'],
				// 	'Existing',
				// 	['literal', [10, 0]],
				// 	'Proposed',
				// 	['literal', [2, 2, 6, 2]],
				// 	'Under construction',
				// 	['literal', [2, 2, 6, 2]],
				// 	['literal', [2, 2, 6, 2]], /* other */
				// ],
			},
		},
	}),
];

export default vectors;
