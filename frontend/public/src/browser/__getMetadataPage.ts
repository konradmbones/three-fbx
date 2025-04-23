import {lg} from "./__localGlobals"
import {g} from "../globals"
import {updateMaxPages} from "./__updateMaxPages"
import {refreshBrowserTable} from "./__refreshBrowserTable"
import {isOk} from "../helpers"
import {BrowserType} from "./__types"


export async function getTablePage() {
    //// if there is already a request being made, abort it
    if (lg.CONTROLLER) {
        lg.CONTROLLER.abort();
    }

    //// create new controller and signal
    lg.CONTROLLER = new AbortController();
    lg.SIGNAL = lg.CONTROLLER.signal;

    
    g.SPINNER.show()
    lg.ISPROCESSINGFILTER = true;


    // add basepath
    const query = lg.SOURCE == "localpaths"  ?  `${lg.QUERY_BASEPATH}.*${lg.QUERY}` : lg.QUERY; 

    let url:string;
    url = `${g.BACKEND_URL}/storage/pages/?` +
        `source=${lg.SOURCE}&` +
        `page=${lg.PAGE}&` +
        `perpage=${lg.PERPAGE}&` +
        // `dirpath=${lg.DIRPATH}&` +
        `query=${query}&` +
        `sortbydate=${lg.SORTBYDATE}`

    
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        signal: lg.SIGNAL
    })
        .then(isOk)
        .then(data => {
            updateMaxPages(data.total);
            return data.result;
        })
        .catch(err => {
            // Check if the request was aborted
            if (err.name === 'AbortError') {
                console.log('Fetch aborted');
                return "Fetch aborted"
            }
            console.error(err);
            alert(err)
            return [{ Error: "An error occurred while fetching data"}];
        })
        .finally(() => {
            g.SPINNER.hide();
            lg.ISPROCESSINGFILTER = false;
        });

    if (res === "Fetch aborted") {
        return;
    }


    // assert is list
    if (!Array.isArray(res)) {
        alert("Browser Error: Expected array of objects. Contact admin")
        return;
    }

    // is empty
    if (res.length === 0) {
        // alert("No results found")
        refreshBrowserTable(["No results found"], [{ "No results found": "No results found" }])
    } else {
        //// keys to columns
        const columns = Object.keys(res[0])
        refreshBrowserTable(columns, res)
    }

}