import {lg} from "./__localGlobals";

export function setLabellerVisible(visible: boolean) {
    const div = document.getElementById("labeller-hidder") as HTMLElement;
    const disabledInfo = document.getElementById("labeller-disabled-info") as HTMLElement;
    
    function makeVisible() {
        div.classList.remove("hidden");
        disabledInfo.classList.add("hidden");
        lg.LABELLER_HIDDEN = false;

    }
    function makeHidden() {
        div.classList.add("hidden");
        disabledInfo.classList.remove("hidden");
        lg.LABELLER_HIDDEN = true;
        
    }

    if (visible) {
        makeVisible();
    } else {
        makeHidden();
    }
}