import { GeneralLabels,LabellingStatus } from "./__types";
import { g } from "../globals";
import { isOk } from "../helpers";

export async function setLabellingStatus(newStatus: LabellingStatus, updateDb: boolean = false) {

    const f = () => {
        const labellingStatus = document.getElementById("labeller-labelling-status") as HTMLSelectElement;
        labellingStatus.value = newStatus;
        console.log("labelling status changed to", labellingStatus.value)
    }

    if (!updateDb) {
        f();
        return
    }

    const labels: GeneralLabels = {
        labelling_status: newStatus,
    }

    await fetch(`${g.BACKEND_URL}/labelling/general/${g.MOVE_ORG_NAME}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(labels),
    })
        .then(isOk)
        .then(() => {
            f();
        })
        .catch((e) => {
            console.error(e)
            alert("Error changing general labels")
        });


}