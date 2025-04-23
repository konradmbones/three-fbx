import Chart from 'chart.js/auto';
import { gda } from './__localGlobals';
// @ts-ignore
import {setFrame} from '../timeline.js'

export function drawAnimationChart(datasets: { label: string, data: number[] }[], frameCount: number) {
    const myChart = document.getElementById('chart') as HTMLCanvasElement;

    // get zoom level and pan level from chart to preserve it

    if (gda.CHART) {
        gda.CHART.destroy();
    }

    const frames = Array.from({ length: frameCount }, (_, i) => i);

    gda.CHART = new Chart(
        myChart,
        {
            type: 'line',
            data: {
                labels: frames,
                datasets: datasets
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
                scales: {
                    y: {
                        type: 'linear',
                        beginAtZero: true,
                        max: 0.15
                    },
                    x: {
                        type: 'category',
                    }
                },
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
                        pan: {
                            enabled: true,
                            mode: 'y',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },

                            pinch: {
                                enabled: true
                            },
                            mode: 'y',
                            scaleMode: 'y',
                        }
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
    console.log("chart created", gda.CHART);
    (window as any).chart = gda.CHART;
}