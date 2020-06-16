import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Filters from '../Filters';
import Map from '../Map';
import baseMaps from '../config/baseMaps';
import rasterGroups from '../config/rasterGroups';
import vectors from '../config/vectors';

const METADATA_NULL_VALUE = '(null)'

const ZOOM_REGEX = /zoom=([\d+\.]+)/;
const LAT_REGEX = /lat=(-?[\d+\.]+)/;
const LNG_REGEX = /lng=(-?[\d+\.]+)/;


function getFiltersMap(features, whitelist) {
	const filters = {};
	for (const feature of features) {
		for (const property in feature.metadata) {
			if (whitelist.has(property)) {
				if (!filters[property]) {
					filters[property] = { valuesSet: new Set([]), selectedValuesSet: new Set([]) };
				}
				filters[property].valuesSet.add(feature.metadata[property] || METADATA_NULL_VALUE);
				filters[property].selectedValuesSet.add(feature.metadata[property] || METADATA_NULL_VALUE);
			}
		}
	}
	return filters;
}

class App extends Component {
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
			currentBaseMapLayerName: baseMaps.find(({ isDefault }) => isDefault).name,
			currentRasterLayerName: null,
			currentVectorLayerNamesSet: new Set(currentVectorLayers.map(({ name }) => name)),
			rasters: [],
			vectorFeaturesByNamesMap,
			vectorFiltersByNamesMap,
			isLoadingVectors: false,
			isLoadingRasters: false,
		};
	}

	componentDidMount() {
		this.loadVectors();
		this.loadRasters();
	}

	loadVectors = async () => {
		this.setState({ isLoadingVectors: true });
		const { currentVectorLayerNamesSet } = this.state;
		const vectorsToFetch = vectors.filter(({ name }) => currentVectorLayerNamesSet.has(name));
		const nextVectorFeaturesByNamesMap = {};
		const nextVectorFiltersByNamesMap = {};
		await Promise.all(
			vectorsToFetch.map(async (vector) => {
				const features = await vector.fetchData();
				nextVectorFeaturesByNamesMap[vector.name] = features;
				if (vector.filterVariables && vector.filterVariables.length) {
					const filtersMap = getFiltersMap(features, new Set(vector.filterVariables.map(({ name }) => name)));
					nextVectorFiltersByNamesMap[vector.name] = filtersMap;
				}
			}),
		);
		this.setState({
			vectorFeaturesByNamesMap: nextVectorFeaturesByNamesMap,
			vectorFiltersByNamesMap: nextVectorFiltersByNamesMap,
			isLoadingVectors: false,
		});
	};

	loadRasters = async () => {
		this.setState({ isLoadingRasters: true });
		const rasterSourceGroups = await Promise.all(
			rasterGroups.map(async (rasterGroup) => {
				return await rasterGroup.fetchData();
			}),
		);
		const rasters = rasterSourceGroups.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
		this.setState({ rasters, isLoadingRasters: false });
	};

	handleUpdateBaseMapLayer = (currentBaseMapLayerName) => {
		this.setState({ currentBaseMapLayerName });
	}

	handleUpdateRasterLayer = (currentRasterLayerName) => {
		this.setState({ currentRasterLayerName });
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
						feature.metadata[filterName] === undefined ||
						filtersMap[filterName].selectedValuesSet.has(feature.metadata[filterName] || METADATA_NULL_VALUE),
				)
			);
		});
	};

	handleZoomOrPan = (zoom, center) => {
		const {
			location: { pathname },
			history,
		} = this.props;
		history.replace({
			pathname,
			search: `zoom=${zoom}&lat=${center.lat}&lng=${center.lng}`
		});
	}

	getZoomAndCenter = () => {
		const {
			location: {
				search,
			}
		} = this.props;
		const zoomMatch = search.match(ZOOM_REGEX);
		const latMatch = search.match(LAT_REGEX);
		const lngMatch = search.match(LNG_REGEX);
		const object = {};
		if (zoomMatch){
			object.zoom = parseInt(zoomMatch[1], 10);
		}
		if (latMatch && lngMatch){
			object.centroid = [parseFloat(latMatch[1]), parseFloat(lngMatch[1])];
		}

		return object;
	}

	render() {
		const {
			vectorFiltersByNamesMap,
			vectorFeaturesByNamesMap,
			currentRasterLayerName,
			currentVectorLayerNamesSet,
			currentBaseMapLayerName,
			rasters,
			isLoadingVectors,
			isLoadingRasters,
		} = this.state;

		const { zoom, centroid } = this.getZoomAndCenter();

		return (
			<div className={styles.appWrapper}>
				<Filters
					baseMapLayers={baseMaps}
					rasterLayers={rasters}
					vectorLayers={vectors}
					vectorFiltersByNamesMap={vectorFiltersByNamesMap}
					selectedBaseMapLayerName={currentBaseMapLayerName}
					selectedRasterLayerName={currentRasterLayerName}
					selectedVectorLayerNamesSet={currentVectorLayerNamesSet}
					onUpdateBaseMapLayer={this.handleUpdateBaseMapLayer}
					onUpdateRasterLayer={this.handleUpdateRasterLayer}
					onUpdateVectorLayers={this.handleUpdateVectorLayers}
					onUpdateVectorFilters={this.handleUpdateVectorFilters}
					isLoadingVectors={isLoadingVectors}
					isLoadingRasters={isLoadingRasters}
				/>
				<Map
					baseMapLayer={baseMaps.find(({ name }) => name === currentBaseMapLayerName)}
					rasterLayers={rasters.filter(({ name }) => name === currentRasterLayerName)}
					vectorLayers={vectors
						.filter(({ name }) => currentVectorLayerNamesSet.has(name))
						.map((vector) => ({
							...vector,
							features: this.filterFeatures(vector.name, vectorFeaturesByNamesMap[vector.name] || []),
						}))}
					onZoomOrPan={this.handleZoomOrPan}
					zoom={zoom}
					centroid={centroid}
				/>
			</div>
		);
	}
}

export default withRouter(App);
