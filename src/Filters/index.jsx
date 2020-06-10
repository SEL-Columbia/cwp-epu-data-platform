import React from 'react';
import Select from 'react-select';

import chroma from 'chroma-js';

import * as styles from './styles.css';

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
		console.log('options', selectedOption, options);
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
					isLoading={!valuesSet.size}
				/>
			</div>
		);
	}

	function renderFilters({ name, filterVariables = [] }) {
		if (!filterVariables.length){
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

	const vectorStyles = {
		control: styles => ({ ...styles, backgroundColor: 'white' }),
		option: (styles, { data, isDisabled, isFocused, isSelected }) => {
			const color = data.leafletOptions?.style?.().color || 'black';
			const chromaColor = chroma(color);
			return {
				...styles,
				backgroundColor: isDisabled
					? null
					: isSelected
						? color
						: isFocused
							? chromaColor.alpha(0.1).css()
							: null,
				color: isDisabled
					? '#ccc'
					: isSelected
						? chroma.contrast(chromaColor, 'white') > 2
							? 'white'
							: 'black'
						: color,
				cursor: isDisabled ? 'not-allowed' : 'default',

				':active': {
					...styles[':active'],
					backgroundColor: !isDisabled && (isSelected ? 'black' : chromaColor.alpha(0.3).css()),
				},
			};
		},
		multiValue: (styles, { data }) => {
			const color = data.leafletOptions?.style?.().color || 'black';
			const chromaColor = chroma(color);
			console.log('multivalue color', color, chromaColor, styles);
			return {
				...styles,
				border: chroma.contrast(chromaColor, 'white') > 2
					? styles.border
					: '1px solid rgba(0, 0, 0, 0.3)',
				backgroundColor: chromaColor.alpha(0.1).css(),
			};
		},
		multiValueLabel: (styles, { data }) => {
			const color = data.leafletOptions?.style?.().color || 'black';
			const chromaColor = chroma(color);
			return {
				...styles,
				color: chroma.contrast(chromaColor, 'white') > 2
					? color
					: 'black',
			}
		},
		multiValueRemove: (styles, { data }) => {
			const color = data.leafletOptions?.style?.().color || 'black';
			return {
				...styles,
				color: color,
				':hover': {
					backgroundColor: color,
					color: 'black',
				},
			}
		},
	};

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
						options={rasterLayers}
						value={rasterLayers.find(({ name }) => name === selectedRasterLayerName)}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => name === selectedRasterLayerName}
						onChange={handleRasterLayerChange}
						hideSelectedOptions={false}
						isClearable={true}
						placeholder={'Select raster...'}
						isLoading={isLoadingRasters}
						isDisabled={!rasterLayers.length}
					/>
				</div>
				<div className={styles.sectionWrapper}>
					<div className={styles.sectionHeader}><span>{'Vectors'}</span></div>
					<Select
						options={vectorLayers}
						value={vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name))}
						getOptionLabel={({ name }) => name}
						isOptionSelected={({ name }) => selectedVectorLayerNamesSet.has(name)}
						isMulti={true}
						onChange={handleVectorLayerChange}
						hideSelectedOptions={false}
						styles={vectorStyles}
						isLoading={isLoadingVectors}
						isDisabled={!vectorLayers.length}
					/>
					<div className={styles.vectorFiltersWrapper}>
						<div className={styles.sectionHeader}><span>{'Filter by vector values'}</span></div>
						{vectorLayers.filter(({ name }) => selectedVectorLayerNamesSet.has(name)).map(renderFilters)}
					</div>
				</div>
			</div>
		</div>
	);
}
