import * as pako from 'pako';
import * as localforage from 'localforage';

localforage.config({});

const ACCESS_TOKEN = process.env.REDIVIS_API_TOKEN;
const MAX_RESULTS = 10000;
export default class VectorSource {
	constructor({
		name,
		label,
		hierarchyIndex,
		tableIdentifier,
		geoVariables,
		getGeometry,
		isDefault,
		showOnHome,
		filterVariables,
		metadataVariables,
		legendVariable,
		legend,
		regionNameVariable,
		regionParentVariable,
		regionBboxVariable,
		mapboxSourceType,
		mapboxLayerType,
		mapboxLayerOptions,
		minZoom,
		maxZoom,
	}) {
		this.name = name;
		this.label = label;
		this.hierarchyIndex = hierarchyIndex;
		this.tableIdentifier = tableIdentifier;
		this.geoVariables = geoVariables;
		this.filterVariables = filterVariables;
		this.metadataVariables = metadataVariables;
		this.legendVariable = legendVariable;
		this.legend = legend;
		this.regionNameVariable = regionNameVariable;
		this.regionParentVariable = regionParentVariable;
		this.regionBboxVariable = regionBboxVariable;
		this.mapboxSourceType = mapboxSourceType;
		this.mapboxLayerType = mapboxLayerType;
		this.mapboxLayerOptions = mapboxLayerOptions;
		this.minZoom = minZoom;
		this.maxZoom = maxZoom;
		this.isDefault = isDefault;
		this.showOnHome = showOnHome;
		this.getGeometry = getGeometry;
	}

	fetchData = async () => {
		if (this.data) {
			return this.data;
		}
		const variablesSet = new Set([
			...this.geoVariables.map(({ name }) => name.toLowerCase()),
			...this.filterVariables.map(({ name }) => name.toLowerCase()),
			...this.metadataVariables.map(({ name }) => name.toLowerCase()),
		]);
		if (this.regionNameVariable){
			variablesSet.add(this.regionNameVariable.name.toLowerCase());
		}
		if (this.legendVariable){
			variablesSet.add(this.legendVariable.name.toLowerCase());
		}
		const variablesToFetch = [
			...variablesSet,
		];
		const variableToFetchedIndexMap = new Map();

		for (let i = 0; i < variablesToFetch.length; i++) {
			variableToFetchedIndexMap.set(variablesToFetch[i], i);
		}

		const apiEndpoint = `https://redivis.com/api/v1/tables/${
			this.tableIdentifier
		}/rows?selectedVariables=${variablesToFetch.join(',')}&maxResults=${MAX_RESULTS}`;
		try {
			let responseText;
			const currentTableVersion = await getTableVersion(this.tableIdentifier);
			try {
				const cachedVersion = await localforage.getItem(`version_${apiEndpoint}`);
				if (cachedVersion === currentTableVersion) {
					const cachedText = await localforage.getItem(`response_${apiEndpoint}`);
					responseText = pako.inflate(cachedText, { to: 'string' });
				}
			} catch (e) {
				console.error(e);
				await localforage.removeItem(`version_${apiEndpoint}`);
				await localforage.removeItem(`response_${apiEndpoint}`);
			}

			if (!responseText) {
				const response = await fetch(apiEndpoint, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${ACCESS_TOKEN}`,
					},
				});
				if (!response.ok) {
					const text = await response.text();
					throw new Error(text);
				}

				responseText = await response.text();
				try {
					await localforage.setItem(`version_${apiEndpoint}`, currentTableVersion);
					await localforage.setItem(`response_${apiEndpoint}`, pako.deflate(responseText));
				} catch (e) {
					console.error(e);
					await localforage.removeItem(`version_${apiEndpoint}`);
					await localforage.removeItem(`response_${apiEndpoint}`);
				}
			}

			this.data = responseText
				.split('\n')
				.map((row, i) => {
					return JSON.parse(row);
				})
				.filter((row) => row[0])
				.map((row) => {
					const geometry = this.getGeometry
						? this.getGeometry(
								...this.geoVariables.map(
									(geoVariable) => row[variableToFetchedIndexMap.get(geoVariable.name.toLowerCase())],
								),
						  )
						: JSON.parse(row[variableToFetchedIndexMap.get(this.geoVariables[0].name.toLowerCase())]);

					const metadata = {};
					for (const variable of this.metadataVariables) {
						metadata[variable.name] = row[variableToFetchedIndexMap.get(variable.name.toLowerCase())];
					}
					if (this.regionNameVariable){
						metadata.regionName = row[variableToFetchedIndexMap.get(this.regionNameVariable.name.toLowerCase())];
					}
					return { geometry, metadata, properties: metadata };
				});
			return this.data;
		} catch (e) {
			await localforage.removeItem(`version_${apiEndpoint}`);
			await localforage.removeItem(`response_${apiEndpoint}`);
			alert(`An error occurred when fetching data from ${this.tableIdentifier}: ${e.message}`);
			return [];
		}
	};
}

async function getTableVersion(identifier) {
	const response = await fetch(`https://redivis.com/api/v1/tables/${identifier}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${ACCESS_TOKEN}`,
		},
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text);
	}
	const table = await response.json();
	return table.hash;
}
