import RasterSource from './RasterSource';

const ACCESS_TOKEN = process.env.REDIVIS_API_TOKEN;
const MAX_RESULTS = 10000;

export default class RasterSourceGroup {
	constructor({
		label,
		tableIdentifier,
		mapboxIdVariable,
		minNativeZoomVariable,
		maxNativeZoomVariable,
		boundingBoxVariable,
		nameVariable,
		customLegendsByName,
	}) {
		this.label = label;
		this.tableIdentifier = tableIdentifier;
		this.mapboxIdVariable = mapboxIdVariable;
		this.minNativeZoomVariable = minNativeZoomVariable;
		this.maxNativeZoomVariable = maxNativeZoomVariable;
		this.boundingBoxVariable = boundingBoxVariable;
		this.nameVariable = nameVariable;
		this.customLegendsByName = customLegendsByName;
	}

	fetchData = async () => {
		if (this.data) {
			return this.data;
		}
		const variablesToFetch = [
			...new Set([
				this.mapboxIdVariable.name.toLowerCase(),
				this.minNativeZoomVariable.name.toLowerCase(),
				this.maxNativeZoomVariable.name.toLowerCase(),
				this.boundingBoxVariable.name.toLowerCase(),
				this.nameVariable.name.toLowerCase(),
			]),
		];

		const response = await fetch(
			`https://redivis.com/api/v1/tables/${this.tableIdentifier}/rows?selectedVariables=${variablesToFetch.join(
				',',
			)}&maxResults=${MAX_RESULTS}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${ACCESS_TOKEN}`,
				},
			},
		);
		if (!response.ok) {
			const text = await response.text();
			alert(text);
			return [];
		}

		const text = await response.text();
		this.data = text
			.split('\n')
			.map((row, i) => {
				return JSON.parse(row);
			})
			.map((row) => {
				return new RasterSource({
					mapboxId: row[0],
					minNativeZoom: row[1],
					maxNativeZoom: row[2],
					boundingBox: row[3],
					name: row[4],
					label: this.label,
					customLegend: this.customLegendsByName && row[4] ? this.customLegendsByName[row[4]] : null,
				});
			});
		return this.data;
	};
}
