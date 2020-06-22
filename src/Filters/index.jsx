import React from 'react';
import Select from 'react-select';

import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CircularProgress from '@material-ui/core/CircularProgress';
import SelectUI from '@material-ui/core/Select';
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

export default function Filters({
	baseMapLayers,
	rasterLayers,
	vectorLayers,
	adminVectorLayers,
	selectedAdminVectorLayerNamesSet,
	vectorFiltersByNamesMap,
	selectedBaseMapLayerName,
	selectedRasterLayerName,
	selectedVectorLayerNamesSet,
	onUpdateBaseMapLayer,
	onUpdateRasterLayer,
	onUpdateVectorLayers,
	onUpdateVectorFilters,
	isLoadingRasters,
	isLoadingVectors,
	isLoadingAdminVectors,
}) {

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

	function handleRasterLayerChange(selectedOption, options) {
		const { action } = options;
		let nextSelectedRasterLayerName;
		switch (action) {
			case 'select-option':
				nextSelectedRasterLayerName = selectedOption.name;
				break;
			case 'remove-value':
			case 'deselect-option':
			case 'clear':
				nextSelectedRasterLayerName = null;
				break;
		}
		onUpdateRasterLayer(nextSelectedRasterLayerName);
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
							<div className={styles.valueWrapper}>
								<FormControlLabel
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
					<div className={styles.sectionHeader}><span>{'Base map'}</span></div>
					<Select
						options={baseMapLayers}
						value={baseMapLayers.find(({ name }) => name === selectedBaseMapLayerName)}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => name === selectedBaseMapLayerName}
						onChange={handleBaseMapLayerChange}
						hideSelectedOptions={false}
					/>
				</div>
				<div className={styles.sectionWrapper}>
					<div className={styles.sectionHeader}><span>{'Rasters'}</span></div>
					<Select
						options={groupOptions(rasterLayers)}
						value={rasterLayers.find(({ name }) => name === selectedRasterLayerName)}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => name === selectedRasterLayerName}
						onChange={handleRasterLayerChange}
						hideSelectedOptions={false}
						isClearable={true}
						placeholder={'Select raster...'}
						isLoading={isLoadingRasters}
						isDisabled={!rasterLayers.length}
						formatGroupLabel={renderGroupLabel}
					/>
				</div>
				<div className={styles.sectionWrapper}>
					<div className={styles.sectionHeader}><span>{'Vectors'}</span></div>
					{/*<FormControl className={classes.formControl}>*/}
					{/*	<InputLabel id="demo-mutiple-chip-label">{'Vectors'}</InputLabel>*/}
					{/*	<CustomSelect*/}
					{/*		labelId="demo-mutiple-chip-label"*/}
					{/*		id="demo-mutiple-chip"*/}
					{/*		multiple*/}
					{/*		value={*/}
					{/*			vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name)).length ?*/}
					{/*			vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name)).map(({ name }) => name) :*/}
					{/*			[]*/}
					{/*		}*/}
					{/*		placeholder={'Select...'}*/}
					{/*		onChange={*/}
					{/*			(e) => {*/}
					{/*				const selectedNames = e.target.value;*/}
					{/*				const options = {}*/}
					{/*				const newName = selectedNames.find((name) => !selectedVectorLayerNamesSet.has(name));*/}
					{/*				if (newName !== undefined){*/}
					{/*					if (newName === ''){*/}
					{/*						options.action = 'clear';*/}
					{/*					} else {*/}
					{/*						options.action = 'select-option';*/}
					{/*						options.option = { name: newName };*/}
					{/*					}*/}
					{/*				} else {*/}
					{/*					const selectedOptionSet = new Set(selectedNames);*/}
					{/*					const oldName = [...selectedVectorLayerNamesSet].find((name) => !selectedOptionSet.has(name));*/}
					{/*					options.action = 'deselect-option';*/}
					{/*					options.option = { name: oldName };*/}
					{/*				}*/}
					{/*				handleVectorLayerChange(null, options);*/}
					{/*			}*/}
					{/*		}*/}
					{/*		input={<Input id="select-multiple-chip" />}*/}
					{/*		renderValue={(selected) => (*/}
					{/*			<div className={classes.chips}>*/}
					{/*				{selected.map((name) => (*/}
					{/*					<Chip key={name} label={name} className={classes.chip} />*/}
					{/*				))}*/}
					{/*			</div>*/}
					{/*		)}*/}
					{/*		MenuProps={MenuProps}*/}
					{/*	>*/}
					{/*		{[*/}
					{/*			<MenuItem key={'none'} value={''}><em>{'None'}</em></MenuItem>,*/}
					{/*			...(vectorLayers.map(({ name }) => (*/}
					{/*				<MenuItem key={name} value={name} style={getStyles(name, vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name)).map(({ name }) => name), theme)}>*/}
					{/*					{name}*/}
					{/*				</MenuItem>*/}
					{/*			)))*/}
					{/*		]}*/}
					{/*	</CustomSelect>*/}
					{/*</FormControl>*/}
					<Select
						options={groupOptions(vectorLayers)}
						value={vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name))}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => selectedVectorLayerNamesSet.has(name)}
						isMulti={true}
						onChange={handleVectorLayerChange}
						hideSelectedOptions={false}
						// styles={vectorStyles}
						isLoading={isLoadingVectors}
						isDisabled={!vectorLayers.length}
						formatGroupLabel={renderGroupLabel}
					/>
					<div className={styles.vectorFiltersWrapper}>
						<div className={styles.sectionHeader}><span>{'Filter by vector values'}</span></div>
						{!vectorLayers.filter(({ name, filterVariables = [] }) => selectedVectorLayerNamesSet.has(name) && filterVariables.length).length &&
							<span className={styles.empty}>{'No filterable vectors selected'}</span>
						}
						{vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name)).map(renderFilters)}
					</div>
				</div>
				<div className={styles.sectionWrapper}>
					<div className={styles.sectionHeader}><span>{'Administrative vectors'}</span></div>
					<Select
						options={adminVectorLayers}
						value={adminVectorLayers.filter(({ name }) => selectedAdminVectorLayerNamesSet.has(name))}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => selectedAdminVectorLayerNamesSet.has(name)}
						isMulti={true}
						isClearable={false}
						styles={selectStyles}
						isLoading={isLoadingAdminVectors}
						isDisabled={true}
					/>
				</div>
			</div>
		</div>
	);
}
