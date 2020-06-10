export default class RasterSource {
	constructor({ mapboxId, isDefault, minZoom, maxZoom, minNativeZoom, maxNativeZoom, boundingBox, name }) {
		this.mapboxId = mapboxId;
		this.minZoom = minZoom;
		this.maxZoom = maxZoom;
		this.minNativeZoom = minNativeZoom;
		this.maxNativeZoom = maxNativeZoom;
		this.name = name;
		this.isDefault = isDefault;
		this.displayName = name;

		if (boundingBox) {
			boundingBox = boundingBox.split(',');
			this.bounds = [
				[boundingBox[1], boundingBox[0]],
				[boundingBox[3], boundingBox[2]],
			];
		}
	}
}
