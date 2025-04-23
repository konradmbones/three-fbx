import { g } from "../globals";
import { gda } from "./__localGlobals";
import { ChartJSDataset, DatasetName } from "./__localTypes";

export function drawFrontend(datasets: Map<DatasetName, ChartJSDataset[]>) {
    // fill data-analyzer-dataset-picker with the available datasets
    const datasetPicker = document.getElementById('data-analyzer-dataset-picker') as HTMLSelectElement;
    datasetPicker.innerHTML = '';
    datasets.forEach((datasets, motionAttr) => {
        const option = document.createElement('option');
        option.value = motionAttr;
        option.text = motionAttr;
        datasetPicker.appendChild(option);
    })
    // on change event
    datasetPicker.onchange = (e) => {
        const selectedMotionAttr = (e.target as HTMLSelectElement).value;
        if (selectedMotionAttr) {
            gda.SELECTED_DATASET = selectedMotionAttr;

            // preserve visiblity of datasets
            const lengthLabels = datasets.get(gda.SELECTED_DATASET)?.length
            const isDatasetVisible: boolean[] = Array(lengthLabels).fill(true)
            gda.CHART!.data.datasets.forEach((_, i) => {
                isDatasetVisible[i] = gda.CHART!.isDatasetVisible(i)
            })
            
            // update chart
            const frames = Array.from({ length: g.MODEL3D.anim.frameCount }, (_, i) => i);
            gda.CHART!.data =  {
                labels: frames,
                datasets: datasets.get(selectedMotionAttr)!
            }
            gda.CHART!.update();

            // preserve visiblity of datasets
            gda.CHART!.data.datasets.forEach((_, i) => {
                if (!isDatasetVisible[i]){
                    gda.CHART!.hide(i)
                }
            })

        }
    }
    if (gda.SELECTED_DATASET){
        // emit event with selected dataset
        datasetPicker.value = gda.SELECTED_DATASET;
        datasetPicker.dispatchEvent(new Event('change'));
    }else{
        // emit default event
        datasetPicker.dispatchEvent(new Event('change'));
    }

    
}