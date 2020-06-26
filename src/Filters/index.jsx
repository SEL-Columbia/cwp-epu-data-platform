import React from 'react';
import Select from 'react-select';

import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CircularProgress from '@material-ui/core/CircularProgress';
import SelectUI from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
	formControl: {
		minWidth: 344,
		maxWidth: 344,
	},
	chips: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	chip: {
		margin: 3,
	},
	noLabel: {
		marginTop: theme.spacing(3),
	},
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

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

const CustomCheckbox = withStyles({
	root: {
		'&$checked': {
			color: grey[500],
		},
	},
	checked: {},
})((props) => <Checkbox color="default" {...props} />);

const CustomCircularProgress = withStyles({
	root: {
		color: grey[300],
	}
})((props) => <CircularProgress size={15} {...props} />);

const CustomFormControlLabel = withStyles({
	root: {
		whiteSpace: 'nowrap',
	},
})(FormControlLabel);


const CustomFormLabel = withStyles({
	root: {
		color: grey[900],
		fontWeight: 'bold',
		marginBottom: 10,
		'&$focused': {
			color: grey[900],
		},
	},
	focused: {
		color: grey[900],
	}
})(FormLabel);

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

const CustomSelect = withStyles({
	root: {
		'&.focused::after': {
			borderBottomColor: 'red',
		},
	},
})((props) => <SelectUI color="default" {...props} />);

const selectStyles = {
	multiValue: (base, state) => ({
		...base,
		backgroundColor: 'gray',
	}),
	multiValueLabel: (base, state) => ({
		...base,
		fontWeight: 'bold',
		color: 'white',
		paddingRight: 6,
	}),
	multiValueRemove: (base, state) => ({
		...base,
		display: 'none',
	}),
};

import vectorStyles from './vectorStyles'

