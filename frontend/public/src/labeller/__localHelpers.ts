import {lg} from "./__localGlobals"
import {g} from "../globals"
export function getNewTracks(){
    return Array.from(lg.TRACKS_DIV.querySelectorAll("tr"))
                    .filter((track) => track.getAttribute("name") === "labeller-track-new")
}

export function getLabellingStatus(){
    return (document.getElementById("labeller-labelling-status") as HTMLSelectElement).value
}

export function parseTrack(track: HTMLElement) {
    const trackType = (track as any).type as "segment" | "event";
    let left, width, eventPercents;
    if (trackType === "segment") {
        left = parseFloat((track.querySelector("[name=labeller-resizable-segment]")! as HTMLElement).style.left);
        width = parseFloat((track.querySelector("[name=labeller-resizable-segment]")! as HTMLElement).style.width);
        eventPercents = null;
    }
    else if (trackType === "event") {
        left = null;
        width = null;
        eventPercents = Array.from(track.querySelectorAll("[name=labeller-event]")).map((el) => parseFloat((el as HTMLElement).style.left));
    }
    else {
        throw new Error("Invalid track type")
    }

    const idx = (track.querySelector("[name=labeller-index]") as HTMLElement).textContent!;
    const hashID = (track as any).hashID;
    const label = (track.querySelector("[name=labeller-label-text]") as HTMLTextAreaElement).value;
    const start_frame = Math.floor(left! / 100 * g.MODEL3D.anim.maxFrame);
    const end_frame = Math.floor((left! + width!) / 100 * g.MODEL3D.anim.maxFrame);
    const num_frames = end_frame - start_frame;
    const label_type = (track.querySelector("[name=labeller-label-type]") as HTMLSelectElement).value;

    return { idx, hashID, label, left, width, start_frame, end_frame, num_frames, label_type, eventPercents, trackType }
}