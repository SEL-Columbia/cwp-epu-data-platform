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

const vectors = [
	new VectorSource({
		name: 'Power lines',
		isDefault: true,
		tableIdentifier: `modilab.uganda_geodata:1:current.umeme_rea_power_distribution_lines_2018:7`,
		geoVariables: [{ name: 'geom' }],
		filterVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		metadataVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		leafletType: 'geoJSON',
		leafletOptions: {
			style: () => {
				return { color: 'rgba(255,129,255,0.3)', 'stroke-width': '1px' };
			},
		},
	}),
	new VectorSource({
		name: 'Geo survey',
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_geosurvey_results:1',
		geoVariables: [{ name: 'lat' }, { name: 'lon' }],
		getGeometry: (lat, lon) => {
			debugger;
			return [lat, lon];
		},
		filterVariables: [{ name: 'cs' }, { name: 'wp' }, { name: 'cp' }],
		metadataVariables: [{ name: 'cs' }, { name: 'wp' }, { name: 'cp' }],
		leafletType: 'circleMarker',
		leafletOptions: { color: 'rgba(51,255,150,0.6)', radius: 1 },
		minZoom: 10,
	}),
];

export default vectors;
