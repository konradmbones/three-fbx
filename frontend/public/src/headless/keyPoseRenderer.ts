import { loadBVHString } from "../animation";
import { isOk } from "../helpers";
import {g} from "../globals";
import * as THREE from "three";
import { calcPosders, calcRotders, getRawData, mapMotionAttribute, reduceMotionAttribute } from "../data_analysis/__motionattrs";
import { Numeric } from "../data_analysis/__localTypes";
import { smoothCurve } from "../data_analysis/__smoothCurve";
import { calculateKeyPoses } from "../data_analysis/__calculateTimeseriesEvents";
import { setFrame} from "../timeline.js";
import { getMetadata } from "../metadata_viewer";

async function keyPoseRenderer(moveOrgName:string, bvhSource:string) {
    const canvasImages: { [key: number]: string } = {};
    const smoothWindowSize = 5;
    const framesCompareWindow = 5;
    const minHeightPercentDiff = 0.01;
    const animSimilarityThreshold = 0.85;

    //// load the .bvh file with the given moverOrgName
    console.log("[keyPoseRenderer] Loading BVH file: ", moveOrgName)
    let url: string;
    if (bvhSource === "localFiles") {
        //TODO
        url = `${g.BACKEND_URL}/storage_local/bvh?bvhpath=${"TODO"}`
    }
    else if (bvhSource === "mongoGCS") {
        url = `${g.BACKEND_URL}/storage/bvh?name=${moveOrgName}`
    }
    else {
        alert("BUG: Unknown browser type")
        return
    }
    const data = await fetch(url).then(isOk);
    await loadBVHString(data.tree, data.name, null)

    setFrame(0);
    
    //// calculate motion attributes
    console.log("[keyPoseRenderer] Calculating motion attributes")
    const model3d = g.MODEL3D;
    const bnames: string[] = model3d.bonesList.map((b: THREE.Bone) => b.name)

    const { globalPos, localQuat, globalQuat, globalParentChildDiffQuat } = getRawData(bnames)
    const globalPosders = calcPosders(bnames, globalPos, "globalPosder" ,4)

    // get magnitude of globalPosder1 
    const globalPosder1Mag = mapMotionAttribute(globalPosders["globalPosder1"], (pos) => (pos as THREE.Vector3).length())
    // get mean
    const globalPosder1MagMean = reduceMotionAttribute(
        globalPosder1Mag, 
        (vals) => (vals.reduce((acc:number, val) => acc + (val as number), 0) / vals.length) as Numeric
    ) 
    // smooth the curve
    const globalPosder1MagMeanSmooth = smoothCurve(globalPosder1MagMean as number[], smoothWindowSize)

    
    //// detect key poses
    console.log("[keyPoseRenderer] Detecting key poses")
    const keyposes = calculateKeyPoses(
        globalPosder1MagMeanSmooth as number[], 
        framesCompareWindow,
        minHeightPercentDiff,
        animSimilarityThreshold
    )



    //// for each key pose, render the pose
    console.log("[keyPoseRenderer] Rendering key poses")
    const canvas = document.getElementById("3d-viewport") as HTMLCanvasElement;
    for (let i = 0; i < keyposes.length; i++){
        const frame = keyposes[i].x
        model3d.setFrame(frame)
        g.CAMCON.followTarget(g.MODEL3D.getRootWorldPosition());
        g.CAMCON.controls.update()
        g.RENDERER.render(g.SCENE, g.CAMCON.camera);
        const img = canvas.toDataURL("image/jpeg");
        canvasImages[frame] = img
    }

    console.log("[keyPoseRenderer] Done")

    const metadata = getMetadata();
    const hasProp = metadata["CONTENT_props"] || "0";

    return {
        move_org_name: moveOrgName,
        startFrame: 0,
        endFrame: model3d.anim.maxFrame,
        hasProp: hasProp,
        keyposes: keyposes,
        canvasImages: canvasImages
    }

}




////////////////////////////////////////////////////////////////

(window as any).keyPoseRenderer = keyPoseRenderer;