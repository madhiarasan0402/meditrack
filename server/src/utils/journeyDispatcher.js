import { HealthcareJourney } from '../models/HealthcareJourney.js';
import { JOURNEY_STAGES } from '../config/constants.js';

export const logJourneyEvent = async ({
  journeyId,
  stage,
  title,
  description,
  actorRole = 'system',
  actorId = null,
  metadata = {}
}) => {
  try {
    if (!journeyId) return null;

    const journey = await HealthcareJourney.findById(journeyId);
    if (!journey) {
      console.warn(`[JourneyDispatcher]: Journey ID ${journeyId} not found.`);
      return null;
    }

    if (stage && Object.values(JOURNEY_STAGES).includes(stage)) {
      journey.currentStage = stage;
      if (stage === JOURNEY_STAGES.COMPLETED) {
        journey.isCompleted = true;
      }
    }

    journey.events.push({
      stage: stage || journey.currentStage,
      title,
      description,
      timestamp: new Date(),
      actorRole,
      actorId,
      metadata: new Map(Object.entries(metadata))
    });

    await journey.save();
    return journey;
  } catch (err) {
    console.error('[JourneyDispatcher Error]:', err.message);
    return null;
  }
};
