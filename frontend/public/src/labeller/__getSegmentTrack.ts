import { g } from "../globals";
import { frameToPercent, makeTextareaVerticallyResizable, percentToFrame } from "../helpers";
import {lg} from "./__localGlobals";
import chroma from "chroma-js";
import { parseTrack } from "./__localHelpers";
import {setFrame} from "../timeline.js";
import { v4 as uuidv4 } from 'uuid'; 


function setFrameInputStartEnd(track:HTMLElement, frameStart: number, frameEnd: number) {
    const frameStartInput = track.querySelector("[name=labeller-frame-start]") as HTMLInputElement;
    const frameEndInput = track.querySelector("[name=labeller-frame-end]") as HTMLInputElement;
    frameStartInput.value = frameStart.toString();
    frameEndInput.value = frameEnd.toString();
}

function dragFrameRange(e: MouseEvent, segment: HTMLElement, type: "start" | "move" | "end") {
    e.preventDefault();

    // get the start, move and end divs
    const currSegLeft = parseFloat(segment.style.left);
    const currSegWidth = parseFloat(segment.style.width);
    const currSegRight = currSegLeft + currSegWidth;


    let elementDrag: (e: MouseEvent) => void;
    if (type === "start") {
        elementDrag = (e: MouseEvent) => {
            e.preventDefault();
            console.log("start")
            const rect = segment.parentElement!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            let newLeft = x / rect.width * 100;
            newLeft = Math.min(Math.max(0, newLeft), currSegRight - lg.TRACK_SIZER_MAX_DIST_PX /rect.width*100);
            segment.style.left = `${newLeft}%`;

            let newWidth = currSegWidth + currSegLeft - newLeft;
            segment.style.width = `${newWidth}%`;
            
            // set frame
            const newFrame = percentToFrame(newLeft);
            setFrame(newFrame);
            setFrameInputStartEnd((segment  as any)._parentCell, newFrame, percentToFrame(currSegRight));
        }
    }
    else if (type === "end") {
        elementDrag = (e: MouseEvent) => {
            e.preventDefault();
            console.log("end")
            const rect = segment.parentElement!.getBoundingClientRect();
            const x = e.clientX - rect.left ;

            let newWidth = x / rect.width * 100 - currSegLeft;
            newWidth = Math.min(Math.max(lg.TRACK_SIZER_MAX_DIST_PX /rect.width*100, newWidth), 100 - currSegLeft);
            segment.style.width = `${newWidth}%`;

            // set frame
            const newFrame = percentToFrame(currSegLeft + newWidth);
            setFrame(newFrame);
            setFrameInputStartEnd((segment  as any)._parentCell, percentToFrame(currSegLeft), newFrame);
        }
    }

    else {
        throw new Error("[ERROR] Segment dragMouseDown: Invalid type argument")
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











export function _getSegmentTrack(args: {
    idx: number, 
    start: number, 
    width: number, 
    author: string, 
    label: string, 
    type: "old" | "new" 
    }) : {track: HTMLTableRowElement, hashID: string} {
  
    const {idx, start, width, author, label, type} = args;

    const track = document.createElement("tr");

    (track as any).type = "segment";


    const colors = chroma.scale(['#f00', '#0f0', '#00f', '#f00']).mode('hsl').colors(10);
    const color = colors[lg.COLOR_COUNTER % (colors.length - 1)];
    lg.COLOR_COUNTER += 1;

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
            
                <!-- frame range -->
                <input spellcheck="false"  name="labeller-frame-start" type="number" class="myinput ${type === 'old'? 'opacity-50' : ''}" value="${percentToFrame(start)}" min="0" max="${g.MODEL3D.anim.maxFrame}" step="1" ${type === 'old'? 'disabled' : ''} onKeyDown="checkLength(event)">
                <input spellcheck="false"  name="labeller-frame-end" type="number" class="myinput ${type === 'old'? 'opacity-50' : ''}" value="${percentToFrame(start+width)}" min="0" max="${g.MODEL3D.anim.maxFrame}" step="1" ${type === 'old'? 'disabled' : ''} onKeyDown="checkLength(event)">
            </div>

            <!-- timeline bars -->
            <div class="relative h-8 w-full pointer-events-auto  ${type === 'old'? 'opacity-50' : ''} " style="background-color: ${color}50"> <!-- "50" is hex alpha value-->
                <div name="labeller-resizable-segment" class=' top-0 w-full h-full flex-row flex absolute' 
                        style="left: ${start}%; width: ${width}%; background-color: ${color}">
                    <div name="labeller-resizable-segment-start" class="${lg.TRACK_SIZER_WIDTH_PX} ${type === 'old'? 'cursor-pointer' : 'cursor-col-resize'}  h-full grow-0 shrink-0  bg-black/70">
                    </div>
                    <div name="labeller-resizable-segment-move" class="grow cursor-pointer "></div>
                    <div name="labeller-resizable-segment-end" class="${lg.TRACK_SIZER_WIDTH_PX} ${type === 'old'? 'cursor-pointer' : 'cursor-col-resize'} h-full grow-0 shrink-0  bg-black/70">
                    </div>
                </div>
            </div>
            
        </td>
        `

         // make the textarea vertically resizable
        const textarea = track.querySelector("textarea")! as HTMLTextAreaElement;
        makeTextareaVerticallyResizable(textarea, 22);


        //// on press 'labeller-resizable-segment-move', change g.LOOP_START and g.LOOP_END
        const segment = track.querySelector("[name=labeller-resizable-segment-move]") as HTMLDivElement;
        segment.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const {start_frame, end_frame} = parseTrack(track);

            g.FRAME = start_frame;
            g.LOOP_START = start_frame;
            g.LOOP_END = end_frame;
        }
        const f = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            g.LOOP_START = 0;
            g.LOOP_END = g.MODEL3D.anim.maxFrame;
        }
        segment.onmouseleave = f
        segment.onmouseup = f




        if (type === "new") {
            //// for each labeller-resizable-segment-X add event listener
            const resizableSegments = track.querySelectorAll("[name=labeller-resizable-segment]")!;
            resizableSegments.forEach((segment) => {
                (segment as any)._parentCell = track;
                // get the start, move and end divs
                const start = segment.querySelector("[name=labeller-resizable-segment-start]")! as HTMLElement;
                const move = segment.querySelector("[name=labeller-resizable-segment-move]")! as HTMLElement;
                const end = segment.querySelector("[name=labeller-resizable-segment-end]")! as HTMLElement;
                // on drag start change the segment's left AND width css property, however, make sure that left + width < 100% and left > 0
                start.addEventListener('mousedown', (e: MouseEvent) => {
                    dragFrameRange(e, segment as HTMLElement, "start");
                })
                // // on drag move, update the segment's left
                // move.addEventListener('mousedown', (e : MouseEvent) => {
                //     dragMouseDown(e, segment as HTMLElement, "move");
                // })
                // on drag end, update the segment's width
                end.addEventListener('mousedown', (e: MouseEvent) => {
                    dragFrameRange(e, segment as HTMLElement, "end");
                })
            })
    
    
    
            //// on changing the frame start and end, update the segment's left and width
            const frameStart = track.querySelector("[name=labeller-frame-start]") as HTMLInputElement;
            const frameEnd = track.querySelector("[name=labeller-frame-end]") as HTMLInputElement;
            const f = (which: "start" | "end") => {
    
                const isStart = which === "start";
                
                // clamp the values to be within the range 0 - maxFrame and start < end
                if (isStart){
                    if (parseFloat(frameStart.value) >= parseFloat(frameEnd.value)){
                        frameStart.value = (parseFloat(frameEnd.value) - 1).toString();
                    }
                }
                else{
                    if (parseFloat(frameEnd.value) <= parseFloat(frameStart.value)){
                        frameEnd.value = (parseFloat(frameStart.value) + 1).toString();
                    }
                }
    
                const start = frameToPercent(parseFloat(frameStart.value));;
                const end = frameToPercent(parseFloat(frameEnd.value))
    
                const width = end - start;
                const resSeg = track.querySelector("[name=labeller-resizable-segment]") as HTMLElement;
                resSeg.style.left = `${start}%`;
                resSeg.style.width = `${width}%`;
    
                isStart ? setFrame(parseFloat(frameStart.value)) : setFrame(parseFloat(frameEnd.value));
            }
            frameStart.addEventListener("change", () => f("start"))
            frameEnd.addEventListener("change", () => f("end"))
        }
        else if (type === "old") {
            // set frame on click labeller-resizable-segment-start, labeller-resizable-segment-end
            const start = track.querySelector("[name=labeller-resizable-segment-start]") as HTMLElement;
            const end = track.querySelector("[name=labeller-resizable-segment-end]") as HTMLElement;
            start.addEventListener("click", () => {
                setFrame(percentToFrame(parseFloat((track.querySelector("[name=labeller-resizable-segment]") as HTMLElement).style.left)));
            })
            end.addEventListener("click", () => {
                setFrame(percentToFrame(parseFloat((track.querySelector("[name=labeller-resizable-segment]") as HTMLElement).style.left) + parseFloat((track.querySelector("[name=labeller-resizable-segment]") as HTMLElement).style.width)));
            })
        }

        
    // assign hash value
    const hashID = uuidv4();

        return {track, hashID}
}