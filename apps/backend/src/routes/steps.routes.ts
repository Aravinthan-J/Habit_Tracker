/**
 * Step Routes
 * /api/steps
 */

import { Router } from 'express';
import { StepController } from '../controllers/StepController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { logStepsSchema, updateStepGoalSchema } from '../validators/step.validator';

const router = Router();

/**
 * All step routes require authentication
 */
router.use(authenticate);

router.post('/', validate(logStepsSchema), StepController.logSteps);
router.get('/', StepController.getSteps);
router.get('/today', StepController.getTodaySteps);
router.get('/stats', StepController.getStats);
router.get('/goal', StepController.getStepGoal);
router.put('/goal', validate(updateStepGoalSchema), StepController.updateStepGoal);

export default router;
