export class ConfidenceCalibrator {
  private calibrationFactor = 1.0;

  public updateCalibration(averageSuccessRate: number, averageModelConfidence: number): void {
    // If the model is 90% confident but only 50% accurate, calibration factor becomes 50/90 = 0.55
    if (averageModelConfidence > 0) {
       this.calibrationFactor = averageSuccessRate / averageModelConfidence;
    }
    
    // Cap calibration between 0.1 and 1.2
    this.calibrationFactor = Math.max(0.1, Math.min(1.2, this.calibrationFactor));
  }

  public calibrate(rawConfidence: number): number {
    return Math.min(1.0, rawConfidence * this.calibrationFactor);
  }
}
