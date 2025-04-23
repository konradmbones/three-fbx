import * as THREE from 'three';
import { Numeric, BoneName,TimeseriesName,DatasetTimeserieses,DatasetName, ChartJSDataset } from './__localTypes.ts';
import {createBoneMap,quatAngle,quatDiff} from '../helpers.ts';
import {isTimeseriesScalarNumber} from './__localHelpers.ts';

import {gda} from './__localGlobals.ts';
import { calcPosders, calcRotders, getRawData, mapMotionAttribute, reduceMotionAttribute } from './__motionattrs.ts';
import { drawAnimationChart } from './__drawAnimationChart.ts';
import { smoothCurve } from './__smoothCurve.ts';
import { Model3D } from '../models.ts';
import { g } from '../globals.ts';
import {calculateKeyPoses} from './__calculateTimeseriesEvents.ts';
import { drawFrontend } from './__drawFrontend.ts';

/**
   * Return a summary of the animation:
   * - Number of frames
   * - global position heights 
   * - global quaternions (window.modelroot.hips.children[1].quaternion)
   * - local quaternions (window.modelroot.hips.children[1].quaternion)
   * - parentToChildVecs (window.modelroot.hips.children[1].matrixWorld.elements)
   * - derivatives of local positions, global positions, local quaternions and global quaternions
   */
export function calculateMotionAttributes(model3d: Model3D) {
    // by default do not run data analysis
    if (gda.ENABLED === false ) {
        console.log("Data analysis is disabled. No dataset calculated.")
        // console.log("Data analysis is disabled. No dataset calculated.")
        return;
    }

    g.SPINNER.show("Calculating motion attributes")
    const bnames: BoneName[] = model3d.bonesList.map((b: THREE.Bone) => b.name)

    const { globalPos, localQuat, globalQuat, globalParentChildDiffQuat } = getRawData(bnames)
    const globalPosders = calcPosders(bnames, globalPos, "globalPosder" ,4)
    const globalRotder = calcRotders(bnames, globalQuat, "globalRotder" ,4)    
    const localRotder = calcRotders(bnames, localQuat, "localRotder" ,4)
    const globalParentChildDiffRotder = calcRotders(bnames, globalParentChildDiffQuat, "globalParentChildDiffRotder" ,4)

    const datasets = new Map<DatasetName, Map<TimeseriesName, Numeric[]>>([
        ["globalPos", globalPos],
        ["localQuat", localQuat],
        ["globalQuat", globalQuat],
        ["globalParentChildDiffQuat", globalParentChildDiffQuat],
    ])
    // add globalPosders to motionAttrs + add magnitude of globalPosders
    for (const key in globalPosders) {
        datasets.set(key + "Mag", mapMotionAttribute(globalPosders[key], (pos) => (pos as THREE.Vector3).length()))
        datasets.set(key, globalPosders[key])
    }
    // add globalRotder to motionAttrs + add angle of globalRotder
    for (const key in globalRotder) {
        datasets.set(key + "Angle", mapMotionAttribute(globalRotder[key], (quat) => quatAngle(quat as THREE.Quaternion) ))
        datasets.set(key, globalRotder[key])
    }
    // add localRotder to motionAttrs + add angle of localRotder
    for (const key in localRotder) {
        datasets.set(key + "Angle", mapMotionAttribute(localRotder[key], (quat) => quatAngle(quat as THREE.Quaternion) ))
        datasets.set(key, localRotder[key])
    }
    // add globalParentChildDiffRotder to motionAttrs + add angle of globalParentChildDiffRotder
    for (const key in globalParentChildDiffRotder) {
        datasets.set(key + "Angle", mapMotionAttribute(globalParentChildDiffRotder[key], (quat) => quatAngle(quat as THREE.Quaternion) ))
        datasets.set(key, globalParentChildDiffRotder[key])
    }

    //// add means 
    const mean = new Map<TimeseriesName, number[]>()
    const max = new Map<TimeseriesName, number[]>() 
    const median = new Map<TimeseriesName, number[]>()
    for (let [key, ma] of datasets) {
        if (isTimeseriesScalarNumber(ma) === false){
            continue;
        }
        mean.set(key, reduceMotionAttribute(
            ma, 
            (vals) => (vals.reduce((acc:number, val) => acc + (val as number), 0) / vals.length) as Numeric
        ) as number[])
        max.set(key, reduceMotionAttribute(
            ma, 
            (vals) => Math.max(...vals as number[]) as Numeric
        ) as number[])
        median.set(key, reduceMotionAttribute(
            ma, 
            (vals) => {
                const sorted = (vals as number[]).sort((a,b) => a-b)
                const mid = Math.floor(sorted.length / 2);
                return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
            }
        ) as number[])
    }

    datasets.set("Mean", mean)
    datasets.set("Max", max)
    datasets.set("Median", median)


    // create datasets for chart
    gda.DATASETS = new Map<DatasetName, ChartJSDataset[]>();
    datasets.forEach((val: Map<TimeseriesName, Numeric[]>, ma: DatasetName) => {

        // filter out non-number[] values
        if (isTimeseriesScalarNumber(val) === false) {
            return;
        }

        // create a dataset for each relevant motion descriptor
        gda.DATASETS!.set(ma, [])

        // for each timeseries
        val.forEach((v, k: TimeseriesName) => {
            
            // we are sure at this point that its a number[]
            v = v as number[]

            // curve smoothing
            if (gda.CURVE_SMOOTHING_ENABLED){
                v = smoothCurve(v as number[], gda.CURVE_SMOOTHING_WINDOW_SIZE)
            }

            gda.DATASETS!.get(ma)!.push({
                type: 'line',
                label: k,
                data: v as number[]
            })
        })
    })
    g.SPINNER.hide("Calculating motion attributes")

    drawFrontend(gda.DATASETS)
}



