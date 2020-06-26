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

const METADATA_NULL_VALUE = '(null)';

const ZOOM_REGEX = /&zoom=([\d+\.]+)/;
const LAT_REGEX = /&lat=(-?[\d+\.]+)/;
const LNG_REGEX = /&lng=(-?[\d+\.]+)/;
const BBOX_REGEX = /&bbox=(-?[\d+\.]+),(-?[\d+\.]+),(-?[\d+\.]+),(-?[\d+\.]+)/;
const REGION_NAME_REGEX = /&region=([^&]+)/;
const ADMIN_LAYER_REGEX = /&adminLayer=([^&]+)/;

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
		const {
			location: { search },
			history,
		} = this.props;

		this.loadRasters();
		this.loadVectors();
		this.loadObservationVectors();
		this.loadAdminVectors();

		const bbox = search.match(BBOX_REGEX);
		if (bbox) {
			const nextSearch = `${search.slice(0, bbox.index)}${search.slice(bbox.index + bbox[0].length)}`;
			history.replace({ search: nextSearch });
		}
	}

	componentDidUpdate(prevProps) {
		const selectedAdminVectorLayerName = this.getSelectedAdminVectorLayerName();
		const previousSelectedAdminVectorLayerName = this.getSelectedAdminVectorLayerName(prevProps);

		if (selectedAdminVectorLayerName !== previousSelectedAdminVectorLayerName) {
			// TODO BUG won't load after admin vector change
			this.loadAdminVectors();
		}
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
				const variableNamesToFilter = new Set([...(vector.filterVariables || []).map(({ name }) => name)]);
				if (vector.legendVariable){
					variableNamesToFilter.add(vector.legendVariable.name);
				}
				if (variableNamesToFilter.size) {
					const filtersMap = getFiltersMap(features, variableNamesToFilter);
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
		const selectedAdminVectorLayerName = this.getSelectedAdminVectorLayerName();
		// const vectorsToFetch = adminVectors.filter(({ name }) => name === currentAdminVectorLayerName);
		const vectorsToFetch = adminVectors.filter(({ name }) => name === selectedAdminVectorLayerName);
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
	};

	handleUpdateRasterLayers = (currentRasterLayerNamesSet) => {
		this.setState({ currentRasterLayerNamesSet });
	};

	handleUpdateVectorLayers = (currentVectorLayerNamesSet) => {
		this.setState({ currentVectorLayerNamesSet }, this.loadVectors);
	};

	handleUpdateObservationVectorLayers = (currentObservationVectorLayerNamesSet) => {
		this.setState({ currentObservationVectorLayerNamesSet }, this.loadObservationVectors);
	};

	// handleUpdateAdminVectorLayer = (currentAdminVectorLayerName) => {
	// 	this.setState({ currentAdminVectorLayerName }, this.loadAdminVectors)
	// };
	handleUpdateAdminVectorLayer = (currentAdminVectorLayerName) => {
		const {
			location: { search },
			history,
		} = this.props;
		const regionName = search.match(REGION_NAME_REGEX);
		let nextSearch = regionName
			? `${search.slice(0, regionName.index)}${search.slice(regionName.index + regionName[0].length)}`
			: search;

		const adminLayer = nextSearch.match(ADMIN_LAYER_REGEX);
		nextSearch = adminLayer
			? `${nextSearch.slice(0, adminLayer.index)}${
					adminLayer ? `&adminLayer=${encodeURIComponent(currentAdminVectorLayerName)}` : ''
			  }${nextSearch.slice(adminLayer.index + adminLayer[0].length)}`
			: nextSearch.concat(`&adminLayer=${encodeURIComponent(currentAdminVectorLayerName)}`);

		history.replace({ search: nextSearch });
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
						filtersMap[filterName].selectedValuesSet.has(
							feature.metadata[filterName] || METADATA_NULL_VALUE,
						),
				)
			);
		});
	};

	handleAdminVectorFeatureClick = (properties) => {
		const {
			location: { search },
			history,
		} = this.props;
		if (properties.regionName) {
			const regionName = search.match(REGION_NAME_REGEX);

			const nextSearch = regionName
				? `${search.slice(0, regionName.index)}${
						properties ? `&region=${encodeURIComponent(properties.regionName)}` : ''
				  }${search.slice(regionName.index + regionName[0].length)}`
				: search.concat(`&region=${encodeURIComponent(properties.regionName)}`);

			history.replace({ search: nextSearch });
		}
	};

	handleZoomOrPan = (zoom, center) => {
		const {
			location: { pathname, search },
			history,
		} = this.props;
		const regionName = search.match(REGION_NAME_REGEX);
		const adminLayer = search.match(ADMIN_LAYER_REGEX);
		let nextSearch = `&zoom=${zoom}&lng=${center.lng}&lat=${center.lat}`;
		if (regionName) {
			nextSearch = nextSearch.concat(regionName[0]);
		}
		if (adminLayer) {
			nextSearch = nextSearch.concat(adminLayer[0]);
		}
		history.replace({
			pathname,
			search: nextSearch,
		});
	};

	getZoomAndCenter = () => {
		const {
			location: { search },
		} = this.props;
		const zoomMatch = search.match(ZOOM_REGEX);
		const latMatch = search.match(LAT_REGEX);
		const lngMatch = search.match(LNG_REGEX);
		const bbox = search.match(BBOX_REGEX);
		const object = {};
		if (zoomMatch) {
			object.zoom = parseInt(zoomMatch[1], 10);
		}
		if (latMatch && lngMatch) {
			object.center = [parseFloat(lngMatch[1]), parseFloat(latMatch[1])];
		}
		if (bbox) {
			object.boundingBox = [
				[parseFloat(bbox[1]), parseFloat(bbox[3])],
				[parseFloat(bbox[2]), parseFloat(bbox[4])],
			];
		}

		return object;
	};

	getSelectedAdminVectorLayerName = (props = this.props) => {
		const {
			location: { search },
		} = props;

		const adminLayer = search.match(ADMIN_LAYER_REGEX);
		if (adminLayer) {
			return decodeURIComponent(adminLayer[1]);
		} else {
			return adminVectors.find(({ isDefault }) => isDefault).name;
		}
	};

	renderSelectedRegion = (selectedAdminVectorLayerName) => {
		const {
			location: { search },
		} = this.props;
		const { adminVectorFeaturesByNamesMap } = this.state;
		const regionName = search.match(REGION_NAME_REGEX);
		if (regionName && adminVectorFeaturesByNamesMap[selectedAdminVectorLayerName]) {
			const region = adminVectorFeaturesByNamesMap[selectedAdminVectorLayerName].find(
				({ properties }) =>
					properties.regionName.toLowerCase() === decodeURIComponent(regionName[1]).toLowerCase(),
			);
			if (region) {
				return (
					<div className={styles.regionTileWrapper}>
						<div className={styles.regionHeader}>
							<span>{region.properties.regionName}</span>
						</div>
						<div className={styles.regionBody}>
							{Object.keys(region.metadata)
								.filter((key) => key !== 'regionName')
								.map((key) => (
									<p key={key}>
										<b>{key}</b>
										<br />
										<span>{region.metadata[key]}</span>
									</p>
								))}
						</div>
					</div>
				);
			}
		}
		return null;
	};

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

		const { zoom, center, boundingBox } = this.getZoomAndCenter();

		const selectedAdminVectorLayerName = this.getSelectedAdminVectorLayerName();

		return (
			<div className={styles.mapWrapper}>
				{this.renderSelectedRegion(selectedAdminVectorLayerName)}
				<div className={styles.filters}>
					<Filters
						baseMapLayers={baseMaps}
						rasterLayers={rasters}
						vectorLayers={vectors}
						adminVectorLayers={adminVectors}
						observationVectorLayers={observationVectors}
						// selectedAdminVectorLayerName={currentAdminVectorLayerName}
						selectedAdminVectorLayerName={selectedAdminVectorLayerName}
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
							}))}
						observationVectorLayers={observationVectors
							.filter(({ name }) => currentObservationVectorLayerNamesSet.has(name))
							.map((vector) => ({
								...vector,
								features: observationVectorFeaturesByNamesMap[vector.name] || [],
							}))}
						adminVectorLayers={adminVectors
							// .filter(({ name }) => name === currentAdminVectorLayerName)
							.filter(({ name }) => name === selectedAdminVectorLayerName)
							.map((vector) => ({
								...vector,
								features: adminVectorFeaturesByNamesMap[vector.name] || [],
								onFeatureClick: this.handleAdminVectorFeatureClick,
							}))}
						onZoomOrPan={this.handleZoomOrPan}
						zoom={zoom}
						center={center}
						boundingBox={boundingBox}
					/>
				</div>
			</div>
		);
	}
}

export default withRouter(MapWrapper);
