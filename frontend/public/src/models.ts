import { g } from './globals.ts';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
// @ts-ignore
import { SkeletonHelper2 } from './customSkeletonHelper.js';
import {findInObject} from './helpers.ts';
import { Animation } from './animation.ts';

export async function init3DModel(modelUrl:string, scale = 1, rotation = 0) {
    g.MODEL3D = new Model3D()   
    await g.MODEL3D.init(modelUrl, scale, rotation)
}   


export class Model3D {
    object!: THREE.Object3D;
    root!: THREE.Bone;
    hips!: THREE.Bone;
    bonesList!: THREE.Bone[];
    skeletonHelper: SkeletonHelper2
    anim!: Animation

    constructor() {
    }

    async init(modelUrl: string, scale:number, rotation: number){
        const fbxLoader = new FBXLoader()
        const modelObject = await fbxLoader.loadAsync(modelUrl)

        const bonesList: THREE.Bone[] = [];
        modelObject.traverse(function (child: any) {
            if (child.isMesh) {
                child.frustumCulled = false;
                // cast recieve shadow
                child.castShadow = true; //default is false
                child.receiveShadow = false; //default 
            }

            // is bone and not a redundat bone (idk why three.js stores them)
            if (child.isBone && child.parent.name !== child.name) {
                // ignore bones of hands
                if (child.name.includes("_") || child.name === "root") {
                    return;
                }
                bonesList.push(child)
            }
        })


       
        // console.log(object)


        this.object = modelObject;
        this.root = this.object.children.find(child => (child as THREE.Bone).isBone) as THREE.Bone;
        this.hips = this.root.children.find(child => child.name === "Hips") as THREE.Bone;
        this.bonesList = bonesList;
        // this.object.updateMatrixWorld();
        // this.object.updateMatrix();

        this.object.scale.set(scale, scale, scale)
        this.object.rotation.x = rotation;

        // @ts-ignore
        const textures = import.meta.glob('/models3D/Marty/v004/textures_512/*.jpg', { eager: true, query: '?url', import: 'default' })
        this.applyMartyTextures(textures)


        const helper = new SkeletonHelper2(this.root);
        this.skeletonHelper = helper;
        // this.skeletonHelper.matrix = this.root.matrixWorld;
        this.skeletonHelper.matrixAutoUpdate = true;
        this.skeletonHelper.material.fog = false;
        this.skeletonHelper.visible = false;

        this.object.add(this.skeletonHelper);

        this.skeletonHelper.scale.set(scale, scale, scale)
        this.skeletonHelper.rotation.x = -rotation;
        this.skeletonHelper.frustumCulled = false;

    }

    getRootWorldPosition() {
        const v = new THREE.Vector3();
        this.hips.getWorldPosition(v);
        if (isNaN(v.x) || isNaN(v.y) || isNaN(v.z)) {
            // window.cancelAnimationFrame(reqAnimFrameId)
            console.error("Root bone position is NaN")
            return new THREE.Vector3(0, 0, 0)
        }
        return v
    }

    getBonePoseLocalRotation(boneName: string, frame:number) : THREE.Quaternion {
      this.anim.anim.clip.tracks.forEach(track => {
        if (track.name.split(".")[0] === boneName && track.name.split(".")[1] === "quaternion") {
           // interpolate
           const quat = track.values.slice(frame * 4, frame * 4 + 4)
           return new THREE.Quaternion(quat[0], quat[1], quat[2], quat[3])
        }
      })
      throw new Error("Bone not found")
    }

