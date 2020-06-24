import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import adminVectors from '../config/adminVectors';
import { withStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';

const ACCESS_TOKEN = process.env.REDIVIS_API_TOKEN;
const MAX_RESULTS = 10000;

const CustomCircularProgress = withStyles({
	root: {
		color: grey[300],
	},
})((props) => <CircularProgress size={30} {...props} />);

class Explore extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			adminRegions: [],
		};
	}

	componentDidMount() {
		this.loadAdminRegions();
	}

	loadAdminRegions = async () => {
		this.setState({ isLoading: true });
		const adminRegions = await Promise.all(
			adminVectors
				.filter(({ showOnHome }) => showOnHome)
				.map(async (vector) => {
					const {
						name,
						tableIdentifier,
						regionNameVariable,
						regionParentVariable,
						regionBboxVariable,
					} = vector;
					const variablesToFetch = [regionNameVariable, regionParentVariable, regionBboxVariable]
						.filter((variable) => !!variable)
						.map(({ name }) => name.toLowerCase());

					const response = await fetch(
						`https://redivis.com/api/v1/tables/${tableIdentifier}/rows?selectedVariables=${variablesToFetch.join(
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
					const data = text
						.split('\n')
						.map((row, i) => {
							return JSON.parse(row);
						})
						.filter((row) => row[0])
						// .map((row) => {
						// 	// TODO remove hard-coded bbox value
						// 	return [row[0], name === 'Uganda Regions' ? null : (row[1] ? row[1] : 'Western Uganda'), '29.572161692311305,29.81919708303206,-1.38842007882397,-1.0072726981518318'];
						// })
						.map((row) => {
							return { name: row[0], parent: row[1], bbox: row[2] };
						});

					return { regionLevel: name, regions: data };
				}),
		);
		this.setState({
			adminRegions,
			isLoading: false,
		});
	};

	renderAdminRegion = (region) => {
		const { name, parent, bbox } = region;
		return (
			<div key={`${parent}_${name}`}>
				<Link to={`${process.env.ROOT_PATH}/map?bbox=${bbox}`}>
					<span>{name}</span>
				</Link>
			</div>
		);
	};

	renderAdminRegions = () => {
		const { adminRegions, isLoading } = this.state;
		if (isLoading) {
			return (
				<div className={styles.regionWrapper}>
					<CustomCircularProgress />
				</div>
			);
		}
		return adminRegions.map((region) => {
			const { regionLevel, regions = [] } = region;
			return (
				<div key={regionLevel} className={styles.regionWrapper}>
					<div className={styles.regionName}>
						<span className={styles.header}>{regionLevel}</span>
					</div>
					<div className={styles.itemsWrapper}>{regions.map(this.renderAdminRegion)}</div>
				</div>
			);
		});
	};

	render() {
		// TODO: add ethiopia, tanzania
		return (
			<div className={styles.exploreWrapper}>
				<img
					width={200}
					height={200}
					src={`${process.env.ROOT_PATH}/assets/uganda_outline.png`}
					alt={'Uganda outline'}
				/>
				<span className={styles.header}>{'Explore regions'}</span>
				{this.renderAdminRegions()}
			</div>
		);
	}
}

export default withRouter(Explore);
