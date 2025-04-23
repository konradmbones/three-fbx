import * as THREE from 'three';
import { Numeric, BoneName   } from './__localTypes.ts';
import {createBoneMap,quatDiff} from '../helpers.ts';
import {g} from '../globals.ts';   
////////////////////////////////////////////////////////////////

export function calcPosders(bnames:BoneName[], positions: Map<BoneName, THREE.Vector3[]>, attribName:string, maxOrder = 4) {

    const posders: { [key: string]: Map<BoneName, Numeric[]> } = {};

    for (let o = 1; o <= maxOrder; o++) {
        posders[attribName + o] = createBoneMap(bnames) as Map<BoneName, Numeric[]>;

        for (let f = 0; f < g.MODEL3D.anim.frameCount; f++) {
            posders[attribName + o].forEach((_, bn: BoneName) => {
                if (f < o) {
                    posders[attribName + o].get(bn)!.push(new THREE.Vector3(0, 0, 0))
                } else {
                    let der = new THREE.Vector3();
                    if (o === 1) {
                        der.subVectors(
                            positions.get(bn)![f] as THREE.Vector3,
                            positions.get(bn)![f - 1] as THREE.Vector3,
                        )
                    } else  {
                        der.subVectors(
                            posders[`${attribName}${o-1}`].get(bn)![f] as THREE.Vector3,
                            posders[`${attribName}${o-1}`].get(bn)![f - 1] as THREE.Vector3,
                        )
                    }
                    posders[attribName + o].get(bn)!.push(der)
                }
            });
        }
    }
    return posders;

}

////////////////////////////////////////////////////////////////

// /**
//  * Performs twist-after-swing decomposition of two quaternions (first swing, then twist)
//  * @param quat1 start quaternion
//  * @param quat2 end quaternion
//  * @param parentToChildVec vector from parent to child bone (whose orientation is described by quat1)
//  * @returns swing, twist quaternions
//  */
// function swing_twist_decomposition(quat1:THREE.Quaternion, quat2:THREE.Quaternion, parentToChildVec:THREE.Vector3){
//     // assert quat 1 and quat 2 are unit quaternions
//     if (Math.abs(quat1.length() - 1) < 0.0001) {
//         console.error("assertion failed: quat1.isUnit()");
//     }
//     if (Math.abs(quat2.length() - 1) < 0.0001) {
//         console.error("assertion failed: quat2.isUnit()");
//     }

//     const diff = quat2.clone().multiply(quat1.clone().invert());
    
//     // assert quat2 === diff * quat1
//     if (!quat2.equals(diff.clone().multiply(quat1))) {
//         console.error("assertion failed: quat2.equals(diff.clone().multiply(quat1))");
//     }

    

//     const vecQuat = new THREE.Quaternion(0, parentToChildVec.x, parentToChildVec.y, parentToChildVec.z);
//     const vecQuatRotated = diff.clone().multiply(vecQuat)
//     const endVec = new THREE.Vector3(vecQuatRotated.x, vecQuatRotated.y, vecQuatRotated.z);
    
//     const n = parentToChildVec.clone().cross(endVec).normalize();
//     const alpha = parentToChildVec.angleTo(endVec);
//     const swing = new THREE.Quaternion().setFromAxisAngle(n, alpha/2);
//     const twist = quat2.clone().multiply(swing.clone().invert());

//     return {swing, twist};
// }

////////////////////////////////////////////////////////////////

export function calcRotders(bnames:BoneName[], quats: Map<BoneName, THREE.Quaternion[]>,attribName:string, maxOrder = 4) {
    const rotders: { [key: string]: Map<BoneName, THREE.Quaternion[]> } = {};

    for (let o = 1; o <= maxOrder; o++) {
        rotders[attribName + o] = createBoneMap(bnames) as Map<BoneName, THREE.Quaternion[]>;

        for (let f = 0; f < g.MODEL3D.anim.frameCount; f++) {
            rotders[attribName + o].forEach((_, bn: BoneName) => {
                if (f < o) {
                    rotders[attribName + o].get(bn)!.push(new THREE.Quaternion().identity())
                } else {
                    let der = null;
                    if (o === 1) {
                        // der = q_1 * q_0^{-1}
                        der = quatDiff(quats.get(bn)![f - 1], quats.get(bn)![f])
                        //  quats.get(bn)![f].clone()
                        // .multiply(quats.get(bn)![f - 1].clone().invert());
                    } else  {
                        // der = q'_1 * q'_0^{-1}
                        der = quatDiff(rotders[`${attribName}${o-1}`].get(bn)![f - 1], rotders[`${attribName}${o-1}`].get(bn)![f]) 
                        // rotders[`${attribName}${o-1}`].get(bn)![f].clone()
                        // .multiply(rotders[`${attribName}${o-1}`].get(bn)![f - 1].clone().invert());
                    }
                    rotders[attribName + o].get(bn)!.push(der)
                }
            });
        }
    }
    return rotders;
}

