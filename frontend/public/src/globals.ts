import {Animation} from "./animation.ts";
import {Model3D} from "./models.ts";


interface Globals {
    ORTHO_CAMERA: any;
    DIRECTIONAL_LIGHT: any;
    HEMISPHERE_LIGHT: any;
    MARTY_TEXTURES: any;
    PROMPT: string;
    STATS: any;
    RENDERER: any,
    SCENE: any,
    CAMERA: any,
    CONTROLS: any,
    CLOCK: any,
    DELTA_TIME: number,
    ANIMATION: Animation,
    FRAME: number,
    PLAYING: boolean,
    MODEL3D: Model3D,
    CAMCON: any,
    UPDATE_LOOP: {[key: string]: () => void},
    SPINNER: any,
    BROWSER: any,
    GUI: any,
    BACKEND_URL: string,
    MOVE_ORG_NAME: string,
    DEFAULT_STARTING_IDLE_NAME: string,
    DEFAULT_WORKSPACE: number,
    DATA_ANALYSIS_ENABLED_DEFAULT: boolean,
    URL_PARAMS: URLSearchParams,
    LOOP_START: number,
    LOOP_END: number,
    DEFAULT_BROWSER_MODE: "localFiles" | "mongoGCS"
}

// @ts-ignore
export const g: Globals = {
    RENDERER: {} as any,
    SCENE: {} as any,
    CAMERA: {} as any,
    CONTROLS: {} as any,
    CLOCK: {} as any,
    DELTA_TIME: 0,
    FRAME: 0,
    PLAYING: false,
    CAMCON: {} as any,
    UPDATE_LOOP: {} as any,
    SPINNER: {} as any,
    BROWSER: {} as any,
    GUI: {} as any,
// #v-ifdef PROD
    BACKEND_URL: "/api", // replace frontend port with backend port
    DEFAULT_WORKSPACE: 3,
    DATA_ANALYSIS_ENABLED_DEFAULT: false,
// #v-endif
// #v-ifdef DEV
    // @ts-ignore
    DEFAULT_WORKSPACE: 3 ,
    // @ts-ignore
    BACKEND_URL: "/api",
    // @ts-ignore
    DATA_ANALYSIS_ENABLED_DEFAULT: false,
// #v-endif
    MOVE_ORG_NAME: "",
    DEFAULT_STARTING_IDLE_NAME: "move_org_name",
    STATS: undefined,
    MARTY_TEXTURES: undefined,
    PROMPT: "",
    URL_PARAMS: new URLSearchParams(window.location.search),
    DEFAULT_BROWSER_MODE: "localFiles"

} 



