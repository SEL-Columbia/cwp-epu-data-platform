import RasterSourceGroup from '../RasterSourceGroup';

const rasterGroups = [
	new RasterSourceGroup({
		label: 'Uganda',
		tableIdentifier: `modilab.uganda_geodata:1.raster_layer_metadata:13`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
		customLegendsByName: {
			['Land Cover Classification']: {
				type: 'categorical',
				categories: [
					{ name: 'No buildings, no cropland, no woody cover', color: '#b1b1b2' },
					{ name: 'Woody cover (> 60%)', color: '#077808' },
					{ name: 'Cropland', color: '#f6bd84' },
					{ name: 'Cropland and woody cover (> 60%)', color: '#f6f896' },
					{ name: 'Buildings', color: '#f80808' },
					{ name: 'Buildings and woody cover (> 60%)', color: '#ed0883' },
					{ name: 'Buildings and cropland', color: '#bc5c1f' },
					{ name: 'Buildings, cropland, and woody cover', color: '#b3b3b4' },
				],
			},
			['Prediction of Woodland Presence']: {
				type: 'continuous',
				min: { name: 'Less wooded', color: '#000000' },
				max: { name: 'More wooded', color: '#ffffff' },
			},
			['Prediction of Building Presence']: {
				type: 'continuous',
				min: { name: 'Fewer buildings', color: '#000000' },
				max: { name: 'More buildings', color: '#ffffff' },
			},
			['Prediction of Crop Presence']: {
				type: 'continuous',
				min: { name: 'Less crop presence', color: '#000000' },
				max: { name: 'More crop presence', color: '#ffffff' },
			},
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
			['Phenology analysis for 3 years (2016-2019)']: {
				type: 'categorical',
				categories: [
					{ name: 'In-phase vegetation', color: '#f44336' },
					{ name: 'Out-of-phase vegetation', color: '#76ff03' },
					{ name: 'Dark', color: '#2196f3' },
				],
			},
		},
	}),
];

export default rasterGroups;