import * as styles from './styles.css';
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";

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

	function handleBaseMapLayerChange(selectedOption, options){
		const { action } = options;
		let nextSelectedBaseMapLayerName;
		switch (action) {
			case 'select-option':
				nextSelectedBaseMapLayerName = selectedOption.name;
				break;
			case 'remove-value':
			case 'deselect-option':
			case 'clear':
				nextSelectedBaseMapLayerName = baseMapLayers[0].name;
				break;
		}
		onUpdateBaseMapLayer(nextSelectedBaseMapLayerName);
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

	function handleRasterLayerChange(selectedOptions, options) {
		const { action, removedValue, option } = options;
		let nextSelectedRasterLayerNamesSet = new Set([...selectedRasterLayerNamesSet]);
		switch (action) {
			case 'remove-value':
				nextSelectedRasterLayerNamesSet.delete(removedValue.name);
				break;
			case 'deselect-option':
				nextSelectedRasterLayerNamesSet.delete(option.name);
				break;
			case 'select-option':
				nextSelectedRasterLayerNamesSet.add(option.name);
				break;
			case 'clear':
				nextSelectedRasterLayerNamesSet.clear();
				break;
		}
		onUpdateRasterLayers(nextSelectedRasterLayerNamesSet);
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

	function handleVectorLayerChange(selectedOptions, options) {
		const { action, removedValue, option } = options;
		const nextSelectedVectorLayerNamesSet = new Set([...selectedVectorLayerNamesSet]);
		switch (action) {
			case 'remove-value':
				nextSelectedVectorLayerNamesSet.delete(removedValue.name);
				break;
			case 'deselect-option':
				nextSelectedVectorLayerNamesSet.delete(option.name);
				break;
			case 'select-option':
				nextSelectedVectorLayerNamesSet.add(option.name);
				break;
			case 'clear':
				nextSelectedVectorLayerNamesSet.clear();
				break;
		}
		onUpdateVectorLayers(nextSelectedVectorLayerNamesSet);
	};

	function handleToggleObservationVectorLayer(name, checked){
		let nextSelectedObservationVectorLayerNamesSet = new Set([...selectedObservationVectorLayerNamesSet]);
		if (checked){
			nextSelectedObservationVectorLayerNamesSet.add(name);
		} else {
			nextSelectedObservationVectorLayerNamesSet.delete(name);
		}
		onUpdateObservationVectorLayers(nextSelectedObservationVectorLayerNamesSet);
	};

	function handleObservationVectorLayerChange(selectedOptions, options) {
		const { action, removedValue, option } = options;
		const nextSelectedObservationVectorLayerNamesSet = new Set([...selectedObservationVectorLayerNamesSet]);
		switch (action) {
			case 'remove-value':
				nextSelectedObservationVectorLayerNamesSet.delete(removedValue.name);
				break;
			case 'deselect-option':
				nextSelectedObservationVectorLayerNamesSet.delete(option.name);
				break;
			case 'select-option':
				nextSelectedObservationVectorLayerNamesSet.add(option.name);
				break;
			case 'clear':
				nextSelectedObservationVectorLayerNamesSet.clear();
				break;
		}
		onUpdateObservationVectorLayers(nextSelectedObservationVectorLayerNamesSet);
	};

	function handleSelectAdminVectorLayer(selectedAdminVectorLayerName){
		onUpdateAdminVectorLayer(selectedAdminVectorLayerName);
	}

	function handleAdminVectorLayerChange(selectedOption, options){
		const { action } = options;
		let nextSelectedAdminVectorLayerName;
		switch (action) {
			case 'select-option':
				nextSelectedAdminVectorLayerName = selectedOption.name;
				break;
			case 'remove-value':
			case 'deselect-option':
			case 'clear':
				nextSelectedAdminVectorLayerName = baseMapLayers[0].name;
				break;
		}
		onUpdateAdminVectorLayer(nextSelectedAdminVectorLayerName);
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

	function handleFilterChange(options, vectorName, filterName) {
		const { action, removedValue, option } = options;

		const nextVectorFiltersByNamesMap = { ...vectorFiltersByNamesMap };

		const nextSelectedValuesSet = new Set([
			...nextVectorFiltersByNamesMap[vectorName][filterName].selectedValuesSet,
		]);
		switch (action) {
			case 'remove-value':
				nextSelectedValuesSet.delete(removedValue);
				break;
			case 'deselect-option':
				nextSelectedValuesSet.delete(option);
				break;
			case 'select-option':
				nextSelectedValuesSet.add(option);
				break;
			case 'clear':
				nextSelectedValuesSet.clear();
				break;
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
		const { name, mapboxLayerOptions, legendVariable, legend } = option;

		if (legendVariable){
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
			for (let i = 0; i < mapboxColorConfig.length; i += 2){
				if (i === mapboxColorConfig.length - 1){
					colorsByValue.default = mapboxColorConfig[i];
				} else {
					colorsByValue[mapboxColorConfig[i]] = mapboxColorConfig[i+1];
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
									backgroundColor: checked ? colorsByValue[value] : grey[200],
								},
							})(ListItem);

							const LegendSwitch = withStyles({
								switchBase: {
									color: grey[200],
									'&$checked': {
										color: colorsByValue[value],
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
									className={classes.nested}
								>
									<ListItemText primary={value} />
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
							className={classes.nested}
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

	function renderFilter({ vectorName, filterName, valuesSet = new Set([]), selectedValuesSet = new Set([]) }) {
		return (
			<div key={`${vectorName}_${filterName}`} className={styles.filter}>
				<div className={styles.filterName}>
					<span>{filterName}</span>
				</div>
				<FormGroup row>
					{!valuesSet.size && isLoadingVectors &&
						<CustomCircularProgress />
					}
					{[...valuesSet].map((value) => {
						return (
							<div key={value} className={styles.valueWrapper}>
								<CustomFormControlLabel
									control={
										<CustomCheckbox
											icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
											checkedIcon={<CheckBoxIcon fontSize="small" />}
											checked={selectedValuesSet.has(value)}
											onChange={(e) => handleFilterChange(
												{
													action: e.target.checked ? 'select-option' : 'deselect-option',
													option: value,
												},
												vectorName,
												filterName,
											)}
											inputProps={{ 'aria-label': 'primary checkbox' }}
										/>
									}
									label={value}
								/>
							</div>
						)
					})}
				</FormGroup>
				{/*<Select*/}
				{/*	options={[...valuesSet]}*/}
				{/*	value={[...selectedValuesSet]}*/}
				{/*	getOptionLabel={(value) => value}*/}
				{/*	isOptionSelected={(value) => selectedValuesSet.has(value)}*/}
				{/*	isMulti={true}*/}
				{/*	onChange={(selectedOption, options) => handleFilterChange(options, vectorName, filterName)}*/}
				{/*	hideSelectedOptions={false}*/}
				{/*	isDisabled={!valuesSet.size}*/}
				{/*	isLoading={isLoadingVectors && !valuesSet.size}*/}
				{/*/>*/}
			</div>
		);
	}

	function renderFilters({ name, filterVariables = [] }) {
		if (!filterVariables.length) {
			return null;
		}
		const filtersMap = vectorFiltersByNamesMap[name];
		const filters = filterVariables.map((variable) => ({
			vectorName: name,
			filterName: variable.name,
			valuesSet: ((filtersMap || {})[variable.name] || {}).valuesSet,
			selectedValuesSet: ((filtersMap || {})[variable.name] || {}).selectedValuesSet,
		}));

		return (
			<div key={name} className={styles.filterWrapper}>
				<div className={styles.vectorName}><span>{name}</span></div>
				<div className={styles.filters}>{filters.map(renderFilter)}</div>
			</div>
		);
	}

	const groupStyles = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	};
	const groupBadgeStyles = {
		backgroundColor: '#EBECF0',
		borderRadius: '2em',
		color: '#172B4D',
		display: 'inline-block',
		fontSize: 12,
		fontWeight: 'normal',
		lineHeight: '1',
		minWidth: 1,
		padding: '0.16666666666667em 0.5em',
		textAlign: 'center',
	};

	const classes = useStyles();
	const theme = useTheme();

	function getStyles(name, personName, theme) {
		return {
			fontWeight:
				personName.indexOf(name) === -1
					? theme.typography.fontWeightRegular
					: theme.typography.fontWeightMedium,
		};
	}


	const renderGroupLabel = (data) => {
		return (
			<div style={groupStyles} className={styles.groupWrapper}>
				<span>{data.label}</span>
				<span style={groupBadgeStyles} className={styles.groupBadge}>{data.options.length}</span>
			</div>
		)
	}

	return (
		<div className={styles.sideBarWrapper}>
			<div className={styles.bodyWrapper}>
				<div className={styles.sectionWrapper}>
					{/*<div className={styles.sectionHeader}><span>{'Base map'}</span></div>*/}
					<FormControl component="fieldset">
						<CustomFormLabel component="legend">{'Base map'}</CustomFormLabel>
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
					</FormControl>
					{/*<Select*/}
					{/*	options={baseMapLayers}*/}
					{/*	value={baseMapLayers.find(({ name }) => name === selectedBaseMapLayerName)}*/}
					{/*	getOptionLabel={({ name }) => name}*/}
					{/*	isOptionSelected={({ name }) => name === selectedBaseMapLayerName}*/}
					{/*	onChange={handleBaseMapLayerChange}*/}
					{/*	hideSelectedOptions={false}*/}
					{/*/>*/}
				</div>
				<div className={styles.sectionWrapper}>
					{/*<div className={styles.sectionHeader}><span>{'Landscape predictions'}</span></div>*/}
					<FormControl component="fieldset">
						<CustomFormLabel component="legend">{'Landscape predictions'}</CustomFormLabel>
						{groupOptions(rasterLayers).map((group) => {
							const { label, options } = group;
							return (
								<React.Fragment key={label}>
									<CustomFormHelperText>{label}</CustomFormHelperText>
									<FormGroup>
										{options.map((option) => {
											const { name } = option;
											return (
													<CustomFormControlLabel
														control={
															<CustomSwitch
																checked={selectedRasterLayerNamesSet.has(name)}
																onChange={(e) => handleToggleRasterLayer(name, e.target.checked)}
																name={name}
															/>
														}
														label={name}
													/>
											)
										})}
									</FormGroup>
								</React.Fragment>
							);
						})}
					</FormControl>
					{/*<Select*/}
					{/*	options={groupOptions(rasterLayers)}*/}
					{/*	value={rasterLayers.filter(({ name }) => selectedRasterLayerNamesSet.has(name))}*/}
					{/*	getOptionLabel={({ name }) => name}*/}
					{/*	isOptionSelected={({ name }) => selectedRasterLayerNamesSet.has(name)}*/}
					{/*	isMulti={true}*/}
					{/*	onChange={handleRasterLayerChange}*/}
					{/*	hideSelectedOptions={false}*/}
					{/*	isClearable={true}*/}
					{/*	placeholder={'Select rasters...'}*/}
					{/*	isLoading={isLoadingRasters}*/}
					{/*	isDisabled={!rasterLayers.length}*/}
					{/*	formatGroupLabel={renderGroupLabel}*/}
					{/*/>*/}
				</div>
				<div className={styles.sectionWrapper}>
					{/*<div className={styles.sectionHeader}><span>{'Pre-existing maps & data'}</span></div>*/}
					<FormControl component="fieldset">
						<CustomFormLabel component="legend">{'Pre-existing maps & data'}</CustomFormLabel>
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
												<React.Fragment>
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
					</FormControl>
					{/*<Select*/}
					{/*	options={groupOptions(vectorLayers)}*/}
					{/*	value={vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name))}*/}
					{/*	getOptionLabel={({ name }) => name}*/}
					{/*	isOptionSelected={({ name }) => selectedVectorLayerNamesSet.has(name)}*/}
					{/*	isMulti={true}*/}
					{/*	onChange={handleVectorLayerChange}*/}
					{/*	hideSelectedOptions={false}*/}
					{/*	// styles={vectorStyles}*/}
					{/*	isLoading={isLoadingVectors}*/}
					{/*	isDisabled={!vectorLayers.length}*/}
					{/*	formatGroupLabel={renderGroupLabel}*/}
					{/*/>*/}
					{/*<div className={styles.vectorFiltersWrapper}>*/}
					{/*	<div className={styles.sectionHeader}><span>{'Filter by vector values'}</span></div>*/}
					{/*	{!vectorLayers.filter(({ name, filterVariables = [] }) => selectedVectorLayerNamesSet.has(name) && filterVariables.length).length &&*/}
					{/*		<span className={styles.empty}>{'No filterable vectors selected'}</span>*/}
					{/*	}*/}
					{/*	{vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name)).map(renderFilters)}*/}
					{/*</div>*/}
				</div>
				<div className={styles.sectionWrapper}>
					{/*<div className={styles.sectionHeader}><span>{'Landscape observations'}</span></div>*/}
					<FormControl component="fieldset">
						<CustomFormLabel component="legend">{'Landscape observations'}</CustomFormLabel>
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
												<React.Fragment>
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
					</FormControl>
					{/*<Select*/}
					{/*	options={groupOptions(observationVectorLayers)}*/}
					{/*	value={observationVectorLayers.filter(({ name }) => selectedObservationVectorLayerNamesSet.has(name))}*/}
					{/*	getOptionLabel={({ name }) => name}*/}
					{/*	isOptionSelected={({ name }) => selectedObservationVectorLayerNamesSet.has(name)}*/}
					{/*	isMulti={true}*/}
					{/*	onChange={handleObservationVectorLayerChange}*/}
					{/*	hideSelectedOptions={false}*/}
					{/*	// styles={vectorStyles}*/}
					{/*	isLoading={isLoadingObservationVectors}*/}
					{/*	isDisabled={!observationVectorLayers.length}*/}
					{/*	formatGroupLabel={renderGroupLabel}*/}
					{/*/>*/}
				</div>
				<div className={styles.sectionWrapper}>
					{/*<div className={styles.sectionHeader}><span>{'Admin polygons'}</span></div>*/}
					<FormControl component="fieldset">
						<CustomFormLabel component="legend">{'Admin polygons'}</CustomFormLabel>
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
												<CustomFormControlLabel value={name} control={<CustomRadio />} label={name} />
											);
										})}
									</React.Fragment>
								);
							})}
						</RadioGroup>
					</FormControl>
					{/*<Select*/}
					{/*	options={groupOptions(adminVectorLayers)}*/}
					{/*	value={adminVectorLayers.filter(({ name }) => name === selectedAdminVectorLayerName)}*/}
					{/*	getOptionLabel={({ name }) => name}*/}
					{/*	isOptionSelected={({ name }) => name === selectedAdminVectorLayerName}*/}
					{/*	onChange={handleAdminVectorLayerChange}*/}
					{/*	hideSelectedOptions={false}*/}
					{/*	isLoading={isLoadingAdminVectors}*/}
					{/*	formatGroupLabel={renderGroupLabel}*/}
					{/*/>*/}
				</div>
			</div>
		</div>
	);
}
