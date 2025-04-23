import { isForClientMode } from "./helpers";

let metadata:  { [key: string]: string } = {}

export function fillTwoColumnMetadata(dict: { [key: string]: string }, preprocess: boolean = true) {
    const table = document.getElementById("metadata-viewer-table")!;
    
    let keys = Object.keys(dict);

    if (isForClientMode()){
        keys = forclientView(keys);
    } 

    // (if AMASS/HumanML3D) if "dataset" is in keys, make preprocess false
    if (dict["TAKE_project"] === "AMASSHumanML3D"){
        preprocess = false;
    }
    else{
        // remove keys that start with "description" and key "dataset"
        keys = keys.filter((key) => !key.startsWith("description") && key !== "dataset")
    }

    if (preprocess){
        // put keys starting with CONTENT_ first
        keys.sort((a, b) => {
            if (a.startsWith("CONTENT_") && !b.startsWith("CONTENT_")) return -1;
            if (!a.startsWith("CONTENT_") && b.startsWith("CONTENT_")) return 1;
            return a.localeCompare(b);
        });
        // put the following keys first
        const first = [
            "CONTENT_natural_desc_1",
            "CONTENT_natural_desc_2",
            "CONTENT_natural_desc_3",
            "CONTENT_short_description",
            "CONTENT_technical_description",
            "CONTENT_short_description_2",
        ]
        keys.sort((a, b) => {
            if (first.includes(a) && !first.includes(b)) return -1;
            if (!first.includes(a) && first.includes(b)) return 1;
            return 0;
        });
        const second = [
            "MOVE_org_name",
            "MOVE_name",
        ]
        keys.sort((a, b) => {
            if (second.includes(a) && !second.includes(b)) return -1;
            if (!second.includes(a) && second.includes(b)) return 1;
            return 0;
        });
    }
        
        table.innerHTML = /*html*/`
        <colgroup>
            <col span="1" style="width: 40%">
            <col span="1" style="width: 60%;">
        </colgroup>
        <tbody>
            ${
                keys.map((key) => /*html*/`
                <tr class="border border-t-2 border-gray-100 hover:bg-gray-100 break-words text-left">
                    <td class="px-1 bg-gray-200 break-all align-top font-bold">${key}</th>
                    <td class="px-1 align-top">${dict[key]}</td>
                </tr>
                `).join("")
            }
        </tbody>

    `;

    metadata = dict;

    // const movename = document.getElementById("metadata-viewer-movename")!;
    // movename
}


function forclientView(keys: string[]){
    const allowedCols = new Set<string>([
        'MOVE_name', 
        'MOVE_org_name', 
        'MOVE_mirror',
        
        // 'MOVE_uniform_fbx_path', 
        // 'MOVE_uniform_bvh_path', 
        // 'MOVE_orig_ratio_fbx_path', 
        // 'MOVE_orig_ratio_bvh_path', 
        // 'MOVE_markers_fbx_path',
        // 'TAKE_refcam_path',
        // 'TAKE_refcam_version', 
        
        'TAKE_org_name', 
        'TAKE_date',
        'TAKE_duration_frames', 
        'TAKE_duration_time',
        'TAKE_duration_timed_display', 
        'TAKE_name',    
        
        'CONTENT_name',
        'CONTENT_natural_desc_1', 
        'CONTENT_natural_desc_2',
        'CONTENT_natural_desc_3', 
        'CONTENT_technical_description',
        'CONTENT_short_description', 
        'CONTENT_short_description_2',
        'CONTENT_1st_category_type', 
        'CONTENT_2nd_category_type',
        'CONTENT_3rd_category_type', 
        'CONTENT_all_rigplay_styles',
        'CONTENT_uniform_style', 
        'CONTENT_type_of_movement',
        'CONTENT_body_position', 
        'CONTENT_horizontal_move',
        'CONTENT_vertical_move', 
        'CONTENT_tags', 
        'CONTENT_props',
        'CONTENT_markered', 
        'CONTENT_complex_action', 
        'CONTENT_repeated_action',
        
        'ACTOR_uid', 
        'ACTOR_height_cm', 
        'ACTOR_foot_cm',
        'ACTOR_collarbone_height_cm', 
        'ACTOR_collarbone_span_cm',
        'ACTOR_elbow_span_cm', 
        'ACTOR_wrist_span_cm', 
        'ACTOR_shoulder_span_cm',
        'ACTOR_hips_height_cm', 
        'ACTOR_hips_bones_span_cm',
        'ACTOR_knee_height_cm', 
        'ACTOR_ankle_height_cm', 
        'ACTOR_weight_kg',
        'ACTOR_age_yr', 
        'ACTOR_gender', 
        'ACTOR_oldness', 
        'ACTOR_obese',
        'ACTOR_height', 
        'ACTOR_talent_profession', 
        'ACTOR_glasses_hat',
    ])

    // remove keys not in allowedCols
    keys = keys.filter((key) => allowedCols.has(key))

    return keys
    
}


export function clearMetadataViewer(){
    const table = document.getElementById("metadata-viewer-table")!;
    table.innerHTML = `<div class="m-1 p-1">No metadata to show.</div>`
}

export function initMetadataViewer(){
    const div = document.getElementById("metadata-viewer")!;
    div.className += " overflow-y-scroll  h-full w-full flex flex-col"
    div.innerHTML = /*html*/`
    <table id="metadata-viewer-table" class="w-full h-full mb-2 table-fixed"></table>
    `

    clearMetadataViewer()
}


export function getMetadata(){
    return metadata;
}


// export function fillMetadataViewer(data:string){
//     const span = document.getElementById("metadata-viewer-data")!;
//     span.innerHTML = data
// }


// <div id="metadata-viewer-currmove" class="p-1 self-center break-all bg-teal-500/20 w-full flex flex-col">
// <span id="metadata-viewer-currmove-moveorgname">MON: move_org_name.bvh </span>
// <span id="metadata-viewer-currmove-movename">MN: move_name</span>
// </div>