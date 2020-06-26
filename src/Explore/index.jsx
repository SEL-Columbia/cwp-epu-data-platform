import * as styles from './styles.css';

import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import adminVectors from '../config/adminVectors';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';

const ACCESS_TOKEN = process.env.REDIVIS_API_TOKEN;
const MAX_RESULTS = 10000;
const REGION_GROUP_IMAGE_SIZE = 100;

const imagesByRegionGroup = {
	Uganda: {
		src: `/assets/uganda_outline.png`,
		alt: 'Uganda outline',
		href: `${process.env.ROOT_PATH}/map?zoom=7&lng=32.37&lat=1.313`,
	},
	Ethiopia: {
		src: `/assets/ethiopia_outline.png`,
		alt: 'Ethiopia outline',
		href: `${process.env.ROOT_PATH}/map?zoom=5.82&lng=40.25&lat=8.83`,
	},
	Tanzania: {
		src: `/assets/tanzania_outline.png`,
		alt: 'Tanzania outline',
		href: `${process.env.ROOT_PATH}/map?zoom=6.20&lng=34.55&lat=-6.40`,
	},
};

function getRegionLink(bbox) {
	return `${process.env.ROOT_PATH}/map?bbox=${bbox}`;
}

const CustomNestedList = withStyles((theme) => ({
	root: {
		width: '100%',
		maxWidth: 400,
		backgroundColor: theme.palette.background.paper,
	},
	nested: {
		// paddingLeft: 30,
		paddingLeft: theme.spacing(4),
	},
}))((props) => {
	const {
		group: { regionGroup, regions },
		onToggleRegionIsCollapsed,
		onSelectRegion,
		regionIsCollapsed,
		classes,
	} = props;

	return (
		<List
			component="nav"
			aria-labelledby="nested-list-subheader"
			subheader={
				<ListSubheader component="div" id="nested-list-subheader">
					{regionGroup}
				</ListSubheader>
			}
			className={classes.root}
		>
			{regions
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((region) => {
					const { name, regions } = region;
					const isCollapsed = regionIsCollapsed[regionGroup][name];
					return (
						<React.Fragment key={`${regionGroup}_${name}`}>
							<ListItem button onClick={() => onSelectRegion(region)}>
								{/*<ListItemIcon>*/}
								{/*	<InboxIcon />*/}
								{/*</ListItemIcon>*/}
								<ListItemText primary={name} />
								<ListItemSecondaryAction>
									<IconButton
										edge="end"
										aria-label="comments"
										onClick={() => onToggleRegionIsCollapsed(regionGroup, name)}
									>
										{isCollapsed ? <ExpandLess /> : <ExpandMore />}
									</IconButton>
								</ListItemSecondaryAction>
							</ListItem>
							<Collapse in={isCollapsed} timeout="auto" unmountOnExit>
								<List component="div" disablePadding>
									{regions
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((region) => {
											return (
												<ListItem
													key={`region_${name}_${region.name}`}
													button
													className={classes.nested}
													onClick={() => onSelectRegion(region)}
												>
													{/*<ListItemIcon>*/}
													{/*	<StarBorder />*/}
													{/*</ListItemIcon>*/}
													<ListItemText primary={region.name} />
												</ListItem>
											);
										})}
								</List>
							</Collapse>
						</React.Fragment>
					);
				})}
		</List>
	);
});