////////////////////////////////////////////////////////////////

// export function calcSwingTwist(bnames:BoneName[], quats: Map<BoneName, THREE.Quaternion[]>, attribName:string, parentChildVecs: Map<BoneName, THREE.Vector3[]>) {
//     const swingTwist: { [key: string]: Map<BoneName, number[]> } = {};

//     for (let f = 0; f < frameCount; f++) {
//         swingTwist[attribName + "SwingAng"] = createBoneMap(bnames) as Map<BoneName, number[]>;
//         swingTwist[attribName + "TwistAng"] = createBoneMap(bnames) as Map<BoneName, number[]>;

//         swingTwist[attribName+ "SwingAng"].forEach((_, bn: BoneName) => {
//             if (f === 0) {
//                 swingTwist["SwingAng"].get(bn)!.push(new THREE.Quaternion().identity());
//                 swingTwist["TwistAng"].get(bn)!.push(new THREE.Quaternion().identity());
//             } else {
//                 const {swing, twist} = swing_twist_decomposition(quats.get(bn)![f-1], quats.get(bn)![f], parentChildVecs.get(bn)![f-1]);
//                 swingTwist["SwingAng"].get(bn)!.push(swing);
//                 swingTwist["TwistAng"].get(bn)!.push(twist);
//             }
//         });
//     }
//     return swingTwist;
// }

////////////////////////////////////////////////////////////////

export function getRawData(bnames: BoneName[]) {

    const globalPos = createBoneMap(bnames) as Map<BoneName, THREE.Vector3[]>
    const globalQuat = createBoneMap(bnames) as Map<BoneName, THREE.Quaternion[]>
    const localQuat = createBoneMap(bnames) as Map<BoneName, THREE.Quaternion[]>
    const globalParentChildDiffQuat = createBoneMap(bnames) as Map<BoneName, THREE.Quaternion[]>

    const frameCount = g.MODEL3D.anim.frameCount;

    for (let f = 0; f < frameCount; f++) {

        // set animation to particular frame
        g.MODEL3D.setFrame(f);

        g.MODEL3D.bonesList.forEach((bone: THREE.Bone) => {
            // global position
            const tmp1 = new THREE.Vector3();
            bone.getWorldPosition(tmp1);
            globalPos.get(bone.name)!.push(tmp1)

            // global quaternion
            const tmp2 = new THREE.Quaternion();
            bone.getWorldQuaternion(tmp2);
            globalQuat.get(bone.name)!.push(tmp2)

            // local quaternion
            
            localQuat.get(bone.name)!.push(new THREE.Quaternion().setFromEuler(bone.rotation))

            // parent to child vector
            let childGlobalQuat = tmp2.clone();
            let parentGlobalQuat = new THREE.Quaternion();
            let parentChildDiffQuat = new THREE.Quaternion();
            if (bone.parent) {
                bone.parent.getWorldQuaternion(parentGlobalQuat);
                parentChildDiffQuat = quatDiff(parentGlobalQuat, childGlobalQuat);
            } else {
                parentChildDiffQuat = childGlobalQuat;
            }
            globalParentChildDiffQuat.get(bone.name)!.push(parentChildDiffQuat)
        })
    }
    return { globalPos, globalQuat, localQuat, globalParentChildDiffQuat };
}

////////////////////////////////////////////////////////////////

export function mapMotionAttribute(motionAttribute: Map<string, Numeric[]>, func : (val: Numeric) => Numeric) {
    const newMotionAttribute = new Map<string, Numeric[]>();
    motionAttribute.forEach((val, key) => {
        newMotionAttribute.set(key, val.map(func));
    });
    return newMotionAttribute;
}

////////////////////////////////////////////////////////////////

export function reduceMotionAttribute(motionAttribute: Map<string, Numeric[]>, func : (val: Numeric[]) => Numeric) {
    const newMotionAttribute = new Map<string, Numeric[]>();
    const rowLength = motionAttribute.get(motionAttribute.keys().next().value)!.length;
    const reducedRow:Numeric[] = [];
    for (let i = 0; i < rowLength; i++) {
        const col:Numeric[] = [];
        for (let [key, val] of motionAttribute) {
            col.push(val[i]);
        }
        reducedRow.push(func(col));
    }
    return reducedRow;
    
}