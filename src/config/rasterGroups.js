import RasterSourceGroup from '../RasterSourceGroup';

const rasterGroups = [
	new RasterSourceGroup({
		label: 'Uganda',
		tableIdentifier: `modilab.uganda_geodata:3.raster_layer_metadata:1`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
		customLegendsByName: {
			['Land Cover Classification']: [
				{ name: 'No buildings, no cropland, no woody cover', color: '#bdbdbd' },
				{ name: 'Woody cover (> 60%)', color: '#4caf50' },
				{ name: 'Cropland', color: '#ef9a9a' },
				{ name: 'Cropland and woody cover (> 60%)', color: '#ffeb3b' },
				{ name: 'Buildings', color: '#f44336' },
				{ name: 'Buildings and woody cover (> 60%)', color: '#f06292' },
				{ name: 'Buildings and cropland', color: '#c66700' },
				{ name: 'Buildings, cropland, and woody cover', color: '#616161' },
			],
			['Prediction of Woodland Presence']: [
				{ name: 'More wooded', color: '#f5f5f5' },
				{ name: 'Less wooded', color: '#424242' },
			],
			['Prediction of Building Presence']: [
				{ name: 'More buildings', color: '#f5f5f5' },
				{ name: 'Fewer buildings', color: '#424242' },
			],
			['Prediction of Crop Presence']: [
				{ name: 'More crop presence', color: '#f5f5f5' },
				{ name: 'Less crop presence', color: '#424242' },
			],
		},
	}),
	new RasterSourceGroup({
		label: 'Ethiopia',
		tableIdentifier: `modilab.ethiopia_geodata:2.raster_layer_metadata:1`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
		customLegendsByName: {
			['Phenology analysis for 3 years (2016-2019)']: [
				{ name: 'In-phase vegetation', color: '#f44336' },
				{ name: 'Out-of-phase vegetation', color: '#76ff03' },
				{ name: 'Dark', color: '#2196f3' },
			],
		},
	}),
];

export default rasterGroups;
