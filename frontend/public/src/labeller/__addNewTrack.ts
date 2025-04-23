import {lg} from "./__localGlobals.ts";
import {percentToFrame, frameToPercent} from "../helpers.ts";
import {getUsername} from "../helpers.ts";
import { _getSegmentTrack } from "./__getSegmentTrack.ts";
import {TrackType} from "./__types.ts";
import { __getEventTrack } from "./__getEventTrack.ts";


export function addNewTrack(args: {
    labellerDiv: HTMLElement, 
    idx: number, 
    start: number | null, 
    width: number | null,
    eventPercents : number[] | null, 
    trackType: "segment"| "event"
}) {
    const {labellerDiv, idx, start, width, eventPercents, trackType} = args;

    
    let newTrack : HTMLTableRowElement;
    let newHashID : string;
    const author = getUsername();
    const label = "";
    if (trackType === "segment") {
        if (start === null || width === null) {
            throw new Error("start and width must be null for event tracks")
        }
        const {track: t, hashID : h} = _getSegmentTrack({idx, start, width, author, label, type: "new"});
        newTrack = t;
        newHashID = h;
    }
    else if (trackType === "event") {
        if (eventPercents === null) {
            throw new Error("eventPercents must be provided for event tracks")
        }
        const {track: t, hashID : h} = __getEventTrack({idx, eventPercents, author, label, type: "new"});
        newTrack = t;
        newHashID = h;
    }
    else{
        throw new Error("Invalid trackType")
    }


    newTrack.setAttribute("name", "labeller-track-new");

    // overwrite hashID if it is provided
    (newTrack as any).hashID = newHashID






    

    
    function adjustIndicesOfNewTracks() {
        const tracks = lg.TRACKS_DIV.querySelectorAll("tr");
        const newTracks = Array.from(tracks).filter((track) => track.getAttribute("name") === "labeller-track-new");
        const num = tracks.length - newTracks.length;
        newTracks.forEach((ntrack, i) => {
            ntrack.querySelector("[name=labeller-index]")!.textContent = `${num + i + 1}`;
        })
    }

    //// on delete button click, remove the track
    const deleteButton = newTrack.querySelector("[name=labeller-delete]")!;
    deleteButton.addEventListener("click", () => {
        newTrack.remove();
        // adjust indices
        adjustIndicesOfNewTracks();
    })



    // add the new track button to the labeller
    labellerDiv.appendChild(newTrack);
}