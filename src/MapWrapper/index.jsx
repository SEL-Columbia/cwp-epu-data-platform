import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Filters from '../Filters';
import Map from '../Map';
import baseMaps from '../config/baseMaps';
import rasterGroups from '../config/rasterGroups';
import vectors from '../config/vectors';
import adminVectors from '../config/adminVectors';

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

class MapWrapper extends Component {
	constructor(props) {
		super(props);
		const currentVectorLayers = vectors.filter(({ isDefault }) => isDefault);
		const currentAdminVectorLayers = adminVectors.filter(({ isDefault }) => isDefault);
		const vectorFeaturesByNamesMap = {};
		const vectorFiltersByNamesMap = {};
		const adminVectorFeaturesByNamesMap = {};
		for (const vector of currentVectorLayers) {
			vectorFeaturesByNamesMap[vector.name] = [];
			vectorFiltersByNamesMap[vector.name] = {};
		}
		for (const vector of currentAdminVectorLayers) {
			adminVectorFeaturesByNamesMap[vector.name] = [];
		}
		this.state = {
			currentBaseMapLayerName: baseMaps.find(({ isDefault }) => isDefault).name,
			currentRasterLayerName: null,
			currentVectorLayerNamesSet: new Set(currentVectorLayers.map(({ name }) => name)),
			currentAdminVectorLayerNamesSet: new Set(currentAdminVectorLayers.map(({ name }) => name)),
			rasters: [],
			vectorFeaturesByNamesMap,
			vectorFiltersByNamesMap,
			adminVectorFeaturesByNamesMap,
			isLoadingRasters: false,
			isLoadingVectors: false,
			isLoadingAdminVectors: false,
		};
	}

	componentDidMount() {
		this.loadRasters();
		this.loadVectors();
		this.loadAdminVectors();
	}

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

	loadAdminVectors = async () => {
		this.setState({ isLoadingAdminVectors: true });
		const { currentAdminVectorLayerNamesSet } = this.state;
		const vectorsToFetch = adminVectors.filter(({ name }) => currentAdminVectorLayerNamesSet.has(name));
		const nextAdminVectorFeaturesByNamesMap = {};
		await Promise.all(
			vectorsToFetch.map(async (vector) => {
				const features = await vector.fetchData();
				nextAdminVectorFeaturesByNamesMap[vector.name] = features;
			}),
		);
		this.setState({
			adminVectorFeaturesByNamesMap: nextAdminVectorFeaturesByNamesMap,
			isLoadingAdminVectors: false,
		});
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
			search: `zoom=${zoom}&lng=${center.lng}&lat=${center.lat}`
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
			object.center = [parseFloat(lngMatch[1]), parseFloat(latMatch[1])];
		}

		return object;
	}

	render() {
		const {
			vectorFiltersByNamesMap,
			vectorFeaturesByNamesMap,
			adminVectorFeaturesByNamesMap,
			currentRasterLayerName,
			currentVectorLayerNamesSet,
			currentAdminVectorLayerNamesSet,
			currentBaseMapLayerName,
			rasters,
			isLoadingRasters,
			isLoadingVectors,
			isLoadingAdminVectors,
		} = this.state;

		const { zoom, center } = this.getZoomAndCenter();

		return (
			<div className={styles.mapWrapper}>
				<div className={styles.filters}>
					<Filters
						baseMapLayers={baseMaps}
						rasterLayers={rasters}
						vectorLayers={vectors}
						adminVectorLayers={adminVectors}
						selectedAdminVectorLayerNamesSet={currentAdminVectorLayerNamesSet}
						vectorFiltersByNamesMap={vectorFiltersByNamesMap}
						selectedBaseMapLayerName={currentBaseMapLayerName}
						selectedRasterLayerName={currentRasterLayerName}
						selectedVectorLayerNamesSet={currentVectorLayerNamesSet}
						onUpdateBaseMapLayer={this.handleUpdateBaseMapLayer}
						onUpdateRasterLayer={this.handleUpdateRasterLayer}
						onUpdateVectorLayers={this.handleUpdateVectorLayers}
						onUpdateVectorFilters={this.handleUpdateVectorFilters}
						isLoadingRasters={isLoadingRasters}
						isLoadingVectors={isLoadingVectors}
						isLoadingAdminVectors={isLoadingAdminVectors}
					/>
				</div>
				<div className={styles.map}>
					<Map
						baseMapLayer={baseMaps.find(({ name }) => name === currentBaseMapLayerName)}
						rasterLayers={rasters.filter(({ name }) => name === currentRasterLayerName)}
						vectorLayers={vectors
							.filter(({ name }) => currentVectorLayerNamesSet.has(name))
							.map((vector) => ({
								...vector,
								features: this.filterFeatures(vector.name, vectorFeaturesByNamesMap[vector.name] || []),
							}))
						}
						adminVectorLayers={adminVectors
							.filter(({ name }) => currentAdminVectorLayerNamesSet.has(name))
							.map((vector) => ({
								...vector,
								features: adminVectorFeaturesByNamesMap[vector.name] || [],
							}))
						}
						onZoomOrPan={this.handleZoomOrPan}
						zoom={zoom}
						center={center}
					/>
				</div>
			</div>
		);
	}
}

export default withRouter(MapWrapper);
