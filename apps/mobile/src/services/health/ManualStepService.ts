import { format } from 'date-fns';
import { pedometerService } from './PedometerService';

class ManualStepService {
  private averageStrideLengthMeters = 0.76; // Average stride length in meters

  public async logManualSteps(date: Date, steps: number): Promise<void> {
    if (steps < 0 || steps > 100000) {
      throw new Error('Step count must be between 0 and 100,000.');
    }

    const distance = steps * this.averageStrideLengthMeters; // Calculate distance based on steps and average stride
    console.log(`Logging manual steps: Date=${format(date, 'yyyy-MM-dd')}, Steps=${steps}, Distance=${distance.toFixed(2)}m`);

    try {
      await pedometerService.manuallyLogSteps(date, steps, distance);
    } catch (error) {
      console.error('Error logging manual steps:', error);
      throw error;
    }
  }
}

export const manualStepService = new ManualStepService();