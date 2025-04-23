import { lg } from "./__localGlobals";

export function setFrameIndicator(screenXPos: number) {
    if (!lg.LABELLER_ENABLED) {
        return
    }
    const indicator = document.getElementById("labeller-curr-frame-indicator")!;
    indicator.style.left = `${screenXPos}%`;
}