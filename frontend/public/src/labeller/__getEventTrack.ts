import { g } from "../globals";
import { makeTextareaVerticallyResizable, percentToFrame } from "../helpers";
import {lg} from "./__localGlobals";
import chroma from "chroma-js";
import { parseTrack } from "./__localHelpers";
import {setFrame} from "../timeline.js";
import { v4 as uuidv4 } from 'uuid'; 

export function __getEventTrack(args: {idx: number, eventPercents: number[], author: string, label: string, type: "old" | "new" }) : {track: HTMLTableRowElement, hashID: string} {
    const {idx, eventPercents, author, label, type} = args;
    const track = document.createElement("tr");

    (track as any).type = "event";


    const colors = chroma.scale(['#f00', '#0f0', '#00f', '#f00']).mode('hsl').colors(10);
    const color = colors[lg.COLOR_COUNTER % (colors.length - 1)];
    lg.COLOR_COUNTER += 1;

    const createEventDiv = (percent: number) => {
        return /*html*/`<div name="labeller-event" class="${lg.TRACK_SIZER_WIDTH_PX} pointer-events-auto absolute top-0  h-full grow-0 shrink-0 cursor-col-resize bg-white" style="left: ${percent}%"></div>`
    }

    track.className = `leading-[0]`;
    track.innerHTML = /*html*/`
        <td class="flex flex-col p-0 border  ${type === 'old'? 'border-gray-300' : 'border-teal-500'}  box-content shadow">

            <div class="flex flex-row gap-1 w-full items-center justify-center bg-white h-auto px-1">
                
                <!-- index -->
                <span name="labeller-index" class="text-right font-bold">${idx}</span>
                
                <!-- dragging -->
                <span class="material-symbols-outlined handle cursor-move text-gray-500 hover:text-gray-600 scale-75">drag_indicator</span>

                <!-- delete -->
                <button name="labeller-delete" class=" myicon scale-75 ">
                    <span class="material-symbols-outlined">delete</span>
                </button>

                <!-- thumb up -->
                <div class="flex flex-row ${type === 'old'? '' : 'hidden'} items-center">
                    <button name="labeller-thumb-up" class="myicon labeller-thumb-up labeller-thumb-notactive scale-75" >
                        <span class="material-symbols-outlined">thumb_up</span>
                    </button>
                    <span name="labeller-thumb-up-count" class="">TODO_FILL_IN</span>
                </div>

                <!-- thumb down -->
                <div class="flex flex-row ${type === 'old'? '' : 'hidden'} items-center">
                    <button name="labeller-thumb-down" class="p-0 cursor-pointer labeller-thumb-down labeller-thumb-notactive scale-75" >
                        <span class="material-symbols-outlined">thumb_down</span>
                    </button>
                    <span name="labeller-thumb-down-count" class="">TODO_FILL_IN</span>
                </div>

                <!-- author -->
                <span name="labeller-author" class="text-center p-1">${author}</span>

                <!-- label type (dropdown) -->
                <select name="labeller-label-type" class="myselect ${type === 'old'? 'opacity-50' : ''}" ${type === 'old'? 'disabled' : ''}>
                    ${
                        lg.LABEL_TYPES.map((labelType) => {
                            return `<option value="${labelType}">${labelType}</option>`
                        }).join('\n')
                    }
                </select>

                <!-- label text -->
                <textarea name="labeller-label-text" rows="1" class="${type === 'old'? 'opacity-50' : ''} w-full h-full resize-none p-1 leading-none myinput" ${type === 'old'? 'disabled' : ''}  placeholder="Your label goes here">${label}</textarea>
            
            </div>

            <!-- timeline bars -->
            <div name="labeller-event-track" class="relative h-8 w-full ${type==='old'? 'pointer-events-none' : ''}  ${type === 'old'? 'opacity-50' : ''} " style="background-color: ${color}"> <!-- "50" is hex alpha value-->
                    ${eventPercents.map((pos) => {
                        return createEventDiv(pos);
                    }).join('\n')}
            </div>
            
        </td>
        `

         // make the textarea vertically resizable
        const textarea = track.querySelector("textarea")! as HTMLTextAreaElement;
        makeTextareaVerticallyResizable(textarea, 22);


            // on click anywhere in labeller-event-track, create an event at that position
            const eventTrack = track.querySelector("[name=labeller-event-track]") as HTMLElement;
            // on drag event, change the event's left css property
            // Set up the handler at an ancestor
            eventTrack.addEventListener("mousedown", (e) => {
                // Only act if the actual element that triggered the event
                // has a certain name (e.g. labeller-event)
                
                if (type ==='new'){
                    if( (e.target as HTMLElement).getAttribute("name") === "labeller-event") {
                        const event = e.target as HTMLElement;
                            //// on drag start change the event's left css property, however, make sure that left < 100% and left > 0
                        const elementDrag =(e: MouseEvent) => { e.preventDefault();
                            const rect = event.parentElement!.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            let newLeft = x / rect.width * 100;
                            newLeft = Math.min(Math.max(0, newLeft), 100);
                            event.style.left = `${newLeft}%`;
                            setFrame(percentToFrame(newLeft));
                        }
                        function closeDragElement() {
                            // stop moving when mouse button is released:
                            document.onmouseup = null;
                            document.onmousemove = null;
                        }
                    
                        document.onmouseup = closeDragElement;
                        document.onmousemove = elementDrag;
                    
                        // just clicking should also update the frame
                        elementDrag(e);
                    }
                    else{
                        const rect = eventTrack.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percent = x / rect.width * 100;
                        const frame = percentToFrame(percent);
                        setFrame(frame);
                        // add child event
                        eventTrack.insertAdjacentHTML("beforeend", createEventDiv(percent));
                    }
                }
                else if (type === 'old'){
                    if( (e.target as HTMLElement).getAttribute("name") === "labeller-event") {
                        const event = e.target as HTMLElement;
                        setFrame(percentToFrame(parseFloat(event.style.left)));
                    }
                }
            });



        const hashID = uuidv4();
        
        return {track, hashID};
}