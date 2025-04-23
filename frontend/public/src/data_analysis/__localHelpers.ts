import { Numeric, TimeseriesName } from './__localTypes.ts';

export function isTimeseriesScalarNumber(timeseries: Map<TimeseriesName, Numeric[]>) {
    const key = timeseries.keys().next().value;

    return typeof timeseries.get(key)![0] === 'number';
}