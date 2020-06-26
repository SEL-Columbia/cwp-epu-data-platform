import VectorSource from '../VectorSource';

/*
 * name: display name, required. Must be unique.
 * tableIdentifier: The fully qualified Redivis table identifier. Make sure to point to the current version
 * geoVariables:
 * filterVariables
 * metadataVariables
 * */

import adminVectors from './adminVectors';
import vectors from './vectors';

const vectorPriorityByNameMap = { // higher numbers will be rendered on top of lower numbers
	'Uganda Geosurvey Results': 0,
}

const observationVectors = [
	new VectorSource({
		name: 'Uganda Geosurvey Results',
		label: 'Uganda',
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_geosurvey_results:1',
		geoVariables: [{ name: 'lat' }, { name: 'lon' }],
		getGeometry: (lat, lng) => {
			return {
				type: 'Point',
				coordinates: [parseFloat(lng), parseFloat(lat)],
			};
		},
		filterVariables: [{ name: 'cs' }, { name: 'wp' }, { name: 'cp' }],
		metadataVariables: [{ name: 'cs' }, { name: 'wp' }, { name: 'cp' }],
		legend: { mapboxPaintProperty: 'circle-color' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'circle',
		mapboxLayerOptions: {
			layout: {
				'circle-sort-key': adminVectors.length + vectors.length + vectorPriorityByNameMap['Uganda Geosurvey Results'],
			},
			paint: {
				'circle-color': 'rgba(51,255,150,0.6)',
				'circle-radius': 6,
			},
		},
	}),
];

export default observationVectors;