    getBonePoseLocalRotationAllBones(frame:number) : { [key: string]: THREE.Quaternion } {
      const rotations: { [key: string]: THREE.Quaternion } = {}
      this.anim.anim.clip.tracks.forEach(track => {
        if (track.name.split(".")[1] === "quaternion") {
           // interpolate
           const quat = track.values.slice(frame * 4, frame * 4 + 4)
           rotations[track.name.split(".")[0]] = new THREE.Quaternion(quat[0], quat[1], quat[2], quat[3])
        }
      })
      return rotations
    }
    
        


applyMartyTextures(textures: any) {

    const colorSpace = "srgb"

    const textureLoader = new THREE.TextureLoader();

    // g.TEXTURES_ALL_LOADED = 0;
    this.object.traverse(function (child: any) {
        if (child.isMesh) {

            function onLoad() {
                // g.TEXTURES_ALL_LOADED -= 1;
            }

            switch (child.name) {
                case "Coat_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "coat_low_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    child.material.normalMap = textureLoader.load(findInObject(textures, "coat_low_Normal_DirectX.jpg"), onLoad)
                    child.material.normalMap.colorSpace = THREE.NoColorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Shirt_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "shirt_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Long_Socks_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "long_socks1_1_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Pants_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "pants_high_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    child.material.normalMap = textureLoader.load(findInObject(textures, "pants_low_Normal.jpg"), onLoad)
                    child.material.normalMap.colorSpace = THREE.NoColorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "LeftSneaker_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Sneakers002_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "RightSneaker_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Sneakers002_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Body_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Body_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    child.material.normalMap = textureLoader.load(findInObject(textures, "Body_Base_color_Normal_DirectX.jpg"), onLoad)
                    child.material.normalMap.colorSpace = THREE.NoColorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "EyeOcclusion_Low":
                    child.visible = false;
                    child.material.map = textureLoader.load(findInObject(textures, "Std_Eye_L_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "TearLine_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Std_Tearline_L_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Base_Eye_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Std_Eye_R_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Brows_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Brow1_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Hair_All_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "hair_all1_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Hairbun_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Hairbun1_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Hairband_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Hairband_Base_color.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;
                case "Head_Low":
                    child.material.map = textureLoader.load(findInObject(textures, "Head_Base_color_RedNoseFix.jpg"), onLoad)
                    child.material.map.colorSpace = colorSpace;
                    // g.TEXTURES_ALL_LOADED +=1;
                    break;

            }
            child.material.fog = false
            child.material.vertexColors = false;
            child.material.needsUpdate = true;
        }
    });
}


  /**
   * 
   * @param {} frame
   */
  setFrame( frame:number) {

    // "frame" can be fractional therefore positions and rotations need to be interpolated
    // between floor(frame) and ceil(frame) using t = frame - floor(frame)
    const framef = Math.floor(frame)
    const framec = Math.ceil(frame)
    const t = frame - framef
  
    const sourceAnim = this.anim;
    const targetModel3D = this;
  
    function __copyRotation(bone: THREE.Bone) {
      //// find track with the same name as the bone
      sourceAnim.anim.clip.tracks.forEach(track => {
        if (track.name.split(".")[0] === bone.name) {
  
          if (bone.name === "Hips" && track.name.split(".")[1] === "position") {
            // console.log(track);
            // values contains 3 x num_frames values; we want to take only 3
  
            // interpolate
            let pos = [0, 0, 0];
            const pos1 = track.values.slice(framef * 3, framef * 3 + 3)
            // if frame greater than max frame, then dont interpolate
            if (frame > sourceAnim.maxFrame) {
              pos[0] = pos1[0]
              pos[1] = pos1[1]
              pos[2] = pos1[2]
            } else {
              const pos2 = track.values.slice(framec * 3, framec * 3 + 3) 
              const pos3 = pos1.map((v, i) => v * (1 - t) + pos2[i] * t)
              pos[0] = pos3[0]
              pos[1] = pos3[1]
              pos[2] = pos3[2]
            }
  
            // subtract root bone's rest position
            const rootPos = sourceAnim.anim.skeleton.getBoneByName("Hips")!.position;
            pos[0] -= rootPos.x;
            pos[1] -= rootPos.y;
            pos[2] -= rootPos.z;
            bone.position.set(pos[0], pos[1], pos[2])
          }
          if (track.name.split(".")[1] === "quaternion") {
            // console.log(track);
            // values contains 4 x num_frames values; we want to take only 4
  
  
            // interpolate
            let quat = new THREE.Quaternion();
            const quat1 = track.values.slice(framef * 4, framef * 4 + 4)
            // if frame greater than max frame, then dont interpolate
            if (frame > sourceAnim.maxFrame) {
              quat.set(quat1[0], quat1[1], quat1[2], quat1[3])
            } else {
              const quat2 = track.values.slice(framec * 4, framec * 4 + 4)
              quat.set(quat1[0], quat1[1], quat1[2], quat1[3])
                .slerp(new THREE.Quaternion(quat2[0], quat2[1], quat2[2], quat2[3]), t)
            }
  
            // interpolate quaternions similarly to how we did with position
            bone.rotation.setFromQuaternion(quat)
          }
        }
      })
  
      //// recursively copy rotation for all children
      const children = bone.children.filter(child => (child as THREE.Bone).isBone)
      if (children.length === 0) {
        return;
      }
      children.forEach(child => {
        // three.js stores redundant children (idk why, but it does)
        if (child.name === bone.name) {
          return;
        }
  
        // find bone from bvh with the same name and copy its rotation
        const bvhBone = sourceAnim.anim.skeleton.getBoneByName(child.name);
        if (!bvhBone) {
          return;
        }
  
        // ignore LeftHandThumb1, LeftHandThumb2 and RightHandThumb1, RightHandThumb2
        if (child.name.includes("Thumb")) {
          return;
        }
  
        __copyRotation(child as THREE.Bone)
      })
    }
  
    __copyRotation(targetModel3D.root)
  }

}
