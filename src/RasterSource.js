export default class RasterSource {
	constructor({ mapboxId, isDefault, minZoom, maxZoom, minNativeZoom, maxNativeZoom, boundingBox, name }) {
		this.mapboxId = mapboxId;
		this.minZoom = parseInt(minZoom);
		this.maxZoom = parseInt(maxZoom);
		this.minNativeZoom = parseInt(minNativeZoom);
		this.maxNativeZoom = parseInt(maxNativeZoom);
		this.name = name;
		this.isDefault = isDefault;
		this.displayName = name;

		if (boundingBox) {
			boundingBox = boundingBox.split(',');
			this.bounds = [
				[parseInt(boundingBox[1]), parseInt(boundingBox[0])],
				[parseInt(boundingBox[3]), parseInt(boundingBox[2])],
			];
		}
	}
}
