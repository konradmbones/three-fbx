import { g } from "../globals.ts"
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import {gda} from "./__localGlobals.ts";
import { calculateMotionAttributes } from "./createTimeseries.ts";
// @ts-ignore
import {setFrame} from '../timeline.js'
import tippy from "tippy.js";
import { isOk } from "../helpers.ts";
import { ChartJSDataset } from "./__localTypes.ts";
import { calculateKeyPoses } from "./__calculateTimeseriesEvents.ts";
import { drawFrontend } from "./__drawFrontend.ts";
import { min } from "three/examples/jsm/nodes/Nodes.js";

Chart.register(
    annotationPlugin,
    zoomPlugin
);


function hideAllDatasets() {
    if (!gda.CHART) return;
    const datasetNum = gda.CHART.data.datasets.length;
    for (let i = 0; i < datasetNum; i++) {
        gda.CHART.setDatasetVisibility(i, false)
        gda.DATASET_VISIBLITIES[i] = false;
    }
    gda.CHART.update();
}

function showAllDatasets() {
    if (!gda.CHART) return;
    const datasetNum = gda.CHART.data.datasets.length;
    for (let i = 0; i < datasetNum; i++) {
        gda.CHART.setDatasetVisibility(i, true)
        gda.DATASET_VISIBLITIES[i] = true;
    }
    gda.CHART.update();
}


