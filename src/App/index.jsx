import React, { useState, Component } from 'react';

import Filters from '../Filters';
import Map from '../Map';
import dataSources from '../dataSources';

import * as styles from './styles.css'

// export default function App(){
//     const initialRasterLayers = dataSources.filter(({ kind }) => kind === 'raster');
//     const [currentRasterLayers, setCurrentRasterLayers] = useState(initialRasterLayers);
//
//     const initialVectorLayers = dataSources.filter(({ kind }) => kind !== 'raster');
//     const [currentVectorLayers, setCurrentVectorLayers] = useState(initialVectorLayers);
//
//
//     return <div className={styles.appWrapper}>
//         <Filters
//             rasterLayers={currentRasterLayers}
//             vectorLayers={currentVectorLayers}
//             setRasterLayers={setCurrentRasterLayers}
//             setVectorLayers={setCurrentVectorLayers}
//         />
//         <Map
//             rasterLayers={currentRasterLayers}
//             vectorLayers={currentVectorLayers}
//         />
//     </div>
// }

const initialRasterLayerNamesSet = new Set(['satellite']);
const initialVectorLayerNamesSet = new Set(['powerlines']);

function getRasters(dataSources){
    return dataSources.filter(({ kind }) => kind === 'raster');
}

function getVectors(dataSources){
    return dataSources.filter(({ kind }) => kind !== 'raster');
};

function getFiltersMap(features, whitelist){
    const filters = {};
    for (const feature of features){
        for (const property in feature.metadata){
            if (whitelist.has(property)){
                if (!filters[property]){
                    filters[property] = { valuesSet: new Set([]), selectedValuesSet: new Set([]) };
                }
                filters[property].valuesSet.add(feature.metadata[property]);
                filters[property].selectedValuesSet.add(feature.metadata[property]);
            }
        }
    }
    return filters;
}

export default class App extends Component {
    constructor(props){
        super(props);
        const currentVectorLayers = getVectors(dataSources).filter(({ name }) => initialVectorLayerNamesSet.has(name));
        const vectorFeaturesByNamesMap = {};
        const vectorFiltersByNamesMap = {};
        for (const vector of currentVectorLayers){
            vectorFeaturesByNamesMap[vector.name] = [];
            vectorFiltersByNamesMap[vector.name] = {};

        }
        this.state = {
            currentRasterLayerNamesSet: new Set(getRasters(dataSources).filter(({ name }) => initialRasterLayerNamesSet.has(name)).map(({ name }) => name)),
            currentVectorLayerNamesSet: new Set(currentVectorLayers.map(({ name }) => name)),
            vectorFeaturesByNamesMap,
            vectorFiltersByNamesMap,
        }
    }

    componentDidMount(){
        this.loadVectors();
    }

    loadVectors = async () => {
        const { currentVectorLayerNamesSet } = this.state;
        const vectorsToFetch = getVectors(dataSources).filter(({ name }) => currentVectorLayerNamesSet.has(name));
        const nextVectorFeaturesByNamesMap = {};
        const nextVectorFiltersByNamesMap = {};
        await Promise.all(
            vectorsToFetch.map(async (vector) => {
                const features = await vector.fetchData();
                nextVectorFeaturesByNamesMap[vector.name] = features;
                if (vector.filterNamesWhitelist){
                    const filtersMap = getFiltersMap(features, vector.filterNamesWhitelist);
                    nextVectorFiltersByNamesMap[vector.name] = filtersMap;
                }
            })
        );
        this.setState({
            vectorFeaturesByNamesMap: nextVectorFeaturesByNamesMap,
            vectorFiltersByNamesMap: nextVectorFiltersByNamesMap,
        });
    }

    handleUpdateRasterLayers = (currentRasterLayerNamesSet) => {
        this.setState({ currentRasterLayerNamesSet });
    }

    handleUpdateVectorLayers = (currentVectorLayerNamesSet) => {
        this.setState({ currentVectorLayerNamesSet }, this.loadVectors);
    }

    handleUpdateVectorFilters = (vectorFiltersByNamesMap) => {
        this.setState({ vectorFiltersByNamesMap });
    }

    filterFeatures = (name, features) => {
        const { vectorFiltersByNamesMap } = this.state;
        const filtersMap = vectorFiltersByNamesMap[name];
        const filterNames = [];
        for (const filterName in filtersMap){
            filterNames.push(filterName);
        }
        return features.filter((feature) => {
            return !feature.metadata
                || filterNames.every((filterName) =>
                    !feature.metadata[filterName]
                        || filtersMap[filterName].selectedValuesSet.has(feature.metadata[filterName])
                );
        });
    }

    render(){
        const { vectorFiltersByNamesMap, vectorFeaturesByNamesMap, currentRasterLayerNamesSet, currentVectorLayerNamesSet } = this.state;

        return (
            <div className={styles.appWrapper}>
                <Filters
                    rasterLayers={getRasters(dataSources)}
                    vectorLayers={getVectors(dataSources)}
                    vectorFiltersByNamesMap={vectorFiltersByNamesMap}
                    selectedRasterLayerNamesSet={currentRasterLayerNamesSet}
                    selectedVectorLayerNamesSet={currentVectorLayerNamesSet}
                    onUpdateRasterLayers={this.handleUpdateRasterLayers}
                    onUpdateVectorLayers={this.handleUpdateVectorLayers}
                    onUpdateVectorFilters={this.handleUpdateVectorFilters}
                />
                <Map
                    rasterLayers={getRasters(dataSources).filter(({ name }) => currentRasterLayerNamesSet.has(name))}
                    vectorLayers={getVectors(dataSources)
                        .filter(({ name }) => currentVectorLayerNamesSet.has(name))
                        .map((vector) => ({
                            ...vector,
                            features: this.filterFeatures(vector.name, vectorFeaturesByNamesMap[vector.name] || []),
                        }))
                    }
                />
            </div>
        );
    }
}