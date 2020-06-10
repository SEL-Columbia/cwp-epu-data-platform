import React from 'react';
import Select from 'react-select';

import * as styles from './styles.css';

export default function Filters({
	baseMapLayers, // TODO
	rasterLayers,
	vectorLayers,
	vectorFiltersByNamesMap,
	selectedRasterLayerNamesSet,
	selectedVectorLayerNamesSet,
	onUpdateRasterLayers,
	onUpdateVectorLayers,
	onUpdateVectorFilters,
}) {
	function handleRasterLayerChange(selectedOptions, options) {
		const { action, removedValue, option } = options;
		const nextSelectedRasterLayerNamesSet = new Set([...selectedRasterLayerNamesSet]);
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

	function renderFilter({ vectorName, filterName, valuesSet, selectedValuesSet }) {
		return (
			<div key={`${vectorName}_${filterName}`} className={styles.filter}>
				<h5 className={styles.filterName}>{filterName}</h5>
				<Select
					options={[...valuesSet]}
					value={[...selectedValuesSet]}
					getOptionLabel={(value) => value}
					isOptionSelected={(value) => selectedValuesSet.has(value)}
					isMulti={true}
					onChange={(selectedOption, options) => handleFilterChange(options, vectorName, filterName)}
					hideSelectedOptions={false}
				/>
			</div>
		);
	}

	function renderFilters({ name }) {
		const filtersMap = vectorFiltersByNamesMap[name];
		const filters = [];
		for (const filter in filtersMap) {
			filters.push({
				vectorName: name,
				filterName: filter,
				valuesSet: filtersMap[filter].valuesSet,
				selectedValuesSet: filtersMap[filter].selectedValuesSet,
			});
		}
		return (
			<div key={name} className={styles.name}>
				<h4 className={styles.name}>{name}</h4>
				<div className={styles.filters}>{filters.map(renderFilter)}</div>
			</div>
		);
	}

	return (
		<div className={styles.filterWrapper}>
			<div className={styles.headerWrapper}>
				<h2>{'QSEL'}</h2>
			</div>
			<div className={styles.bodyWrapper}>
				<div className={styles.rasterWrapper}>
					<h3>{'Rasters'}</h3>
					<Select
						options={rasterLayers}
						value={rasterLayers.filter(({ name }) => selectedRasterLayerNamesSet.has(name))}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => selectedRasterLayerNamesSet.has(name)}
						isMulti={true}
						onChange={handleRasterLayerChange}
						hideSelectedOptions={false}
					/>
				</div>
				<div className={styles.vectorWrapper}>
					<h3>{'Vectors'}</h3>
					<Select
						options={vectorLayers}
						value={vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name))}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => selectedVectorLayerNamesSet.has(name)}
						isMulti={true}
						onChange={handleVectorLayerChange}
						hideSelectedOptions={false}
					/>
					<div className={styles.filtersWrapper}>
						{vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name)).map(renderFilters)}
					</div>
				</div>
			</div>
		</div>
	);
}
