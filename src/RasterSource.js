export default class RasterSource {
	constructor({
		mapboxId,
		isDefault,
		minZoom = 0,
		maxZoom = 24,
		minNativeZoom,
		maxNativeZoom,
		boundingBox,
		name,
		label,
	}) {
		this.name = name;
		this.label = label;
		this.mapboxId = mapboxId;
		this.minZoom = parseInt(minZoom);
		this.maxZoom = parseInt(maxZoom);
		this.minNativeZoom = parseInt(minNativeZoom);
		this.maxNativeZoom = parseInt(maxNativeZoom);
		this.isDefault = isDefault;

		if (boundingBox) {
			boundingBox = boundingBox.split(',');
			// leaflet
			// this.bounds = [
			// 	[parseInt(boundingBox[1]), parseInt(boundingBox[0])],
			// 	[parseInt(boundingBox[3]), parseInt(boundingBox[2])],
			// ];
			this.bounds = [
				parseInt(boundingBox[0]),
				parseInt(boundingBox[1]),
				parseInt(boundingBox[2]),
				parseInt(boundingBox[3]),
			];
		}
	}
}
