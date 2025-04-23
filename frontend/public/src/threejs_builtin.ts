import { g } from './globals.ts';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import * as THREE from 'three';
import { GUI_PARAMS } from './gui.ts';
import { resizeViewport } from './resize_viewport.ts';


const COLOR_PALETTE = {
  dark: {
    background: new THREE.Color("hsl(0, 0%, 20%)"),
    grid: new THREE.Color("hsl(0, 0%, 25%)"),
    grid2: new THREE.Color("hsl(0, 0%, 22%)"),
    floor: new THREE.Color("hsl(0, 0%, 20%)"),
  },
  light: {
    background: 0xffffff,
    grid: new THREE.Color("hsl(0, 0%, 95%)"),
    grid2: new THREE.Color("hsl(0, 0%, 97%)"),
    floor: new THREE.Color("hsl(0, 0%, 90%)"),
  }
};
const THEME = "light";



export function initScene(canvasDomElement : HTMLCanvasElement) {



  //// FPS COUNTER
  const stats = new Stats();
  g.STATS = stats;
  document.body.appendChild(stats.dom);
  stats.dom.classList.add("hidden");



  //// SCENE
  const scene = new THREE.Scene();
  g.SCENE = scene;



  //// RENDERER
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvasDomElement,
    // detect url paremeter
    preserveDrawingBuffer: g.URL_PARAMS.has("preserveDrawingBuffer"),
  });
  g.RENDERER = renderer;
  renderer.setPixelRatio(1);
  // renderer.setSize(window.innerWidth, window.innerHeight, false);
  // document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  THREE.ColorManagement.enabled = true;
  // renderer.outputColorSpace = "srgb-linear" ; // optional with post-processing
  renderer.outputColorSpace = "srgb"
  renderer.toneMapping = THREE.CineonToneMapping;

  // renderer.toneMapping = THREE.AgXToneMapping;
  // renderer.toneMappingExposure = 1.0;
  // renderer.toneMapping
  // renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  // renderer.toneMappingExposure = 0.5;
  // renderer.toneMapping = THREE.LinearToneMapping;
  // change saturation of renderer.domElement
  renderer.domElement.style.filter = "saturate(0.9) contrast(1)";
  renderer.setClearColor(COLOR_PALETTE[THEME].background, 1);



  //// FOG
  scene.fog = new THREE.Fog(COLOR_PALETTE[THEME].background, 10, 30);



  //// GRID HELPER
  const size = 100;
  const divisions = 120;
  const gridColor = new THREE.Color(COLOR_PALETTE[THEME].grid);
  const gridColor2 = new THREE.Color(COLOR_PALETTE[THEME].grid2);
  const gridHelper = new THREE.GridHelper(size, divisions, gridColor, gridColor2);
  const floorOffset = -0.0;
  gridHelper.translateY(floorOffset);
  scene.add(gridHelper);



  //// AXES HELPER
  const axesHelper = new THREE.AxesHelper(0.2);
  axesHelper.position.set(0, 0.01, 0);
  scene.add(axesHelper);



  //// CAMERA AND CONTROLS
  const perspCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  let cameraDistanceMult = 1;
  if (g.URL_PARAMS.has("cameraDistanceMult")) {
    console.log("[URL_PARAM] cameraDistanceMult", g.URL_PARAMS.get("cameraDistanceMult"));
    cameraDistanceMult = Number(g.URL_PARAMS.get("cameraDistanceMult"));
  }
  perspCamera.position.set(2 * cameraDistanceMult, 1.5 * cameraDistanceMult, 2 * cameraDistanceMult);

  const controls = new OrbitControls(perspCamera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.zoomSpeed = 20;
  controls.target.set(0, 1, 0);
  
  const ortoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  g.ORTHO_CAMERA = ortoCamera;
  
  g.CAMCON = new CameraAndControls(perspCamera, ortoCamera, controls, true);


  ////CLOCK
  const clock = new THREE.Clock();
  g.CLOCK = clock;
  g.DELTA_TIME = 0;



  //// LIGHTS
  const hemisphereLight = new THREE.HemisphereLight(new THREE.Color("hsl(192, 0%, 100%)"), new THREE.Color("hsl(72, 0%, 60%)"), 5);
  scene.add(hemisphereLight);
  g.HEMISPHERE_LIGHT = hemisphereLight;

  // ambient light
  // const ambientLight = new THREE.AmbientLight(0xffffff, 3);
  // scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(new THREE.Color("hsl(72, 60%, 100%)"), 2);
  directionalLight.position.set(0, 5, 0);
  scene.add(directionalLight);

  const shadowRes = 1024 * 1;
  directionalLight.castShadow = true; // default false
  directionalLight.shadow.mapSize.width = shadowRes; // default
  directionalLight.shadow.mapSize.height = shadowRes; // default
  directionalLight.shadow.camera.near = 0.1; // default 
  directionalLight.shadow.camera.far = 10; // default
  const d = 10
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = -d;
  g.DIRECTIONAL_LIGHT = directionalLight;



  //// FLOOR
  let floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({
    color: COLOR_PALETTE[THEME].floor,
    depthWrite: true,
    dithering: true,
  }));
  scene.add(floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.position.y = floorOffset;
}



class CameraAndControls {
  camera: THREE.Camera;
  perspCamera: THREE.PerspectiveCamera;
  ortoCamera: THREE.OrthographicCamera;
  controls: OrbitControls;
  following: boolean;

  constructor(perspCamera: THREE.PerspectiveCamera, ortoCamera: THREE.OrthographicCamera, controls: OrbitControls, follow = true) {
    this.perspCamera = perspCamera;
    this.ortoCamera = ortoCamera;
    this.controls = controls;
    this.following = follow;
    this.camera = perspCamera;

    // max distance from target
    this.controls.maxDistance = 20;

    // scroll zoom speed
    this.controls.zoomSpeed = 1;
  }

  followTarget(target: THREE.Vector3Like, damp = false) {
    // get offset from OribtalControls target to root bone
    const offset = new THREE.Vector3().subVectors(target, this.controls.target);

    if (damp) {
      let multiplier = g.DELTA_TIME * 10;
      offset.multiplyScalar(multiplier)
    }

    // lerp Orbital controls target and camera to root bone by the same amount
    this.controls.target.add(offset);
    this.camera.position.add(offset);
  }

  setCameraMode(mode: "perspective" | "ortho") {
    this.camera = this.perspCamera;
    
    // WOJTEK: TODO

    // if (mode == "perspective") {
    //   this.camera = this.perspCamera;
    // } else {
    //   this.camera = this.ortoCamera;
    // }
  }


}