// const CustomNestedList = withStyles({
// 	root: {
// 		width: '100%',
// 		maxWidth: 400,
// 		// backgroundColor: theme.palette.background.paper,
// 	},
// 	nested: {
// 		paddingLeft: 30,
// 		// paddingLeft: theme.spacing(4),
// 	},
// })((props) => {
// 	const {
// 		parentRegions,
// 		onToggleRegionIsCollapsed,
// 		onSelectRegion,
// 		regionIsCollapsed,
// 		parentRegionName,
// 		classes,
// 	} = props;
//
// 	return (
// 		parentRegions.map((parentRegion) => {
// 			const { name, regions } = parentRegion;
// 			const isCollapsed = regionIsCollapsed[name];
// 			const hasSubMenu = !!regions && !!regions.length;
// 			return (
// 				<React.Fragment key={`${parentRegionName}_${name}`}>
// 					<ListItem classes={classes.nested} button onClick={() => onSelectRegion(parentRegion)}>
// 						{/*<ListItemIcon>*/}
// 						{/*	<InboxIcon />*/}
// 						{/*</ListItemIcon>*/}
// 						<ListItemText primary={name} />
// 						{hasSubMenu &&
// 							<ListItemSecondaryAction>
// 								<IconButton edge="end" aria-label="comments" onClick={() => onToggleRegionIsCollapsed(name)}>
// 									{isCollapsed ? <ExpandLess /> : <ExpandMore />}
// 								</IconButton>
// 							</ListItemSecondaryAction>
// 						}
// 					</ListItem>
// 					{hasSubMenu &&
// 						<Collapse in={isCollapsed} timeout="auto" unmountOnExit>
// 							<List classes={classes.root} component="div" disablePadding>
// 								<CustomNestedList
// 									parentRegionName={name}
// 									parentRegions={regions}
// 									onSelectRegion={onSelectRegion}
// 									onToggleRegionIsCollapsed={(regionName) => onToggleRegionIsCollapsed(name, regionName)}
// 									regionIsCollapsed={regionIsCollapsed[name]}
// 								/>
// 							</List>
// 						</Collapse>
// 					}
// 				</React.Fragment>
// 			);
// 		})
// 	);
// });
//
// const CustomNestedListWrapper = withStyles({
// 	root: {
// 		width: '100%',
// 		maxWidth: 400,
// 		// backgroundColor: theme.palette.background.paper,
// 	},
// 	nested: {
// 		paddingLeft: 30,
// 		// paddingLeft: theme.spacing(4),
// 	},
// })((props) => {
// 	const {
// 		group: {
// 			regionGroup,
// 			regions,
// 		},
// 		onToggleRegionIsCollapsed,
// 		onSelectRegion,
// 		regionIsCollapsed,
// 		classes,
// 	} = props;
//
// 	return (
// 		<List
// 			component="nav"
// 			aria-labelledby="nested-list-subheader"
// 			subheader={
// 				<ListSubheader component="div" id="nested-list-subheader">
// 					{regionGroup}
// 				</ListSubheader>
// 			}
// 			className={classes.root}
// 		>
// 			<CustomNestedList
// 				parentRegionName={regionGroup}
// 				parentRegions={regions}
// 				onSelectRegion={onSelectRegion}
// 				onToggleRegionIsCollapsed={(name) => onToggleRegionIsCollapsed(regionGroup, name)}
// 				regionIsCollapsed={regionIsCollapsed[regionGroup]}
// 			/>
// 		</List>
// 	);
// })

const CustomCircularProgress = withStyles({
	root: {
		color: grey[300],
	},
})((props) => <CircularProgress size={30} {...props} />);

function nestRegions(parentRegions) {
	const lowerLevelRegion = parentRegions[0];
	const higherLevelRegion = parentRegions[1];

	if (parentRegions.length < 2) {
		return lowerLevelRegion;
	}

	higherLevelRegion.regions = higherLevelRegion.regions.map((region) => ({
		...region,
		regionLevel: higherLevelRegion.regionLevel,
		hierarchyIndex: higherLevelRegion.hierarchyIndex,
		regionGroup: higherLevelRegion.regionGroup,
		regions: [],
	}));

	const parentRegionIndexesByName = {};
	higherLevelRegion.regions.forEach((region, index) => {
		const name = region.name.toLowerCase();
		if (!parentRegionIndexesByName[name]) {
			parentRegionIndexesByName[name] = index;
		}
	});

	lowerLevelRegion.regions.forEach((region) => {
		const parent = region.parent.toLowerCase();
		if (!parent || parentRegionIndexesByName[parent] === undefined) {
			console.error(
				`Region (${region.name}) does not have a parent or parent (${parent}) was not found in higher level regions`,
			);
			return;
		}
		higherLevelRegion.regions[parentRegionIndexesByName[parent]].regions.push({
			...region,
			regionLevel: higherLevelRegion.regionLevel,
			hierarchyIndex: higherLevelRegion.hierarchyIndex,
			regionGroup: higherLevelRegion.regionGroup,
		});
	});

	parentRegions.splice(0, 1);

	return nestRegions(parentRegions);
}

function formatData(adminRegions) {
	const groups = [];
	let indexByRegionGroup = {};
	for (const adminRegion of adminRegions) {
		const { regionGroup } = adminRegion;
		if (indexByRegionGroup[regionGroup] === undefined) {
			indexByRegionGroup[regionGroup] = groups.length;
			groups.push([]);
		}
		groups[indexByRegionGroup[regionGroup]].push(adminRegion);
	}

	return groups.map((group) => {
		group.sort((a, b) => b.hierarchyIndex - a.hierarchyIndex);
		return nestRegions(group);
	});
}

