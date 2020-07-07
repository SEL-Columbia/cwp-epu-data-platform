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
		customNames: {
			['Prediction of Woodland Presence']: 'Prediction of Woodland Presence (probability)',
			['Prediction of Building Presence']: 'Prediction of Building Presence (probability)',
			['Prediction of Crop Presence']: 'Prediction of Crop Presence (probability)',
		},
		customLegendsByName: {
			['Land Cover Classification']: {
				type: 'categorical',
				categories: [
					{ name: 'No buildings, no cropland, no woody cover', color: '#b9b6b9' },
					{ name: 'Woody cover (> 60%)', color: '#0e7d0e' },
					{ name: 'Cropland', color: '#fec28c' },
					{ name: 'Cropland and woody cover (> 60%)', color: '#fcfe9c' },
					{ name: 'Buildings', color: '#fe0c0c' },
					{ name: 'Buildings and woody cover (> 60%)', color: '#ea3690' },
					{ name: 'Buildings and cropland', color: '#ca7d47' },
					{ name: 'Buildings, cropland, and woody cover', color: '#6d6d6d' },
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
					{ name: 'In-phase vegetation', color: '#ff0000' },
					{ name: 'Out-of-phase vegetation', color: '#00ff00' },
					{ name: 'Dark', color: '#0000ff' },
				],
			},
		},
	}),
];

export default rasterGroups;
