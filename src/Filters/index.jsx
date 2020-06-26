import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { grey } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Chip from '@material-ui/core/Chip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';

const CustomSwitch = withStyles({
	switchBase: {
		color: grey[200],
		'&$checked': {
			color: grey[500],
		},
		'&$checked + $track': {
			backgroundColor: grey[500],
		},
	},
	checked: {},
	track: {
		backgroundColor: grey[300],
	},
})(Switch);

const CustomRadio = withStyles({
	root: {
		color: grey[300],
		'&$checked': {
			color: grey[500],
		},
	},
	checked: {},
})((props) => <Radio color="default" {...props} />);

const CustomCircularProgress = withStyles({
	root: {
		color: grey[300],
	}
})((props) => <CircularProgress size={15} {...props} />);

const CustomCollapse = withStyles({
	entered: {
		marginBottom: 10,
	},
})(Collapse);

const CustomFormControl = withStyles({
	root: {
		width: '100%',
	},
})(FormControl);

const CustomFormControlLabel = withStyles({
	root: {
		whiteSpace: 'nowrap',
	},
})(FormControlLabel);

const CustomListItem = withStyles({
	root: {
		width: 'calc(100% + 60px)',
		color: grey[900],
		paddingLeft: 30,
		marginLeft: -30,
		marginRight: -30,
	},
})(ListItem)

const CustomListItemText = withStyles({
	primary: {
		fontWeight: 'bold',
	},
})(ListItemText);

const CustomFormHelperText = withStyles({
	root: {
		color: grey[500],
		marginBottom: 0,
		'&:not(:last-of-type)': {
			marginBottom: 0,
		},
	},
})(FormHelperText);

const LegendList = withStyles({
	root: {
		paddingLeft: 20,
		paddingBottom: 10,
		marginRight: 16,
	}
})(List);

import vectorStyles from './vectorStyles'

import * as styles from './styles.css';

function groupOptions(options){
	const groupLabelsSet = new Set([]);
	const groups = [];
	for (const option of options){
		const label = option.label || '';
		if (!groupLabelsSet.has(label)){
			groups.push({ label, options: [] });
			groupLabelsSet.add(label)
		}
		const group = groups.find((group) => group.label === label);
		group.options.push(option);
	}
	return groups;
}

function sortValues(a, b) {
	if (!isNaN(a) && !isNaN(b)){
		return parseInt(b, 10) - parseInt(a, 10);
	} else {
		return b.localeCompare(a);
	}
}