class Explore extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			regionGroups: [],
			regionIsCollapsed: {},
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
					const { name, label, hierarchyIndex } = vector;

					const data = await vector.fetchMetadata();

					return {
						regionLevel: name,
						regionGroup: label,
						hierarchyIndex,
						regions: data.map(({ properties }) => {
							return {
								name: properties.regionName,
								parent: properties.parentRegionName,
								bbox: properties.bbox,
							};
						}),
					};
				}),
		);
		const regionGroups = formatData(adminRegions);

		const regionIsCollapsed = {};
		for (const regionGroup of regionGroups) {
			regionIsCollapsed[regionGroup.regionGroup] = {};
			for (const region of regionGroup.regions) {
				regionIsCollapsed[regionGroup.regionGroup][region.name] = false;
			}
		}

		this.setState({
			regionGroups,
			regionIsCollapsed,
			isLoading: false,
		});
	};

	// renderAdminRegion = (region) => {
	// 	const { name, parent, bbox } = region;
	// 	return (
	// 		<div key={`${parent}_${name}`}>
	// 			<Link to={`${process.env.ROOT_PATH}/map?&bbox=${bbox}`}>
	// 				<span>{name}</span>
	// 			</Link>
	// 		</div>
	// 	);
	// };

	handleToggleRegionIsCollapsed = (regionGroup, regionName) => {
		const { regionIsCollapsed } = this.state;
		const isCollapsed = regionIsCollapsed[regionGroup][regionName];
		const nextRegionIsCollapsed = {
			...regionIsCollapsed,
			[regionGroup]: {
				...regionIsCollapsed[regionGroup],
				[regionName]: !isCollapsed,
			},
		};
		this.setState({ regionIsCollapsed: nextRegionIsCollapsed });
	};

	handleSelectRegion = (region) => {
		const { history } = this.props;
		const { regionGroup, regionLevel, name, bbox } = region;
		const path = `${process.env.ROOT_PATH}/map?&bbox=${bbox}&region=${encodeURIComponent(
			name,
		)}&adminLayer=${encodeURIComponent(regionLevel)}`;
		history.push(path);
	};

	renderAdminRegions = () => {
		const { regionGroups, regionIsCollapsed, isLoading } = this.state;
		if (isLoading) {
			return (
				<div className={styles.loadingWrapper}>
					<CustomCircularProgress />
				</div>
			);
		}

		return regionGroups.map(({ regionGroup, regions }) => (
			<div key={regionGroup} className={styles.regionWrapper}>
				<div className={styles.imageWrapper}>
					<img
						width={REGION_GROUP_IMAGE_SIZE}
						height={REGION_GROUP_IMAGE_SIZE}
						src={`${process.env.ROOT_PATH}${(imagesByRegionGroup[regionGroup] || {}).src}`}
						alt={(imagesByRegionGroup[regionGroup] || {}).alt}
						onClick={() => {
							const { history } = this.props;
							history.push(imagesByRegionGroup[regionGroup].href);
						}}
					/>
				</div>
				<div className={styles.listWrapper}>
					<CustomNestedList
						group={{ regionGroup, regions }}
						regionIsCollapsed={regionIsCollapsed}
						onToggleRegionIsCollapsed={this.handleToggleRegionIsCollapsed}
						onSelectRegion={this.handleSelectRegion}
					/>
					{/*<CustomNestedListWrapper*/}
					{/*	group={{ regionGroup, regions }}*/}
					{/*	regionIsCollapsed={regionIsCollapsed}*/}
					{/*	onToggleRegionIsCollapsed={this.handleToggleRegionIsCollapsed}*/}
					{/*	onSelectRegion={this.handleSelectRegion}*/}
					{/*/>*/}
				</div>
			</div>
		));

		// return adminRegions.map((region) => {
		// 	const { regionLevel, regions = [] } = region;
		// 	return (
		// 		<div key={regionLevel} className={styles.regionWrapper}>
		// 			<div className={styles.regionName}>
		// 				<span className={styles.header}>{regionLevel}</span>
		// 			</div>
		// 			<div className={styles.itemsWrapper}>{regions.map(this.renderAdminRegion)}</div>
		// 		</div>
		// 	);
		// });
	};

	render() {
		// TODO: add ethiopia, tanzania
		return <div className={styles.exploreWrapper}>{this.renderAdminRegions()}</div>;
	}
}

export default withRouter(Explore);
