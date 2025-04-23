import * as THREE from 'three';

// @ts-ignore
import { initTimeline } from "./timeline.ts";
// @ts-ignore
import { initGUI } from "./gui.js";
// @ts-ignore
import { initScene } from "./threejs_builtin.ts";
// @ts-ignore
import MartyModel3D from "/models3D/Marty/v004/SK_Avatar_Low_v004.fbx";
// @ts-ignore
import IdleAnim from "/anims/idle_loop_001__A268_looped_v2.bvh?url";


// import { initRetrievalAPI } from "./retrieval-api.js";
import { init3DModel } from "./models.ts";
import { g } from "./globals.ts";
import { loadBVHUrl} from "./animation.ts";
import "./spinner.ts";
// import MartyModel3D_GLB from "./models3D/Marty/v003.glb?url";
import {initBrowser} from "./browser/initBrowser.ts";
import {initDivider} from "./divider.ts";
import {resizeViewport} from "./resize_viewport.ts";
import {initSpinner} from "./spinner.ts";
import {initDragNDrop} from "./drag_n_drop.ts";
import {initMetadataViewer } from "./metadata_viewer.ts";
import {initLogoutButton} from "./logout.ts";

// #v-ifdef VITE_IS_INTERNAL
import {initDataAnalyzer} from "./data_analysis/initDataAnalyzer.ts";
import {initDownloadAnimButton } from "./download_anim.ts";
import {initWorkspaceSwitch} from "./workspace_switch.ts";
import {initLabeller} from "./labeller/initLabeller.ts";
import {initShowRefcam} from "./show_refcam.ts";
import "./headless/keyPoseRenderer.ts";
// #v-endif

////////////////////////////////////////////////////////////////////////////////////////////////////////////

(async () => {
    initSpinner();
    g.SPINNER.show()

// #v-ifdef DEV
        document.cookie = "X-Viewer-Token=66cde8a6adfe574e93c815fb";
        document.cookie = "X-Viewer-Username=devel";

// #v-endif

    // const gallery = import.meta.glob('/model_Natalia/*', { eager: true, as: 'url' })
    // const anims = import.meta.glob('/anims/*', { eager: true, as: 'url' })
    // const anim = anims[Object.keys(anims).find(url => url.includes("Vicon"))]


    //// Marty model
    const urlModel3D = MartyModel3D;
    const urlAnim = IdleAnim;
    const rotation = Math.PI / 2;
    const scale = 0.1;

    const canvas = document.getElementById("3d-viewport");
    g.UPDATE_LOOP = {};
    initScene(canvas as HTMLCanvasElement);
    // initRetrievalAPI();
    // initListeners();
    // await initGLTFModel(MartyModel3D_GLB, scale, rotation);
    
    
    (async () => {
        g.PLAYING = true;
        g.FRAME = 0;
        g.PROMPT = "Walking";

// #v-ifdef VITE_IS_INTERNAL

            initDownloadAnimButton();
            initLabeller();
            initShowRefcam();
// #v-endif

        initMetadataViewer();
        initLogoutButton();
        await init3DModel(urlModel3D, scale, rotation);
        await loadBVHUrl(urlAnim, g.DEFAULT_STARTING_IDLE_NAME ,false, null);
        
        
        // // set callback for when all textures are loaded -> add model to scene
        // g.UPDATE_LOOP.addModel = () => {
            //     console.log("g.TEXTURES_ALL_LOADED", g.TEXTURES_ALL_LOADED)
            //     if (g.TEXTURES_ALL_LOADED === 0) {
                //         console.log("All textures loaded")
                //         // g.CAMCON.followTarget(g.MODEL3D.getRootPosition());
                //     }
                //     if (g.SCENE.children.includes(g.MODEL3D.object)) {
                    //         console.log("removing addModel callback")
                    
                    //         g.UPDATE_LOOP.addModel = () => {};
                    //     }
                    // }
                    
        initGUI();
        initTimeline();
        initBrowser();
        initDivider();

// #v-ifdef VITE_IS_INTERNAL
        initDragNDrop();
        initDataAnalyzer();
        initWorkspaceSwitch();
// #v-endif

        g.SCENE.add(g.MODEL3D.object);
        animate();
        g.SPINNER.hide()
        document.getElementById("loading-screen")!.remove();
        
    })();
})();








////////////////////////////////////////////////////////////////////////////////////////////////////////////

let loopIter = 0;
function animate() {
    g.DELTA_TIME = g.CLOCK.getDelta();

    // if delta time is too big, skip frame
    if (g.DELTA_TIME > 1) {
        g.DELTA_TIME = 0;
    }

    
    if ( g.MODEL3D, g.MODEL3D.anim ) {
        g.MODEL3D.setFrame(g.FRAME);

        if (g.PLAYING) {
            g.FRAME = (g.FRAME + g.DELTA_TIME * g.MODEL3D.anim.fps)
            if (g.FRAME > g.LOOP_END || g.FRAME < g.LOOP_START) {
                g.FRAME = g.LOOP_START
            }
            // g.FRAME = g.FRAME % g.LOOP_END;
        }
    }

    if (g.CAMCON.following && g.MODEL3D && g.MODEL3D.anim) {
        g.CAMCON.followTarget(g.MODEL3D.getRootWorldPosition());
    }

    //// play all registered update functions
    Object.values(g.UPDATE_LOOP).forEach(f => f());

    g.CAMCON.controls.update()
    g.STATS.update()
    g.RENDERER.render(g.SCENE, g.CAMCON.camera);

    resizeViewport();

    requestAnimationFrame(animate);

    loopIter++;
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function initListeners() {
//     window.addEventListener("resize", resizeViewport, false);
// }
