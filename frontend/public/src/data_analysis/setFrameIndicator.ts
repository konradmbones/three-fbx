import { gda } from "./__localGlobals";

export function setFrameIndicator(framePercent: number) {
    if (!gda.ENABLED || !gda.CHART) {
        return
    }
    const indicator = document.getElementById("data-analyzer-curr-frame-indicator")!;
    // get positions in the window of the x data points
    indicator.style.left = `${gda.CHART.chartArea.left + gda.CHART.chartArea.width*framePercent/100 }px`;
}