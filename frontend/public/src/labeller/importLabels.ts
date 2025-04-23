import { g } from "../globals";
import { isOk } from "../helpers";
import { addOldTracks } from "./__addOldTracks";
import {lg} from "./__localGlobals";
import { setLabellerVisible } from "./setLabellerVisible";
import { LabelsImport } from "./__types";
import { getNewTracks } from "./__localHelpers";
import { setLabellingStatus } from "./__setLabellingStatus";


export async function importLabels(move_org_name: string, currMaxFrame:number) : Promise<boolean> {
    if (!lg.LABELLER_ENABLED) {
        return false
    }

    //// dont load labels for the default idle
    if (move_org_name === g.DEFAULT_STARTING_IDLE_NAME) {
        console.log("Not loading labels for the default idle")
        return false
    }

    // first time the labeller is enabled
    if (lg.LABELLER_HIDDEN) {
        setLabellerVisible(true);
    }


    //// clear the tracks
    lg.TRACKS_DIV.innerHTML = "";

    g.SPINNER.show("Importing labels");
    let url = `${g.BACKEND_URL}/labelling/${move_org_name}`;
    const res: LabelsImport = await fetch(url)
        .then(isOk)
        .catch((e) => {
            console.error(e)
            alert("Error loading labels")
        })
        .finally(() => {
            g.SPINNER.hide("Importing labels");
        });


    //// assert the move_num_frames equals the maxFrame
    if (res.move_num_frames && res.move_num_frames != currMaxFrame) {
        alert(`
            ERROR! The number of frames has probably changed since the last labelling.
            The number of frames from the last labeling is '${res.move_num_frames}' and the current animation is '${currMaxFrame}'. 
            Contact the admin.
        `)
        return false
    }

    
    ///// add old tracks
    const labels = Object.entries(res.timeline_labels);
    let i = 1;
    for (const [hashID, label] of labels) {
        addOldTracks({
            labellerDiv: lg.TRACKS_DIV, 
            idx: i, 
            start: label.track_type === "segment" ? label.label_start_percent : null, 
            width: label.track_type === "segment" ? label.label_end_percent! - label.label_start_percent! : null,
            eventPercents: label.track_type === "event" ? label.event_percents : null,
            label: label.label_text, 
            author: label.author, 
            thumbs: label.thumbs, 
            labelType: label.label_type, 
            trackType: label.track_type , // backwards compatibility
            deleted: label.deleted,
            hashID: hashID,
        });
        i++;
    }

    function importGeneralLabels() {
        setLabellingStatus(res.general_labels.labelling_status || "-");
    }

    importGeneralLabels();


    return true
}