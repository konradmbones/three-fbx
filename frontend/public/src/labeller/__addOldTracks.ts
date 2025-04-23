import { g } from "../globals";
import { getUsername, isOk } from "../helpers";
import { __getEventTrack } from "./__getEventTrack";
import { _getSegmentTrack } from "./__getSegmentTrack";
import { ThumbButton, ThumbsState } from "./__types";
import tippy from 'tippy.js';

async function deleteTrack(track: HTMLElement, hashID: number) {
    await fetch(`${g.BACKEND_URL}/labelling/${g.MOVE_ORG_NAME}/${hashID}`, {
        method: 'DELETE',
    })
    .then(isOk)
    .then(() => markTrackDeleted(track))
    .catch((e) => {
        console.error(e)
        alert("Error deleting label")
    });
}

function markTrackDeleted(track: HTMLElement) {
    track.classList.add("opacity-30", "pointer-events-none", "grayscale", "hidden");
    // replace deleted button "labeller-delete" with text "deleted" 
    const deleted = document.createElement("div");
    deleted.classList.add("m-1", "p-1", "bg-red-500", "text-white", "text-sm", "font-bold");
    deleted.innerHTML = "DELETED";
    track.querySelector("[name=labeller-delete]")!.replaceWith(deleted);
    (track as any)._deleted = true;
}


function changeThumbCount(track: HTMLElement, oldState: ThumbsState, newState: ThumbsState) {
    if (oldState === "None" && newState === "None") {
        alert("BUG: changeThumbCount called with both oldState and newState being 'None'")
    }
    else if (oldState === "None" && newState !== "None") {
        const thumbCount = track.querySelector(`[name=labeller-thumb-${newState}-count]`)! as HTMLElement;
        thumbCount.textContent = (parseInt(thumbCount.textContent!) + 1).toString();
    } 
    else if (oldState !== "None" && newState === "None") {
        const thumbCount = track.querySelector(`[name=labeller-thumb-${oldState}-count]`)! as HTMLElement;
        thumbCount.textContent = (parseInt(thumbCount.textContent!) - 1).toString();
    }
    else {
        const thumbCount = track.querySelector(`[name=labeller-thumb-${oldState}-count]`)! as HTMLElement;
        thumbCount.textContent = (parseInt(thumbCount.textContent!) - 1).toString();
        const newCount = track.querySelector(`[name=labeller-thumb-${newState}-count]`)! as HTMLElement;
        newCount.textContent = (parseInt(newCount.textContent!) + 1).toString();
    }
}


function getTrackThumbState(track: HTMLElement) : ThumbsState {
    const up = track.querySelector(`[name=labeller-thumb-up]`)! as HTMLElement;
    const down = track.querySelector(`[name=labeller-thumb-down]`)! as HTMLElement;
    if (up.classList.contains("labeller-thumb-notactive") && down.classList.contains("labeller-thumb-notactive")) {
        return "None";
    }
    else if (up.classList.contains("labeller-thumb-notactive")) {
        return "down";
    }
    else {
        return "up";
    }
}

function setTrackThumbState(track: HTMLElement, newState : ThumbsState) {
    const up = track.querySelector(`[name=labeller-thumb-up]`)! as HTMLElement;
    const down = track.querySelector(`[name=labeller-thumb-down]`)! as HTMLElement;
    up.classList.add("labeller-thumb-notactive");
    down.classList.add("labeller-thumb-notactive");
    if (newState === "up") {
        up.classList.remove("labeller-thumb-notactive");
    }
    else if (newState === "down") {
        down.classList.remove("labeller-thumb-notactive");
    }
}


