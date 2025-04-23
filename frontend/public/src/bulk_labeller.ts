import {g} from "./globals.ts"
import { isOk } from "./helpers.ts";

// class BulkLabelling(BaseModel):
//     source_move_org_name: str
//     target_move_org_name: str
//     target_move_org_names: list[str]
//     propagation_type: Literal["content", "take", "move"]

// send post requests upon button click to /labelling/bulk_labelling. use the avove class as the body of the request


const submit_many_moves = document.getElementById("submit_many_moves") as HTMLButtonElement;
const submit_same_take = document.getElementById("submit_same_take") as HTMLButtonElement;
const submit_same_content = document.getElementById("submit_same_content") as HTMLButtonElement;

const url = `${g.BACKEND_URL}/labelling/bulk_labelling/`;


type Payload = {
    source_move_org_name: string,
    target_move_org_names: string[] | null,
    propagation_type: "content" | "take" | "move",
};


const f = (url:string, payload:Payload) => {
    console.log(`Sending payload to ${url}:`, JSON.stringify(payload));
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then(isOk)
    .then((json) => {
        console.log(json);
        alert(json.message);
    })
    .catch((e) => {
        console.error(e);
        alert("Error in bulk labelling");
    });
}


submit_many_moves.addEventListener("click", () => {
    console.log("submit_many_moves clicked");
    const source_move_org_name = (document.getElementById("label-input_many_moves") as HTMLInputElement).value;
    if (source_move_org_name === "") {
        alert("No source move selected");
        return;
    }   
    const uploaded_moves: string = (document.getElementById("file-input_many_moves-output") as HTMLInputElement).innerHTML;
    console.log("uploaded_moves:", uploaded_moves.trim().replace(/<br>/g, "\n"));
    const target_move_org_names: string[] = uploaded_moves.trim().replace(/<br>/g, "\n").split("\n").filter((x) => x !== "");
    if (target_move_org_names.length === 0) {
        alert("No file selected");
        return;
    }
    const payload : Payload = {source_move_org_name, target_move_org_names, propagation_type: "move"};
    f(url, payload);
    
});



submit_same_take.addEventListener("click", () => {
    console.log("submit_same_take clicked");
    const source_move_org_name = (document.getElementById("label-input_same_take") as HTMLInputElement).value;
    if (source_move_org_name === "") {
        alert("No source move selected");
        return;
    }
    const payload : Payload = {source_move_org_name, target_move_org_names: null, propagation_type: "take"};
    f(url, payload);
});

submit_same_content.addEventListener("click", () => {
    console.log("submit_same_content clicked");
    const source_move_org_name = (document.getElementById("label-input_same_content") as HTMLInputElement).value;
    if (source_move_org_name === "") {
        alert("No source move selected");
        return;
    }
    const payload : Payload = {source_move_org_name, target_move_org_names: null, propagation_type: "content"};
    f(url, payload);
});