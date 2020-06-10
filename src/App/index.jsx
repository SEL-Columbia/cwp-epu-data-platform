import * as styles from './styles.css';

import React, { useState, Component } from 'react';

import Filters from '../Filters';
import Map from '../Map';
import RasterSource from '../RasterSource';
import vectors from '../config/vectors';
import baseMaps from '../config/baseMaps';

const ACCESS_TOKEN = process.env.REDIVIS_API_TOKEN;

// export default function App(){
//     const initialRasterLayers = dataSources.filter(({ kind }) => kind === 'raster');
//     const [currentRasterLayers, setCurrentRasterLayers] = useState(initialRasterLayers);
//
//     const initialVectorLayers = dataSources.filter(({ kind }) => kind !== 'raster');
//     const [currentVectorLayers, setCurrentVectorLayers] = useState(initialVectorLayers);
//
//
//     return <div className={styles.appWrapper}>
//         <Filters
//             rasterLayers={currentRasterLayers}
//             vectorLayers={currentVectorLayers}
//             setRasterLayers={setCurrentRasterLayers}
//             setVectorLayers={setCurrentVectorLayers}
//         />
//         <Map
//             rasterLayers={currentRasterLayers}
//             vectorLayers={currentVectorLayers}
//         />
//     </div>
// }

function getFiltersMap(features, whitelist) {
	const filters = {};
	for (const feature of features) {
		for (const property in feature.metadata) {
			if (whitelist.has(property)) {
				if (!filters[property]) {
					filters[property] = { valuesSet: new Set([]), selectedValuesSet: new Set([]) };
				}
				filters[property].valuesSet.add(feature.metadata[property]);
				filters[property].selectedValuesSet.add(feature.metadata[property]);
			}
		}
	}
	return filters;
}

export default class App extends Component {
	constructor(props) {
		super(props);
		const currentVectorLayers = vectors.filter(({ isDefault }) => isDefault);
		const vectorFeaturesByNamesMap = {};
		const vectorFiltersByNamesMap = {};
		for (const vector of currentVectorLayers) {
			vectorFeaturesByNamesMap[vector.name] = [];
			vectorFiltersByNamesMap[vector.name] = {};
		}
		this.state = {
			currentBaseMapName: baseMaps.find(({ isDefault }) => isDefault).name,
			currentRasterLayerNamesSet: new Set(),
			currentVectorLayerNamesSet: new Set(currentVectorLayers.map(({ name }) => name)),
			rasters: [],
			vectorFeaturesByNamesMap,
			vectorFiltersByNamesMap,
		};
		console.log(this.state);
	}

	componentDidMount() {
		this.loadVectors();
		this.loadRasters();
	}

	loadVectors = async () => {
		const { currentVectorLayerNamesSet } = this.state;
		const vectorsToFetch = vectors.filter(({ name }) => currentVectorLayerNamesSet.has(name));
		const nextVectorFeaturesByNamesMap = {};
		const nextVectorFiltersByNamesMap = {};
		await Promise.all(
			vectorsToFetch.map(async (vector) => {
				const features = await vector.fetchData();
				nextVectorFeaturesByNamesMap[vector.name] = features;
				if (vector.filterNamesWhitelist) {
					const filtersMap = getFiltersMap(features, vector.filterNamesWhitelist);
					nextVectorFiltersByNamesMap[vector.name] = filtersMap;
				}
			}),
		);
		this.setState({
			vectorFeaturesByNamesMap: nextVectorFeaturesByNamesMap,
			vectorFiltersByNamesMap: nextVectorFiltersByNamesMap,
		});
	};

	loadRasters = async () => {
		const response = await fetch(
			`https://localhost:8443/api/v1/tables/modilab.uganda_geodata:1.raster_layer_metadata:13/rows?selectedVariables=mapbox_id,zoom_min,zoom_max,bounding_box,CATALOG_NAME&maxResults=10000`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${ACCESS_TOKEN}`,
				},
			},
		);
		const text = await response.text();
		const rasters = text
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
				});
			});
		this.setState({ rasters });
	};

	handleUpdateRasterLayers = (currentRasterLayerNamesSet) => {
		this.setState({ currentRasterLayerNamesSet });
	};

	handleUpdateVectorLayers = (currentVectorLayerNamesSet) => {
		this.setState({ currentVectorLayerNamesSet }, this.loadVectors);
	};

	handleUpdateVectorFilters = (vectorFiltersByNamesMap) => {
		this.setState({ vectorFiltersByNamesMap });
	};

	filterFeatures = (name, features) => {
		const { vectorFiltersByNamesMap } = this.state;
		const filtersMap = vectorFiltersByNamesMap[name];
		const filterNames = [];
		for (const filterName in filtersMap) {
			filterNames.push(filterName);
		}
		return features.filter((feature) => {
			return (
				!feature.metadata ||
				filterNames.every(
					(filterName) =>
						!feature.metadata[filterName] ||
						filtersMap[filterName].selectedValuesSet.has(feature.metadata[filterName]),
				)
			);
		});
	};

	render() {
		const {
			vectorFiltersByNamesMap,
			vectorFeaturesByNamesMap,
			currentRasterLayerNamesSet,
			currentVectorLayerNamesSet,
			currentBaseMapName,
			rasters,
		} = this.state;

		return (
			<div className={styles.appWrapper}>
				<Filters
					baseMapLayers={baseMaps}
					rasterLayers={rasters}
					vectorLayers={vectors}
					vectorFiltersByNamesMap={vectorFiltersByNamesMap}
					selectedRasterLayerNamesSet={currentRasterLayerNamesSet}
					selectedVectorLayerNamesSet={currentVectorLayerNamesSet}
					onUpdateRasterLayers={this.handleUpdateRasterLayers}
					onUpdateVectorLayers={this.handleUpdateVectorLayers}
					onUpdateVectorFilters={this.handleUpdateVectorFilters}
				/>
				<Map
					baseMapLayer={baseMaps.find(({ name }) => name === currentBaseMapName)}
					rasterLayers={rasters.filter(({ name }) => currentRasterLayerNamesSet.has(name))}
					vectorLayers={vectors
						.filter(({ name }) => currentVectorLayerNamesSet.has(name))
						.map((vector) => ({
							...vector,
							features: this.filterFeatures(vector.name, vectorFeaturesByNamesMap[vector.name] || []),
						}))}
				/>
			</div>
		);
	}
}
