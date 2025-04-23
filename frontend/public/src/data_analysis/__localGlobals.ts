import Chart from 'chart.js/auto';
import {g} from "../globals.ts"

export const gda: {
    DATASETS: Map<string, {type:"line" | "bar", label: string, data: number[] }[]> | undefined;
    CHART: Chart | undefined,
    SELECTED_DATASET: string | undefined
    ENABLED: boolean,
    CURVE_SMOOTHING_ENABLED: boolean
    CURVE_SMOOTHING_WINDOW_SIZE: number
    DATASET_VISIBLITIES: boolean[],
    ENABLE_BY_DEFAULT: boolean
} = {
    CHART: undefined,
    DATASETS: undefined,
    SELECTED_DATASET: undefined,
    ENABLED: false,
    ENABLE_BY_DEFAULT: g.DATA_ANALYSIS_ENABLED_DEFAULT,
    CURVE_SMOOTHING_ENABLED: false,
    CURVE_SMOOTHING_WINDOW_SIZE: 5,
    DATASET_VISIBLITIES: []
}