export function addOldTracks(args : {
    labellerDiv: HTMLElement, 
    idx: number, 
    start: number | null, 
    width: number | null, 
    eventPercents: number[] | null,
    label: string, 
    author: string, 
    thumbs: { [author: string]: ThumbButton }, 
    labelType: string, 
    deleted: boolean, 
    hashID: string | null,
    trackType: "segment"| "event"
}) {
    
    const {labellerDiv, idx, start, width, eventPercents, label, author, thumbs, labelType, deleted, hashID, trackType} = args;


    let oldTrack : HTMLTableRowElement;
    let newHashID : string;
    if (trackType === "segment") {
        if (start === null || width === null) {
            throw new Error("start and width must be null for event tracks")
        }
        const {track: t, hashID : h} = _getSegmentTrack({idx, start, width, author, label, type: "old"});
        oldTrack = t;
        newHashID = h;
    }
    else if (trackType === "event") {
        if (eventPercents === null) {
            throw new Error("eventPercents must be provided for event tracks")
        }
        const {track: t, hashID : h} = __getEventTrack({idx, eventPercents, author, label, type: "old"});
        oldTrack = t;
        newHashID = h;
    }
    else{
        throw new Error("Invalid trackType")
    }


    oldTrack.setAttribute("name", "labeller-track-old");

    // overwrite hashID if it is provided
    if (hashID){
        (oldTrack as any).hashID = hashID
    }
    else {
        (oldTrack as any).hashID = newHashID
    }


    /////////////////////////////////////////////////////// DELETED STATUS

    // set label type
    const labelTypeSelect = oldTrack.querySelector("[name=labeller-label-type]") as HTMLSelectElement;
    labelTypeSelect.value = labelType;

    //// if the status is deleted, mark the track as deleted
    if (deleted) {
        markTrackDeleted(oldTrack);
    }else{
        // on delete button click, send a request to the backend to delete the label
        const deleteButton = oldTrack.querySelector("[name=labeller-delete]")! as HTMLElement;

        // show tippy tooltip with html inside asking whether the user is sure to delete the label or not.
        tippy(deleteButton, {
            content:  /*html*/`
                <div class="flex flex-col justify-center justify-items-center">
                    <p>Are you sure you want to delete this label? After you delete it will no longer be visible in Viewer. However, it will still be stored in MongoDB in rg.Labels.</p>
                    <button id="labeller-delete-yes" class="mybutton m-1">Yes</button>
                </div>
            `,
            allowHTML: true,
            interactive: true,
            trigger: 'click',
            placement: 'bottom',
            onCreate(instance) {
                (instance.popper.querySelector('#labeller-delete-yes') as HTMLElement).onclick = () => {
                    deleteTrack(oldTrack, (oldTrack as any).hashID);
                    instance.hide();
                }
            },
        });
        
        // deleteButton.addEventListener("click", async () => {

            

        //     await fetch(`${g.BACKEND_URL}/labelling/${g.MOVE_ORG_NAME}/${idx}`, {
        //         method: 'DELETE',
        //     })
        //     .then(isOk)
        //     .then(() => markTrackDeleted(oldTrack))
        //     .catch((e) => {
        //         console.error(e)
        //         alert("Error deleting label")
        //     });
        // });
    }

    /////////////////////////////////////////////////////// THUMB

    

    // by default thumbs are not active
    setTrackThumbState(oldTrack, "None");

    //// Enable thumbs up and down
    ["up", "down"].forEach((thumb ) => {
        // enable the thumb button for old tracks
        const thumbButton = oldTrack.querySelector(`[name=labeller-thumb-${thumb}]`)! as HTMLElement;

        // fill in the thumb count based on the number of thumbs up or down
        const thumbCount = oldTrack.querySelector(`[name=labeller-thumb-${thumb}-count]`)! as HTMLElement;
        thumbCount.textContent = Object.values(thumbs).filter((t) => t === thumb).length.toString();

        // check if the user has already thumbed the label. If so mark it as thumbed.
        if (thumbs[getUsername()] === thumb) {
            setTrackThumbState(oldTrack, thumb as ThumbsState);
        }
        
        // on thumb up or down button click, send a request to the backend to thumb the label
        thumbButton.addEventListener("click", async () => {
            const currentState = getTrackThumbState(oldTrack);
            const newState : ThumbsState = currentState === thumb ? "None" : (thumb as ThumbButton);

            await fetch(`${g.BACKEND_URL}/labelling/thumb/${g.MOVE_ORG_NAME}/${hashID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "thumb": newState }),
            })
            .then(isOk) 
            .then(() => {setTrackThumbState(oldTrack, newState); changeThumbCount(oldTrack, currentState, newState)})
            .catch((e) => {
                console.error(e)
                alert("Error thumbing a label")
            });
        })
    });
   

    // add the new track button to the labeller
    labellerDiv.appendChild(oldTrack);
}


// function addOldTracks(TRACKS_DIV: any, arg1: number, left: number, width: number, label: string, arg5: string, arg6: boolean, arg7: {}) {
//     throw new Error("Function not implemented.");
// }