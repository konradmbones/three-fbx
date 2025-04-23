import { g } from "../globals.ts";
import {areNumbersClose, getCombinations} from "../helpers.ts";
import * as THREE from "three";

export function calculateTimeseriesEvents(data: number[]){
    
}

export function calculateKeyPoses(
    data: number[], 
    framesCompareWindow: number,
    minHeightPercentDiff: number,
    animSimilarityThreshold: number
): {x: number, y: number, color:"red"|"blue"}[] {
    // detect peaks and throughs in timeseries
    // peak: local maxima
    // trough: local minima
    const newTimeseries: {x: number, y: number, color: "red"| "blue"}[] = []
    let minMax = {min: Infinity, max: -Infinity}

    console.log("Number of frames: ", data.length)
    console.log("Frames compare window: ", framesCompareWindow)
    console.log("Min height percent diff: ", minHeightPercentDiff)
    console.log("Anim similarity threshold: ", animSimilarityThreshold)

    //// detect peaks and troughs
    for (let i = 0; i < data.length; i++){
        const current = data[i];
        let isPeak = true;
        let isTrough = true;

        minMax.min = Math.min(minMax.min, current);
        minMax.max = Math.max(minMax.max, current);
    
        for (let j = -framesCompareWindow; j <= framesCompareWindow; j++) {
            isPeak = isPeak && (current >= data[i + j]);
            isTrough = isTrough && (current <= data[i + j]);
        }
    
        if (isPeak) {
            newTimeseries.push({ x: i, y: current, color: "red" });
            i += framesCompareWindow;
        } else if (isTrough) {
            newTimeseries.push({ x: i, y: current, color: "blue" });
            i += framesCompareWindow;
        }
    }

    //// filter out those whose y values are too close. But prefer to keep the troughs
    const relativeAmplitudeThreshold = (minMax.max - minMax.min) * minHeightPercentDiff
    const toRemove = []
    for (let i = 1; i < newTimeseries.length; i++){
        if (areNumbersClose(newTimeseries[i-1].y, newTimeseries[i]?.y, relativeAmplitudeThreshold)){
            const which = newTimeseries[i].color === "blue" ? i-1 : i
            toRemove.push(which)
        }
    }
    for (let i = toRemove.length - 1; i >= 0; i--){
        newTimeseries.splice(toRemove[i], 1)
    }
    
    //// for each keypose frame, get 2D matrix of joints x quaternion. calculate similarity between each pair of frames
    //// if similarity is greater than threshold, remove one of the frames (prefer to remove peaks)
    const toCompare: {index:number, frame: number, rotations: {[key: string]: THREE.Quaternion}}[] = []
    for (let i = 0; i < newTimeseries.length; i++){
        const frame = newTimeseries[i].x
        toCompare.push({
            index: i,
            frame,
            rotations: g.MODEL3D.getBonePoseLocalRotationAllBones(frame)
        })
    }

    
    const toRemove2: number[] = []
    const combinations = getCombinations([...Array(toCompare.length).keys()])
    const similarities : {a1: number, a2: number, sim: number}[] = []
    console.log("combinations", combinations)
    combinations.forEach(([a1, a2]) => {

        // // if a1 or a2 in toRemove2, skip
        // if (toRemove2.includes(a1) || toRemove2.includes(a2)){
        //     return;
        // }

        let simSum = 0
        // for each joint
        g.MODEL3D.bonesList.forEach((bone: THREE.Bone) => {
            const boneName = bone.name
            const q1 = toCompare[a1].rotations[boneName]
            const q2 = toCompare[a2].rotations[boneName]
            const sim = q1.angleTo(q2) / Math.PI
            simSum += sim
            // if (sim > animSimilarityThreshold){
            //     const which = newTimeseries[a1].color === "red" ? a1 : a2
            //     toRemove2.push(which)
            // }
        })      
        similarities.push({a1, a2, sim: 1 - simSum / g.MODEL3D.bonesList.length})
    })
    
    // sort similarities and throw out those that are too similar
    similarities.sort((a,b) => b.sim - a.sim)
    similarities.forEach(sim => {
        if (toRemove2.includes(sim.a1) || toRemove2.includes(sim.a2)){
            return;
        }

        if (sim.sim < animSimilarityThreshold){
            const which = newTimeseries[sim.a1].color === "red" ? sim.a1 : sim.a2
            toRemove2.push(which)
        }
    })

    console.log("newTimeseries before similarity",newTimeseries)
    console.log("similarities", similarities)

    for (let i = toRemove2.length - 1; i >= 0; i--){
        newTimeseries.splice(toRemove2[i], 1)
    }

    console.log("newTimeseries after similarity",newTimeseries)


    return newTimeseries;
}