
import { getTablePage } from './__getMetadataPage';
import { lg } from "./__localGlobals"
import { createLocalFilesBrowser } from "./__createLocalFilesBrowser"


export function initBrowser() {
    // #v-ifdef VITE_IS_INTERNAL
    // get browser-type div and intiialize a dropdown

    // let browserType = document.getElementById("browser-type") as HTMLSelectElement;
    // browserType.outerHTML = /*html*/`
    //     <select id="browser-type" class="myselect">
    //         <option value="mongoGCS">Mongo GCS</option>
    //         <option value="localFiles" selected>Local Files</option>
    //     </select>
    // `
    // browserType.value = lg.BROWSER_TYPE
    // browserType = document.getElementById("browser-type") as HTMLSelectElement;
    // browserType.addEventListener('change', (e) => {
    //     const selected = browserType.value;
    //     lg.DIRPATH = ""
    //     lg.QUERY = ""
    //     lg.REGEX_ON = true
    //     lg.PAGE = 1

    //     if (selected == "localFiles") {
    //         createLocalFilesBrowser()
    //     }
    //     else if (selected == "mongoGCS") {
    //         createMongoGCSBrowser()
    //     }
    // })
    // #v-endif

    createLocalFilesBrowser()

    // lg.BROWSER_TYPE === "mongoGCS" ? createMongoGCSBrowser() : createLocalFilesBrowser()

    lg.CONTROLLER = new AbortController();
    lg.SIGNAL = lg.CONTROLLER.signal;
}










