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
	// Regions
	new VectorSource({
		name: 'Uganda Regions',
		isDefault: true,
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_regions:8',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'AREA' }, { name: 'PERIMETER' }, { name: 'ID' }, { name: 'CAPTION' }],
		leafletType: 'geoJSON',
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 2, fill: false };
			},
		},
	}),
	new VectorSource({
		name: 'Uganda Districts',
		isDefault: true,
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_districts:9',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DNAME2016' }, { name: 'DNAMA2017' }, { name: 'DNAME2018' }, { name: 'DNAME2019' }],
		leafletType: 'geoJSON',
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 2, fill: false, dashArray: '4' };
			},
		},
		minZoom: 8,
	}),
	new VectorSource({
		name: 'Uganda Subcounties',
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_subcounties:11',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'District' }, { name: 'County' }, { name: 'Subcounty' }, { name: 'regions' }],
		leafletType: 'geoJSON',
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 1, fill: false, dashArray: '2' };
			},
		},
		minZoom: 8,
	}),
	new VectorSource({
		name: 'Uganda Parishes',
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_parishes:10',
		geoVariables: [{ name: 'geom' }],
		filterVariables: [],
		metadataVariables: [{ name: 'DName2016' }, { name: 'CName2016' }, { name: 'SName2016' }],
		leafletType: 'geoJSON',
		leafletOptions: {
			style: (feature) => {
				return { color: 'white', weight: 1, fill: false, dashArray: '1' };
			},
		},
		minZoom: 8,
	}),

	new VectorSource({
		name: 'Uganda Electricity Transmission Lines',
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
		leafletType: 'geoJSON',
		leafletOptions: {
			style: (feature) => {
				return { color: 'rgb(32,89,255)', weight: 1 };
			},
		},
	}),
	new VectorSource({
		name: 'Uganda Geosurvey Results',
		tableIdentifier: 'modilab.uganda_geodata:1:current.uganda_geosurvey_results:1',
		geoVariables: [{ name: 'lat' }, { name: 'lon' }],
		getGeometry: (lat, lon) => {
			return [lat, lon];
		},
		filterVariables: [{ name: 'cs' }, { name: 'wp' }, { name: 'cp' }],
		metadataVariables: [{ name: 'cs' }, { name: 'wp' }, { name: 'cp' }],
		leafletType: 'circleMarker',
		leafletOptions: {
			styles: (feature) => {
				return { color: 'rgba(51,255,150,0.6)', radius: 1 }
			},
		},
		minZoom: 9,
	}),
	new VectorSource({
		name: 'UMEME REA power distribution lines 2018',
		isDefault: true,
		tableIdentifier: `modilab.uganda_geodata:1:current.umeme_rea_power_distribution_lines_2018:7`,
		geoVariables: [{ name: 'geom' }],
		filterVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		metadataVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		leafletType: 'geoJSON',
		leafletOptions: {
			style: (feature) => {
				return { color: 'yellow', weight: 1 };
			},
		},
	}),
];

export default vectors;