export default function Filters({
	baseMapLayers,
	rasterLayers,
	vectorLayers,
	observationVectorLayers,
	adminVectorLayers,
	selectedAdminVectorLayerName,
	vectorFiltersByNamesMap,
	selectedBaseMapLayerName,
	selectedRasterLayerNamesSet,
	selectedVectorLayerNamesSet,
	selectedObservationVectorLayerNamesSet,
	onUpdateBaseMapLayer,
	onUpdateRasterLayers,
	onUpdateVectorLayers,
	onUpdateObservationVectorLayers,
	onUpdateAdminVectorLayer,
	onUpdateVectorFilters,
	isLoadingRasters,
	isLoadingVectors,
	isLoadingObservationVectors,
	isLoadingAdminVectors,
}) {
	function handleSelectBaseMapLayer(selectedBaseMapLayerName){
		onUpdateBaseMapLayer(selectedBaseMapLayerName);
	}

	function handleToggleVectorLayer(name, checked){
		let nextSelectedVectorLayerNamesSet = new Set([...selectedVectorLayerNamesSet]);
		if (checked){
			nextSelectedVectorLayerNamesSet.add(name);
		} else {
			nextSelectedVectorLayerNamesSet.delete(name);
		}
		onUpdateVectorLayers(nextSelectedVectorLayerNamesSet);
	}

	function handleToggleRasterLayer(name, checked){
		let nextSelectedRasterLayerNamesSet = new Set([...selectedRasterLayerNamesSet]);
		if (checked){
			nextSelectedRasterLayerNamesSet.add(name);
		} else {
			nextSelectedRasterLayerNamesSet.delete(name);
		}
		onUpdateRasterLayers(nextSelectedRasterLayerNamesSet);
	}

	function handleToggleObservationVectorLayer(name, checked){
		let nextSelectedObservationVectorLayerNamesSet = new Set([...selectedObservationVectorLayerNamesSet]);
		if (checked){
			nextSelectedObservationVectorLayerNamesSet.add(name);
		} else {
			nextSelectedObservationVectorLayerNamesSet.delete(name);
		}
		onUpdateObservationVectorLayers(nextSelectedObservationVectorLayerNamesSet);
	};

	function handleSelectAdminVectorLayer(selectedAdminVectorLayerName){
		onUpdateAdminVectorLayer(selectedAdminVectorLayerName);
	}

	function handleToggleFilter(checked, value, filterName, vectorName){
		const nextVectorFiltersByNamesMap = { ...vectorFiltersByNamesMap };

		const nextSelectedValuesSet = new Set([
			...nextVectorFiltersByNamesMap[vectorName][filterName].selectedValuesSet,
		]);

		if (checked){
			nextSelectedValuesSet.add(value);
		} else {
			nextSelectedValuesSet.delete(value);
		}

		onUpdateVectorFilters({
			...vectorFiltersByNamesMap,
			[vectorName]: {
				...vectorFiltersByNamesMap[vectorName],
				[filterName]: {
					...vectorFiltersByNamesMap[vectorName][filterName],
					selectedValuesSet: nextSelectedValuesSet,
				},
			},
		});
	}

	function renderLegend(checked, option){
		const { name, mapboxLayerOptions, legendVariable, legend, customLegend } = option;

		if (legendVariable) {
			const filtersMap = vectorFiltersByNamesMap[name];

			const legendFilter = {
				vectorName: name,
				filterName: legendVariable.name,
				valuesSet: ((filtersMap || {})[legendVariable.name] || {}).valuesSet,
				selectedValuesSet: ((filtersMap || {})[legendVariable.name] || {}).selectedValuesSet,
			}

			const {
				vectorName,
				filterName,
				valuesSet = new Set([]),
				selectedValuesSet = new Set([]),
			} = legendFilter;
			const values = [...valuesSet];

			const colorsByValue = {};
			const mapboxColorConfig = mapboxLayerOptions.paint[legendVariable.mapboxPaintProperty].slice(2);
			for (let i = 0; i < mapboxColorConfig.length; i += 2) {
				if (i === mapboxColorConfig.length - 1) {
					colorsByValue.default = mapboxColorConfig[i];
				} else {
					colorsByValue[mapboxColorConfig[i]] = mapboxColorConfig[i + 1];
				}
			}

			return (
				<Collapse in={checked} timeout="auto" unmountOnExit>
					<LegendList component="div" disablePadding dense={true}>
						<CustomFormHelperText>{`${legendVariable.name} (${legendVariable.mapboxPaintProperty})`}</CustomFormHelperText>
						{values.sort(sortValues).map((value) => {
							const checked = selectedValuesSet.has(value);
							const LegendListItem = withStyles({
								root: {
									backgroundColor: checked ? colorsByValue[value] || colorsByValue.default : grey[200],
								},
							})(ListItem);

							const LegendSwitch = withStyles({
								switchBase: {
									color: grey[200],
									'&$checked': {
										color: colorsByValue[value] || colorsByValue.default,
									},
									'&$checked + $track': {
										backgroundColor: grey[300],
									},
								},
								checked: {},
								track: {
									backgroundColor: grey[300],
								},
							})(Switch);

							return (
								<LegendListItem
									key={value}
								>
									<ListItemText primary={value}/>
									<ListItemSecondaryAction>
										<LegendSwitch
											edge="end"
											onChange={(e) => handleToggleFilter(e.target.checked, value, filterName, vectorName)}
											checked={checked}
										/>
									</ListItemSecondaryAction>
								</LegendListItem>
							);
						})}
					</LegendList>
				</Collapse>
			);
		} else if (customLegend){
			return (
				<Collapse in={checked} timeout="auto" unmountOnExit>
					<LegendList component="div" disablePadding dense={true}>
						{customLegend.map(({ key, value }) => {
							const LegendListItem = withStyles({
								root: {
									backgroundColor: value,
								},
							})(ListItem);

							return (
								<LegendListItem
									key={key}
								>
									<ListItemText primary={key} />
									<ListItemSecondaryAction>

									</ListItemSecondaryAction>
								</LegendListItem>
							);
						})}
					</LegendList>
				</Collapse>
			);
		} else if (legend){
			const LegendListItem = withStyles({
				root: {
					backgroundColor: checked ? mapboxLayerOptions.paint[legend.mapboxPaintProperty] : grey[200],
				},
			})(ListItem);

			return (
				<Collapse in={checked} timeout="auto" unmountOnExit>
					<LegendList component="div" disablePadding dense={true}>
						<LegendListItem
							key={'legend'}
						>
							<ListItemText primary={legend.mapboxPaintProperty} />
						</LegendListItem>
					</LegendList>
				</Collapse>
			)
		} else {
			return null;
		}
	}

	const [showBasemap, setShowBasemap] = useState(false);
	const [showRasters, setShowRasters] = useState(false);
	const [showVectors, setShowVectors] = useState(false);
	const [showObservationVectors, setShowObservationVectors] = useState(false);
	const [showAdminVectors, setShowAdminVectors] = useState(false);

	return (
		<div className={styles.sideBarWrapper}>
			<div className={styles.bodyWrapper}>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowBasemap(!showBasemap)}>
							<CustomListItemText primary={'Base map'} />
							<Chip size={'small'} label={selectedBaseMapLayerName} />
							{showBasemap ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showBasemap}>
							<RadioGroup
								aria-label="Base map"
								name="Base map"
								value={selectedBaseMapLayerName}
								onChange={(e) => handleSelectBaseMapLayer(e.target.value)}
							>
								{baseMapLayers.map((layer) => {
									const { name } = layer;
									return (
										<CustomFormControlLabel key={name} value={name} control={<CustomRadio />} label={name} />
									);
								})}
							</RadioGroup>
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowVectors(!showVectors)}>
							<CustomListItemText primary={'Pre-existing maps & data'} />
							{!!selectedVectorLayerNamesSet.size && <Chip size={'small'} label={selectedVectorLayerNamesSet.size} />}
							{showVectors ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showVectors}>
							{groupOptions(vectorLayers).map((group) => {
								const { label, options } = group;
								return (
									<React.Fragment key={label}>
										<CustomFormHelperText>{label}</CustomFormHelperText>
										<FormGroup>
											{options.map((option) => {
												const { name } = option;
												const checked = selectedVectorLayerNamesSet.has(name);
												return (
													<React.Fragment key={name}>
														<CustomFormControlLabel
															control={
																<CustomSwitch
																	checked={checked}
																	onChange={(e) => handleToggleVectorLayer(name, e.target.checked)}
																	name={name}
																/>
															}
															label={name}
														/>
														{renderLegend(checked, option)}
													</React.Fragment>
												)
											})}
										</FormGroup>
									</React.Fragment>
								);
							})}
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowRasters(!showRasters)}>
							<CustomListItemText primary={'Landscape predictions'} />
							{!!selectedRasterLayerNamesSet.size && <Chip size={'small'} label={selectedRasterLayerNamesSet.size} />}
							{showRasters ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showRasters}>
							{groupOptions(rasterLayers).map((group) => {
								const { label, options } = group;
								return (
									<React.Fragment key={label}>
										<CustomFormHelperText>{label}</CustomFormHelperText>
										<FormGroup>
											{options.map((option) => {
												const { name } = option;
												const checked = selectedRasterLayerNamesSet.has(name);
												return (
													<React.Fragment key={name}>
														<CustomFormControlLabel
															control={
																<CustomSwitch
																	checked={checked}
																	onChange={(e) => handleToggleRasterLayer(name, e.target.checked)}
																	name={name}
																/>
															}
															label={name}
														/>
														{renderLegend(checked, option)}
													</React.Fragment>
												);
											})}
										</FormGroup>
									</React.Fragment>
								);
							})}
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowObservationVectors(!showObservationVectors)}>
							<CustomListItemText primary={'Landscape observations'} />
							{!!selectedObservationVectorLayerNamesSet.size && <Chip size={'small'} label={selectedObservationVectorLayerNamesSet.size} />}
							{showObservationVectors ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showObservationVectors}>
							{groupOptions(observationVectorLayers).map((group) => {
								const { label, options } = group;
								return (
									<React.Fragment key={label}>
										<CustomFormHelperText>{label}</CustomFormHelperText>
										<FormGroup>
											{options.map((option) => {
												const { name } = option;
												const checked = selectedObservationVectorLayerNamesSet.has(name);
												return (
													<React.Fragment key={name}>
														<CustomFormControlLabel
															control={
																<CustomSwitch
																	checked={checked}
																	onChange={(e) => handleToggleObservationVectorLayer(name, e.target.checked)}
																	name={name}
																/>
															}
															label={name}
														/>
														{renderLegend(checked, option)}
													</React.Fragment>
												)
											})}
										</FormGroup>
									</React.Fragment>
								);
							})}
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowAdminVectors(!showAdminVectors)}>
							<CustomListItemText primary={'Admin polygons'} />
							<Chip edge={'start'} size={'small'} label={selectedAdminVectorLayerName} />
							{showAdminVectors ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showAdminVectors}>
							<RadioGroup
								aria-label="Admin polygons"
								name="Admin polygons"
								value={selectedAdminVectorLayerName}
								onChange={(e) => handleSelectAdminVectorLayer(e.target.value)}
							>
								{groupOptions(adminVectorLayers).map((group) => {
									const { label, options } = group;
									return (
										<React.Fragment key={label}>
											<CustomFormHelperText>{label}</CustomFormHelperText>
											{options.map((option) => {
												const { name } = option;
												return (
													<CustomFormControlLabel key={name} value={name} control={<CustomRadio />} label={name} />
												);
											})}
										</React.Fragment>
									);
								})}
							</RadioGroup>
						</CustomCollapse>
					</CustomFormControl>
				</div>
			</div>
		</div>
	);
}
