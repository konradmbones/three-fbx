
import { g } from "../globals";
import { getUsername, isOk } from "../helpers";
import {lg} from "./__localGlobals";
import { Label, LabelsExport } from "./__types";
import { addOldTracks } from "./__addOldTracks";
import { getLabellingStatus, getNewTracks, parseTrack } from "./__localHelpers";
import { setLabellingStatus } from "./__setLabellingStatus";
import { importLabels } from "./importLabels";


export async function saveLabels() {
    const newTracks = getNewTracks();
    const newLabels: { [key: string]: Label } = {};
    // const toConvert: { [key: string]: { 
    //     label: string, 
    //     left: number |null, 
    //     width: number | null, 
    //     eventPercents: number[] | null,
    //     trackType: "segment" | "event",
    //     track: HTMLElement, 
    //     idx: string,
    //     label_type: string } } = {};

    if (newTracks.length === 0) {
        alert("No labels to save")
        return
    }

    const author = getUsername();

    for (const track of newTracks) {

        const { idx, hashID, label, left, width, start_frame, end_frame, num_frames, label_type, trackType, eventPercents } = parseTrack(track as HTMLElement);

        if (label === "") {
            alert(`[ERROR] Label in track '${idx}' cannot be empty!`)
            return
        }

        // save the track for later, to convert it to old track
        // toConvert[hashID] = { label, left, width, track, label_type, eventPercents, trackType,idx }

        newLabels[hashID] = {
            "deleted": false,
            "author":author,
            "label_text": label,
            "label_start_percent": trackType =="segment" ? left: null,
            "label_end_percent": trackType =="segment" ? width! + left! : null,
            "label_start_frame": trackType =="segment" ? start_frame : null,
            "label_end_frame": trackType =="segment" ? end_frame : null,
            "label_num_frames": trackType =="segment" ? num_frames: null,
            "created_at_datetime": "TO_FILL_IN",
            "thumbs": {},
            "label_type": label_type,
            "track_type": trackType,
            "event_percents": trackType === "event" ? eventPercents : null,
        }
    }

    


    const body: LabelsExport = {
        new_timeline_labels: newLabels,
        move_num_frames: g.MODEL3D.anim.maxFrame,
    }

    await fetch(`${g.BACKEND_URL}/labelling/${g.MOVE_ORG_NAME}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
        .then(isOk)
        .then(async () => {
            alert(`Labels for '${g.MOVE_ORG_NAME}' saved successfully`)
            // Object.keys(toConvert).forEach((hashID) => {
            //     const { label, left, width, track, label_type, eventPercents, trackType, idx } = toConvert[hashID];
            //     addOldTracks({
            //         labellerDiv: lg.TRACKS_DIV, 
            //         idx: Number.parseInt(idx), 
            //         start: left, 
            //         width: width, 
            //         label: label, 
            //         author: author, 
            //         thumbs: {}, 
            //         labelType: label_type, 
            //         trackType: trackType, 
            //         deleted: false, 
            //         hashID: hashID,
            //         eventPercents: eventPercents,
            //     })
            //     // console.log(track)
            // })
            lg.TRACKS_DIV.innerHTML = "";
            await importLabels(g.MOVE_ORG_NAME, g.MODEL3D.anim.maxFrame)
            
            // set labelling status to in progress if it is "-"
            if (getLabellingStatus() === "-") {
                setLabellingStatus("in_progress", true)
            }
            
        })
        .catch((e) => {
            console.error(e)
            alert("Error saving labels")
        })
}




