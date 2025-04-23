import { loadBVHString } from "./animation.ts";
import { g } from "./globals.ts";
import {getCookieValue} from "./helpers.ts";
import {clearMetadataViewer} from "./metadata_viewer.ts";

export function initDragNDrop() {
    const canvas = g.RENDERER.domElement;



    // Prevent the default dragover and drop events from firing
    canvas.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault();
    });


    // When a file is dropped
    canvas.addEventListener('drop', async (event: { preventDefault: () => void; dataTransfer: { files: any; }; }) => {
        event.preventDefault();

        let files = event.dataTransfer.files;

        // filter out files that are not BVHs
        const filteredFiles = [];
        for (const file of files) {
            if (file.name.endsWith(".bvh")) {
                filteredFiles.push(file);
            }
        }
        files = filteredFiles;

        if (files.length == 0) {
            return;
        }

        console.log("Dropped " + files.length + " files!");

        // Create a list of JSON objects containing the file name and contents
        const fileList = [];
        for (const file of files) {
            const contents = await file.text();
            fileList.push({
                name: file.name,
                tree: contents
            });
        }

        console.warn("Currently only one animation supported!")
        loadBVHString(fileList[0].tree, fileList[0].name);
        // TODO: clear data analysis and labeler too

    });
}
