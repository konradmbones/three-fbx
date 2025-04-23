import { g } from "./globals.ts";
import { isOk } from "./helpers.ts";

let REFCAMS_TAB: Window | null = null;

export function initShowRefcam() {
    const div = document.getElementById("show-refcam")!;
    div.innerHTML = /*html*/`
    <button id="show-refcam-button" class="mybutton">View refcam</button>
    `
    const button = document.getElementById("show-refcam-button") as HTMLButtonElement
    button.onclick = async () => {
        g.SPINNER.show("Fetching refcam paths")
        const move_org_name = g.MOVE_ORG_NAME;
        const res1 = await fetch(`${g.BACKEND_URL}/storage/refcam_paths/${move_org_name}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(isOk)
            .then(obj => {

                const errors = obj["errors"];
                if (errors.length > 0) {
                    console.error(errors);
                    alert("Errors: " + errors.join(";;; "));
                    return;
                }

                // if "signedurls" in obj. urls to gcs files
                if ("signedurls" in obj) {
                    const signedurls: { [key: string]: string[] } = obj["signedurls"];
                    const refcamsPaths: { [key: string]: string[] } = obj["refcams_paths"];
                    return { signedurls, refcamsPaths };
                }
                else {
                    // if "refcams_paths" in obj. paths to local files
                    const refcamsPaths: { [key: string]: string[] } = obj["refcams_paths"];
                    return { refcamsPaths };
                }

            }).finally(() => {
                g.SPINNER.hide("Fetching refcam paths");
            });

        if (!res1) return;


        let promises: Promise<{ type: string, video: Blob, path: string }>[] = []
        
        if ("signedurls" in res1) {
            const signedUrls = res1["signedurls"];
            const refcamPaths = res1["refcamsPaths"];
            // for each key and each signed url fetch the video
            
            for (const key in signedUrls) {
                for (let i = 0; i < signedUrls[key].length; i++) {
                    const url = signedUrls[key][i];
                    const path = refcamPaths[key][i];
                    promises.push(
                        fetch(url).then(isOk).then(v => {
                            return {
                                type: key,
                                video: v,
                                path: path
                            }
                        }
                        ))
                }
            }
        }
        else if ("refcamsPaths" in res1) {
            const refcamPaths = res1["refcamsPaths"];
            // fetch refcam videos in parallel (one raw and multiple atem)
            const url = `${g.BACKEND_URL}/storage/file/?path=`
            for (const key in res1) {
                refcamPaths[key].forEach(
                    (path: string) => promises.push(
                        fetch(url + path).then(isOk).then(v => {
                            return {
                                type: key,
                                video: v,
                                path: path
                            }
                        })
                    ))
            }
        }

        // get videos for atems and raw if they exist. keep track which is which
        g.SPINNER.show("Fetching videos")
        const videos = await Promise.all(promises)
            .catch((e) => {
                console.error(e)
                alert("Error fetching videos. Contact admin")
                return null
            })
            .finally(() => {
                g.SPINNER.hide("Fetching videos")
            })

        // reuse target
        let timeout = null
        if (REFCAMS_TAB === null || REFCAMS_TAB.closed) {
            REFCAMS_TAB = window.open("/refcams.html", "refcams")!;
            // after 1 sec load videos 
            timeout = 500
        }

        if (timeout) {
            setTimeout(() => {
                const res2 = (REFCAMS_TAB! as any).loadVideos({ videos, move_org_name })
                console.log("Refcams loaded:", res2 == "done")
                REFCAMS_TAB!.focus()
            }, timeout)
        }
        else {
            const res2 = (REFCAMS_TAB! as any).loadVideos({ videos, move_org_name })
            console.log("Refcams loaded:", res2 == "done")
            REFCAMS_TAB!.focus()
        }

    }
} 