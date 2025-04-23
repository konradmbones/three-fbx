import {lg} from "./__localGlobals"
import {g} from "../globals"
import {loadBVHString} from "../animation.ts"
import { isOk } from "../helpers.js";



export async function requestBVH({ random = false, val="" }) {

    //// if there is already a request being made, abort it
    if (lg.CONTROLLER) {
        lg.CONTROLLER.abort();
    }

    //// create new controller and signal
    lg.CONTROLLER = new AbortController();
    lg.SIGNAL = lg.CONTROLLER.signal;


    try {
        g.SPINNER.show()

        let url: string;
        url = `${g.BACKEND_URL}/storage/bvh/?random=${random}&${lg.SOURCE == "localpaths" ? "bvhpath" : "move_org_name"}=${val}` 

        const data = await fetch(url, { signal: lg.SIGNAL }).then(isOk);

        // if (data.metadata) {
        //     loadBVHString(data.tree, data.name, data.metadata)
        // }
        // else  {
        loadBVHString(data.tree, data.name,  null)
        // }

    } catch (err: any) {
        // Check if the request was aborted
        if (err.name === 'AbortError') {
            console.log('Fetch aborted');
        } else {
            alert(err);
        }
    }
    finally {
        g.SPINNER.hide();
    }
}





