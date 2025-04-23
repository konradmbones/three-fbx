import * as THREE from 'three';

export type Numeric = number | THREE.Vector3 | THREE.Quaternion ;
export type BoneName = string;
export type DatasetName = string;
export type TimeseriesName = string;

export type ChartJSDataset = {
    type: "line" | "bar", 
    label: TimeseriesName, 
    data: number[],
    maxBarThickness?: number
}