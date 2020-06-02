import React from 'react';

import { Component } from 'react';
import PropTypes from 'prop-types';
import * as styles from './styles.css';
import MapRenderer from './mapRenderer';
import dataSources from '../Filters/dataSources';

export default class Map extends Component {
	static propTypes = {
		tileLayerId: PropTypes.string,
	};

	static defaultProps = {
		vectorLayers: [],
		rasterLayers: [],
	};

	componentDidMount() {
		this.mapRenderer = new MapRenderer(this.mapElement, this.props);
	}

	componentDidUpdate(prevProps) {
		this.mapRenderer.update(this.props);
	}

	render() {
		const rasterLayers = dataSources.filter(({ kind }) => kind === 'raster');
		Promise.all(
			dataSources
				.filter(({ kind }) => kind !== 'raster')
				.map(async (vectorSource) => {
					const features = await vectorSource.fetchData();
					return { ...vectorSource, features };
				}),
		).then((vectorLayers) => {
			this.mapRenderer.update({ ...this.props, vectorLayers, rasterLayers });
		});
		return <div ref={(mapElement) => (this.mapElement = mapElement)} className={styles.wrapper} />;
	}
}
