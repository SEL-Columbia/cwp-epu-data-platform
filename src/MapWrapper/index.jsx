import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Filters from '../Filters';
import Map from '../Map';
import baseMaps from '../config/baseMaps';
import rasterGroups from '../config/rasterGroups';
import vectors from '../config/vectors';
import observationVectors from '../config/observationVectors';
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
		const currentObservationVectorLayers = observationVectors.filter(({ isDefault }) => isDefault);
		const currentAdminVectorLayers = adminVectors.filter(({ isDefault }) => isDefault);
		const vectorFeaturesByNamesMap = {};
		const vectorFiltersByNamesMap = {};
		const observationVectorFeaturesByNamesMap = {};
		const adminVectorFeaturesByNamesMap = {};
		for (const vector of currentVectorLayers) {
			vectorFeaturesByNamesMap[vector.name] = [];
			vectorFiltersByNamesMap[vector.name] = {};
		}
		for (const vector of currentObservationVectorLayers) {
			observationVectorFeaturesByNamesMap[vector.name] = [];
		}
		for (const vector of currentAdminVectorLayers) {
			adminVectorFeaturesByNamesMap[vector.name] = [];
		}
		this.state = {
			currentBaseMapLayerName: baseMaps.find(({ isDefault }) => isDefault).name,
			currentRasterLayerNamesSet: new Set([]),
			currentVectorLayerNamesSet: new Set(currentVectorLayers.map(({ name }) => name)),
			currentAdminVectorLayerName: adminVectors.find(({ isDefault }) => isDefault).name,
			currentObservationVectorLayerNamesSet: new Set(currentObservationVectorLayers.map(({ name }) => name)),
			rasters: [],
			vectorFeaturesByNamesMap,
			vectorFiltersByNamesMap,
			adminVectorFeaturesByNamesMap,
			observationVectorFeaturesByNamesMap,
			isLoadingRasters: false,
			isLoadingVectors: false,
			isLoadingObservationVectors: false,
			isLoadingAdminVectors: false,
		};
	}

	componentDidMount() {
		this.loadRasters();
		this.loadVectors();
		this.loadObservationVectors();
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

	loadObservationVectors = async () => {
		this.setState({ isLoadingObservationVectors: true });
		const { currentObservationVectorLayerNamesSet } = this.state;
		const vectorsToFetch = observationVectors.filter(({ name }) => currentObservationVectorLayerNamesSet.has(name));
		const nextObservationVectorFeaturesByNamesMap = {};
		await Promise.all(
			vectorsToFetch.map(async (vector) => {
				const features = await vector.fetchData();
				nextObservationVectorFeaturesByNamesMap[vector.name] = features;
			}),
		);
		this.setState({
			observationVectorFeaturesByNamesMap: nextObservationVectorFeaturesByNamesMap,
			isLoadingObservationVectors: false,
		});
	};

	loadAdminVectors = async () => {
		this.setState({ isLoadingAdminVectors: true });
		const { currentAdminVectorLayerName } = this.state;
		const vectorsToFetch = adminVectors.filter(({ name }) => currentAdminVectorLayerName === name);
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

	handleUpdateRasterLayers = (currentRasterLayerNamesSet) => {
		this.setState({ currentRasterLayerNamesSet });
	};

	handleUpdateVectorLayers = (currentVectorLayerNamesSet) => {
		this.setState({ currentVectorLayerNamesSet }, this.loadVectors);
	};

	handleUpdateObservationVectorLayers = (currentObservationVectorLayerNamesSet) => {
		this.setState({ currentObservationVectorLayerNamesSet }, this.loadObservationVectors);
	};

	handleUpdateAdminVectorLayer = (currentAdminVectorLayerName) => {
		this.setState({ currentAdminVectorLayerName }, this.loadAdminVectors)
	}

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
			observationVectorFeaturesByNamesMap,
			currentRasterLayerNamesSet,
			currentVectorLayerNamesSet,
			currentAdminVectorLayerName,
			currentObservationVectorLayerNamesSet,
			currentBaseMapLayerName,
			rasters,
			isLoadingRasters,
			isLoadingVectors,
			isLoadingObservationVectors,
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
						observationVectorLayers={observationVectors}
						selectedAdminVectorLayerName={currentAdminVectorLayerName}
						vectorFiltersByNamesMap={vectorFiltersByNamesMap}
						selectedBaseMapLayerName={currentBaseMapLayerName}
						selectedRasterLayerNamesSet={currentRasterLayerNamesSet}
						selectedVectorLayerNamesSet={currentVectorLayerNamesSet}
						selectedObservationVectorLayerNamesSet={currentObservationVectorLayerNamesSet}
						onUpdateBaseMapLayer={this.handleUpdateBaseMapLayer}
						onUpdateRasterLayers={this.handleUpdateRasterLayers}
						onUpdateVectorLayers={this.handleUpdateVectorLayers}
						onUpdateAdminVectorLayer={this.handleUpdateAdminVectorLayer}
						onUpdateObservationVectorLayers={this.handleUpdateObservationVectorLayers}
						onUpdateVectorFilters={this.handleUpdateVectorFilters}
						isLoadingRasters={isLoadingRasters}
						isLoadingVectors={isLoadingVectors}
						isLoadingObservationVectors={isLoadingObservationVectors}
						isLoadingAdminVectors={isLoadingAdminVectors}
					/>
				</div>
				<div className={styles.map}>
					<Map
						baseMapLayer={baseMaps.find(({ name }) => name === currentBaseMapLayerName)}
						rasterLayers={rasters.filter(({ name }) => currentRasterLayerNamesSet.has(name))}
						vectorLayers={vectors
							.filter(({ name }) => currentVectorLayerNamesSet.has(name))
							.map((vector) => ({
								...vector,
								features: this.filterFeatures(vector.name, vectorFeaturesByNamesMap[vector.name] || []),
							}))
						}
						observationVectorLayers={observationVectors
							.filter(({ name }) => currentObservationVectorLayerNamesSet.has(name))
							.map((vector) => ({
								...vector,
								features: observationVectorFeaturesByNamesMap[vector.name] || [],
							}))
						}
						adminVectorLayers={adminVectors
							.filter(({ name }) => name === currentAdminVectorLayerName)
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