export function initDataAnalyzer() {
    const dataAnalyzer = document.getElementById('data-analyzer')!;
    dataAnalyzer.className = "p-2 h-full w-full  flex flex-col gap-1";
    dataAnalyzer.innerHTML = /*html*/`
        <div class="hidden flex flex-row gap-2 flex-initial grow-0 shrink-0 items-center    ">
            <select class="myselect" id="data-analyzer-dataset-picker">
                <option value="volvo">Choose data to plot...</option>
            </select>

            <div>
                <button id="chart-hideall" type="button" class="mybutton">Hide all</button>
                <button id="chart-showall" type="button" class="mybutton">Show all</button>
            </div>
            
            <div class="grow"></div>


            <!-- checkbox "curve smoothing"-->
            <div class="mycheckbox">
                <label for="curve-smoothing">curve smoothing</label>
                <input spellcheck="false"  type="checkbox" id="curve-smoothing" name="curve-smoothing">
            </div>

            <!-- curve smoothing window size -->
            <div>
                <label for="curve-smoothing-window-size">window size</label>
                <input spellcheck="false"  class="myinput" type="number" id="curve-smoothing-window-size" name="curve-smoothing-window-size" min="1" max="100" value="5">
            </div>

            <!-- checkbox "fitheight"-->
            <div class="mycheckbox">
                <label for="fitheight">fitheight</label>
                <input spellcheck="false"  type="checkbox" id="fitheight" name="fitheight">
            </div>

            <div>
                <button id="data-analyzer-keypose-detect" class="mybutton">Keypose detect</button>
            </div>

        </div>
        <div class="hidden relative h-full w-full grow shrink">
            <canvas class="h-full w-full"  id="chart"></canvas>
            <div id="data-analyzer-curr-frame-indicator" class="absolute w-[1px] h-full top-0 bg-black/20 pointer-events-none"></div>
        </div>
        <button id="data-analyzer-enable" class="mybutton">Enable data analysis module</button>
    `
    // register onclick events
    document.getElementById("chart-hideall")!.onclick = hideAllDatasets;
    document.getElementById("chart-showall")!.onclick = showAllDatasets;


    // curve smoothing
    const curveSmoothing = document.getElementById("curve-smoothing") as HTMLInputElement;
    curveSmoothing.checked = gda.CURVE_SMOOTHING_ENABLED;
    curveSmoothing.onchange = () => {
        gda.CURVE_SMOOTHING_ENABLED = curveSmoothing.checked;
        calculateMotionAttributes(g.MODEL3D)
    }

    // curve smoothing window size
    const curveSmoothingWindowSize = document.getElementById("curve-smoothing-window-size") as HTMLInputElement;
    curveSmoothingWindowSize.value = gda.CURVE_SMOOTHING_WINDOW_SIZE.toString();
    curveSmoothingWindowSize.onchange = () => {
        gda.CURVE_SMOOTHING_WINDOW_SIZE = parseInt(curveSmoothingWindowSize.value);
        calculateMotionAttributes(g.MODEL3D)
    }

    


    // create a chart
    const myChart = document.getElementById('chart') as HTMLCanvasElement;

    const scalesTemplate = {
        y: {
            type: 'linear',
            beginAtZero: true,
            bounds : 'data',
            min: 0,
            max: undefined
        },
        x: {
            grace: 0,
            type: 'linear',
            bounds : 'data',
        }
    }
    gda.CHART = new Chart(
        myChart,
        {
            type: 'line',
            data: {
                labels:  [],
                datasets: []
            },
            options: {
                onClick: (e, activeEls) => {
                    console.log("chartonlcick event", activeEls);
                    if (activeEls.length === 0) return;

                    // set frame to selected frame
                    const frame = activeEls[0].index;
                    setFrame(frame)
                },

                // interaction: {
                //     mode: 'index'
                // },
                // resizeDelay: 100,
                maintainAspectRatio: false,
                // @ts-ignore
                scales: scalesTemplate,
                normalized: true,
                animation: false,
                spanGaps: true,
                // showLine: false,
                plugins: {
                    // title: {
                    //     display: true,
                    //     text: title
                    // },
                    zoom: {
                        // min y is 0
                        // limits:{
                        //     y: {
                        //         min: 0,
                        //     }
                        // },

                        // pan: {
                        //     enabled: true,
                        //     mode: 'y',

                        // },
                        // zoom: {
                        //     wheel: {
                        //         enabled: true,
                        //     },

                        //     pinch: {
                        //         enabled: true
                        //     },
                        //     mode: 'y',
                        //     scaleMode: 'y',
                        // }
                    }
                },
                elements: {
                    point: {
                        radius: 0, // default to disabled in all datasets
                        hitRadius: 5,
                    }
                }
            }
        }
    );
    (window as any).chart = gda.CHART;


    // fitheight
    const fitheight = document.getElementById("fitheight") as HTMLInputElement;
    fitheight.onchange = () => {
        //@ts-ignore
        scalesTemplate.y.max = fitheight.checked ? undefined : 0.015;
        //@ts-ignore
        gda.CHART!.options.scales = scalesTemplate;
        gda.CHART?.update();
    }
    fitheight.checked = true;


    // tippy.js on keypose detect button
    tippy(document.getElementById('data-analyzer-keypose-detect')!, {
        content:  /*html*/`
        <div class="grid grid-cols-2 gap-2">

           <!-- label dropdown-->
                <label for="data-analyzer-keypose-detect-timeseries">Timeseries</label>
                <input spellcheck="false"  class="myinput" type="text" id="data-analyzer-keypose-detect-timeseries" name="timeseries" placeholder="timeseries label">

           <!-- framesCompareWindow integer input -->
                <label for="framesCompareWindow">framesCompareWindow</label>
                <input spellcheck="false"  class="myinput" type="number" id="data-analyzer-keypose-detect-framesCompareWindow" name="framesCompareWindow" min="1" max="100" value="10">


           <!-- minHeightPercentDiff float input -->
                <label for="minHeightPercentDiff">minHeightPercentDiff</label>
                <input spellcheck="false"  class="myinput" type="number" id="data-analyzer-keypose-detect-minHeightPercentDiff" name="minHeightPercentDiff" min="0" max="1" value="0.05">

           <!-- animSimilarityThreshold float input -->
                <label for="animSimilarityThreshold">animSimilarityThreshold</label>
                <input spellcheck="false"  class="myinput" type="number" id="data-analyzer-keypose-detect-animSimilarityThreshold" name="animSimilarityThreshold" min="0" max="1" value="0.7">

                <button id="data-analyzer-keypose-detect-go" class="mybutton m-1">Detect keyposes</button>
        </div>
        `,
        allowHTML: true,
        interactive: true,
        trigger: 'click',
        placement: 'bottom',
        onCreate(instance) {
            (instance.popper.querySelector('#data-analyzer-keypose-detect-go') as HTMLElement).onclick = async () => {
                console.log("keypose detect")               

                const framesCompareWindow = document.getElementById('data-analyzer-keypose-detect-framesCompareWindow') as HTMLInputElement
                const minFramesDiff = document.getElementById('data-analyzer-keypose-detect-minFramesDiff') as HTMLInputElement
                const minHeightPercentDiff = document.getElementById('data-analyzer-keypose-detect-minHeightPercentDiff') as HTMLInputElement
                const animSimilarityThreshold = document.getElementById('data-analyzer-keypose-detect-animSimilarityThreshold') as HTMLInputElement


                // assert that the timeseries exists
                const timeseries = document.getElementById('data-analyzer-keypose-detect-timeseries') as HTMLInputElement
                if (!gda.DATASETS!.get(gda.SELECTED_DATASET!)!.find((dataset) => dataset.label === timeseries.value)){
                    alert("Timeseries not found")
                    return
                }

                calculateMotionAttributes(g.MODEL3D)

                //// add timeseries events to globalPosder1Mag in Mean dataset
                const keyposes: ChartJSDataset = {
                    type: 'bar',
                    label: "Key Poses",
                    data: [],
                    maxBarThickness: 4,
                }
                gda.DATASETS!.get(gda.SELECTED_DATASET!)!.forEach((dataset, i) => {
                    // if label is globalPosder1Mag calculate timeseries events
                    if (dataset.label === timeseries.value){
                        const timeseries = dataset.data
                        const newTimeseries = calculateKeyPoses(
                            timeseries,
                            parseInt(framesCompareWindow.value),
                            parseFloat(minHeightPercentDiff.value),
                            parseFloat(animSimilarityThreshold.value)
                        ) 
                        const colors = newTimeseries.map((e) => e.color);
                        const data = newTimeseries.map((e) => ({ x: e.x, y: e.y }));
                        //@ts-ignore
                        keyposes.data = data
                        // @ts-ignore
                        keyposes.backgroundColor = colors
                        //@ts-ignore    
                        keyposes.borderColor = colors
                    }
                })
                gda.DATASETS!.get(gda.SELECTED_DATASET!)!.push(keyposes)
                drawFrontend(gda.DATASETS!)

            }

            
            
        },
        
    });



    function unhideDataAnalyzer() {
        gda.ENABLED = true;
        
        const button = document.getElementById("data-analyzer-enable")!

        // unhide siblings
        let arr = Array.from(button.parentElement!.children)
        arr = arr.filter((c) => c !== button)
        arr.forEach((c) => c.classList.remove("hidden"))

        // perform data analysis
        calculateMotionAttributes(g.MODEL3D)
        
        // remove button
        button.remove();
    }

    // on pressing enable button, unhide its siblings and delete itself
    if (gda.ENABLE_BY_DEFAULT) {
        unhideDataAnalyzer()
    }
    else{
        document.getElementById("data-analyzer-enable")!.onclick = unhideDataAnalyzer
    }
}






