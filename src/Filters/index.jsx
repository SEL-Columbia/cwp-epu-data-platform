import React from 'react';
import Select from 'react-select';

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
	vectorFiltersByNamesMap,
	selectedBaseMapLayerName,
	selectedRasterLayerName,
	selectedVectorLayerNamesSet,
	onUpdateBaseMapLayer,
	onUpdateRasterLayer,
	onUpdateVectorLayers,
	onUpdateVectorFilters,
	isLoadingVectors,
	isLoadingRasters,
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
				<div className={styles.filterName}><span>{filterName}</span></div>
				<Select
					options={[...valuesSet]}
					value={[...selectedValuesSet]}
					getOptionLabel={(value) => value}
					isOptionSelected={(value) => selectedValuesSet.has(value)}
					isMulti={true}
					onChange={(selectedOption, options) => handleFilterChange(options, vectorName, filterName)}
					hideSelectedOptions={false}
					isDisabled={!valuesSet.size}
					isLoading={isLoadingVectors && !valuesSet.size}
				/>
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
			<div className={styles.headerWrapper}>
				<h2>{'QSEL'}</h2>
			</div>
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
			</div>
		</div>
	);
}
