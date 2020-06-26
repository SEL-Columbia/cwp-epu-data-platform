import RasterSourceGroup from '../RasterSourceGroup';

const rasterGroups = [
	new RasterSourceGroup({
		name: 'Uganda',
		tableIdentifier: `modilab.uganda_geodata:1.raster_layer_metadata:13`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
		customLegendsByName: {
			['Land Cover Classification']: [
				{ key: 'No buildings, no cropland, no woody cover', value: '#bdbdbd' },
				{ key: 'Woody cover (> 60%)', value: '#4caf50' },
				{ key: 'Cropland', value: '#ef9a9a' },
				{ key: 'Cropland and woody cover (> 60%)', value: '#ffeb3b' },
				{ key: 'Buildings', value: '#f44336' },
				{ key: 'Buildings and woody cover (> 60%)', value: '#f06292' },
				{ key: 'Buildings and cropland', value: '#c66700' },
				{ key: 'Buildings, cropland, and woody cover', value: '#616161' },
			],
			['Prediction of Woodland Presence']: [
				{ key: 'More wooded', value: '#f5f5f5' },
				{ key: 'Less wooded', value: '#424242' },
			],
			['Prediction of Building Presence']: [
				{ key: 'More buildings', value: '#f5f5f5' },
				{ key: 'Fewer buildings', value: '#424242' },
			],
			['Prediction of Crop Presence']: [
				{ key: 'More crop presence', value: '#f5f5f5' },
				{ key: 'Less crop presence', value: '#424242' },
			],
		},
	}),
	new RasterSourceGroup({
		name: 'Ethiopia',
		tableIdentifier: `modilab.ethiopia_geodata:2.raster_layer_metadata:1`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
		customLegendsByName: {
			['Phenology analysis for 3 years (2016-2019)']: [
				{ key: 'In-phase vegetation', value: '#f44336' },
				{ key: 'Out-of-phase vegetation', value: '#76ff03' },
				{ key: 'Dark', value: '#2196f3' },
			],
		},
	}),
];

export default rasterGroups;
