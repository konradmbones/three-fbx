import {lg} from "./__localGlobals.ts";
import {isOk} from "../helpers";
import {GeneralLabels, AnimFeedback, LabellingStatus} from "./__types.ts";
import {addNewTrack} from "./__addNewTrack.ts";
import {saveLabels} from "./__saveLabels.ts";
import {setLabellerVisible} from "./setLabellerVisible.ts";
//@ts-ignore
import Sortable from 'sortablejs';
import {g} from '../globals.ts';
import tippy from 'tippy.js';
import { getNewTracks } from "./__localHelpers.ts";
import { setLabellingStatus } from "./__setLabellingStatus.ts";

export function initLabeller() {

    lg.LABELLER_ENABLED = true;
    
    const div = document.getElementById("labeller")!;
    div.classList.add("m-1.5");
    div.innerHTML =  /*html*/`
    <div class="hidden" id="labeller-hidder">
        <div id="labeller-header" class="flex flex-row gap-3 pb-0.5">
            <button id="labeller-save" class="mybutton">Save new tracks</button>

            <!--
            <div >
                <label for="labeller-author">Filter author:</label>
                <select id="labeller-author" class="myselect">
                    <option value="all">all</option>
                    <option value="devel">devel</option>
                    <option value="kszyszka">kszyszka</option>
                    <option value="wpachowiak">wpachowiak</option>
                    <option value="some_other_annotator">some_other_annotator</option>
                </select>
            </div>
            -->

            <div>
                <label for="labeller-labelling-status">Labelling status:</label>
                <select id="labeller-labelling-status" class="myselect">
                    <option value="-">failed to fetch?</option>
                </select>
            </div>
            
            <div class="grow"></div>

            <!-- Anim feedback -->
            <button id="labeller-animfeedback" class="mybutton">Anim feedback</button>
        </div>

        <!-- curr frame indicator -->
        <div class="relative">
            <table class="border-separate border-spacing-y-2 table-fixed w-full">
                <tbody id="labeller-tracks"></tbody>
            </table>
            <div id="labeller-curr-frame-indicator" class="absolute w-[1px] h-full top-0 bg-black/20 pointer-events-none"></div>
        </div>


        <!-- add new -->
        <div class="flex flex-row gap gap-2 mt-1 mb-32">
            <button name="labeller-addnew-segment" class="mybutton">+ Add new segment track</button>
            <button name="labeller-addnew-event" class="mybutton">+ Add new event track</button>
        </div>

    </div>
    <div id="labeller-disabled-info" class=" p-1">
        Labeller is disabled for the default idle.
    </div>
    `

    

    // fetch settings
    fetch(`${g.BACKEND_URL}/labelling/settings`)
    .then(isOk)
    .then((settings) => {
        console.log("settings",settings)
        lg.LABEL_TYPES = settings.label_types;
        lg.ANIM_FEEDBACK_CATEGORIES = settings.anim_feedback_categories;
        lg.LABEL_STATUS = settings.labelling_status;
    }).then(() => {
    
        // populate the labelling status dropdown
        const labellingStatus = div.querySelector("#labeller-labelling-status") as HTMLSelectElement;
        labellingStatus.innerHTML = lg.LABEL_STATUS.map((status) => {
            return `<option value="${status.toLowerCase().replace(" ", "_")}">${status}</option>`
        }).join('\n');

        // tippy.js on Anim feedback
        // show tippy tooltip with html inside asking whether the user is sure to delete the label or not.
        const animFeedbackButton = div.querySelector("#labeller-animfeedback")! as HTMLElement;
        tippy(animFeedbackButton, {
            content:  /*html*/`
            <div class="flex flex-col justify-center justify-items-center gap-2">
                <p>What do you have to say about the currently displayed animation?</p>
                <div class="grid grid-cols-2 gap-2">
                    <label for="labeller-animfeedback-cat">Predefined category:</label>
                    <select id="labeller-animfeedback-cat" class="myselect text-black">
                        ${
                            lg.ANIM_FEEDBACK_CATEGORIES.map((labelType) => {
                                return `    <option value="${labelType}">${labelType}</option>`
                            }).join('\n')
                        }
                    </select>
                    
                    <p>Custom feedback:</p>
                    <textarea id="labeller-animfeedback-text" rows="2" class="w-full h-full myinput text-black" placeholder="Your feedback goes here"></textarea>

                    <button id="labeller-animfeedback-send" class="mybutton m-1">Send</button>
                </div>
            </div>
            `,
            allowHTML: true,
            interactive: true,
            trigger: 'click',
            placement: 'bottom',
            onCreate(instance) {
                (instance.popper.querySelector('#labeller-animfeedback-send') as HTMLElement).onclick = async () => {
                    console.log("Sending feedback")
                    // @router.post("/anim_feedback/{move_org_name}")
                    // def send_anim_feedback(move_org_name: str, feedback: AnimFeedback, request: Request):
                    const animfeedback: AnimFeedback = {
                        author: "TODO_FILL_IN",
                        created_at_datetime: "TODO_FILL_IN",
                        category: (instance.popper.querySelector('#labeller-animfeedback-cat') as HTMLSelectElement).value,
                        feedback: (instance.popper.querySelector('#labeller-animfeedback-text') as HTMLTextAreaElement).value,
                        move_org_name: g.MOVE_ORG_NAME,
                    }
                    await fetch(`${g.BACKEND_URL}/labelling/anim_feedback/${g.MOVE_ORG_NAME}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(animfeedback),
                    })
                    .then(isOk)
                    .then(() => {
                        alert("Feedback sent")
                        instance.hide();
                    })
                    .catch((e) => {
                        console.error(e)
                        alert("Error sending anim feedback")
                    });
                }
            },
        });
    });
    

    lg.TRACKS_DIV = div.querySelector("#labeller-tracks") as HTMLElement;

    //// disable the labeller for the default idle
    setLabellerVisible(false);

    //// make the tracks sortable, draggable
    const sortable = new Sortable(lg.TRACKS_DIV, {
        group: 'shared',
        animation: 150,
        handle: '.handle', // handle's class
        onEnd: function (evt: any) {
            console.log(evt.oldIndex, evt.newIndex);
        }
    });

    
    //// add new track button
    const addTrackButton = div.querySelector("[name=labeller-addnew-segment]")!;
    addTrackButton.addEventListener("click", () => {
        // cleanup empty children
        addNewTrack({labellerDiv: lg.TRACKS_DIV, idx: lg.TRACKS_DIV.childElementCount + 1, start: 0, width: 100, eventPercents: null, trackType: "segment"});
    })


    //// add new event track button
    const addEventTrackButton = div.querySelector("[name=labeller-addnew-event]")!;
    addEventTrackButton.addEventListener("click", () => {
        addNewTrack({labellerDiv: lg.TRACKS_DIV, idx: lg.TRACKS_DIV.childElementCount + 1, start: 0, width: 100, eventPercents: [], trackType: "event"});
    })


    //// save button
    const saveButton = div.querySelector("#labeller-save")!;
    saveButton.addEventListener("click", () => {
        saveLabels();
    })
    


    // //// filtering
    // const authorFilter = div.querySelector("#labeller-author") as HTMLSelectElement;
    // authorFilter.addEventListener("change", () => {
    //     // hide tracks that do not match the author
    //     const tracks = lg.TRACKS_DIV.querySelectorAll("tr");
    //     tracks.forEach((track) => {
    //         const author = track.querySelector("[name=labeller-author]") as HTMLElement;
    //         const isNewTrack = track.getAttribute("name") === "labeller-track-new";
    //         track.classList.add("hidden");
    //         if (
    //             !isTrackDeleted(track as HTMLElement) &&
    //             (authorFilter.value === "all" || 
    //             author.textContent === authorFilter.value ||
    //             isNewTrack)
    //         ) {
    //             track.classList.remove("hidden");
    //         } else {
    //             track.classList.add("hidden");
    //         }
    //     })
    // })

    /////////////////////////////////////////////// GENERAL LABELS
    const labellingStatus = div.querySelector("#labeller-labelling-status") as HTMLSelectElement;

    labellingStatus.addEventListener("change", async () => {
        setLabellingStatus(labellingStatus.value as LabellingStatus, true);
    })


    /////////////////////////////////////////////// UNSAVED CHANGES PROMPT
    window.addEventListener("beforeunload", function (e) {
        if (getNewTracks().length > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    //////////////////////////////////////////////// BULK LABELLER
    const bulkLabellerButton = document.getElementById("bulk-labeller")!;
    bulkLabellerButton.innerHTML = /*html*/`
        <button id="bulk-labeller" class="mybutton">Bulk labeller</button>
    `

    // open /bulk_labeller
    bulkLabellerButton.addEventListener("click", () => {
        window.open(`/bulk_labeller.html`, 'labeller');
    })

}