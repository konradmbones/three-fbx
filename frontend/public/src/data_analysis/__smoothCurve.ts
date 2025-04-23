export function smoothCurve(data: number[], windowSize: number) {
    const smoothedData = [];
    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = i - windowSize; j <= i + windowSize; j++) {
            if (j >= 0 && j < data.length) {
                sum += data[j];
                count++;
            }
        }
        smoothedData.push(sum / count);
    }
    return smoothedData;
}