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
	}),
	new RasterSourceGroup({
		name: 'Ethiopia',
		tableIdentifier: `modilab.ethiopia_geodata:2.raster_layer_metadata:1`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
	}),
];

export default rasterGroups;
