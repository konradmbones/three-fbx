// import { loadBVHUrl } from "./animation";


// export function initRetrievalAPI() {
//     // on press the sendButton, send the prompt to the retrieval API
//     document.getElementById("sendButton").addEventListener("click", () => {
//         const prompt = document.getElementById("promptInput").value;
//         // const version = document.getElementById("version").value;
//         // const vsTopK = document.getElementById("vsTopK").value;
//         // const enhance = document.getElementById("enhance").checked;
//         const version = "mongodb-openai-concatenated";
//         const vsTopK = 10;
//         const enhance = false;
//         sendToRetrievalAPI(prompt, version, vsTopK, enhance);
//     });
// }

// async function sendToRetrievalAPI(prompt, version, vsTopK, enhance) {

//         console.log("Sending request to https://animatric-retrieval-api-dev-l5vcq46x7a-lm.a.run.app");

//         let url = 'https://animatric-retrieval-api-dev-l5vcq46x7a-lm.a.run.app/t2a_phase1?'
//         url += `type=${version}`
//         url += `&return_bvh=true`
//         url += `&vector_search_top_k=${vsTopK}`
//         url += `&return_prompts=true`
//         url += `&rigged_presentation_mode=${enhance}`
        
//         let res = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 prompts: { prompt: prompt }
//             })
//         })

//         const data = await res.json();
//         console.log("Response:", data);

//         if (!res.ok || data.anims === undefined || data.anims === null) {
//             throw new Error(`'${data.finish_reason}'`);
//         }

//         let anim = data.anims[0];
//         const name = anim.name;
//         const bvh = anim.tree;
        
//         const blob = new Blob([bvh], { type: 'text/plain' });

//         await loadBVHUrl(URL.createObjectURL(blob), name);
        
        

 
// }


