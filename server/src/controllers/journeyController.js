import { HealthcareJourney } from '../models/HealthcareJourney.js';
import { logJourneyEvent } from '../utils/journeyDispatcher.js';
import { JOURNEY_STAGES } from '../config/constants.js';

export const getPatientJourneys = async (req, res, next) => {
  try {
    const journeys = await HealthcareJourney.find({ patientId: req.user._id })
      .populate('referenceId')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: journeys.length, data: journeys });
  } catch (err) {
    next(err);
  }
};

export const getJourneyById = async (req, res, next) => {
  try {
    const journey = await HealthcareJourney.findById(req.params.id)
      .populate('patientId', 'name email phone bloodGroup')
      .populate('referenceId');

    if (!journey) {
      return res.status(404).json({ success: false, message: 'Healthcare Journey not found' });
    }

    if (req.user.role === 'patient' && journey.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
    }

    res.status(200).json({ success: true, data: journey });
  } catch (err) {
    next(err);
  }
};

export const getActiveJourneySummary = async (req, res, next) => {
  try {
    const activeJourney = await HealthcareJourney.findOne({
      patientId: req.user._id,
      isCompleted: false,
      currentStage: { $ne: JOURNEY_STAGES.CANCELLED }
    })
      .populate('referenceId')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: activeJourney || null });
  } catch (err) {
    next(err);
  }
};

export const addManualEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, title, description, metadata } = req.body;

    const updated = await logJourneyEvent({
      journeyId: id,
      stage,
      title,
      description,
      actorRole: req.user.role,
      actorId: req.user._id,
      metadata
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }

    res.status(200).json({ success: true, message: 'Journey event recorded', data: updated });
  } catch (err) {
    next(err);
  }
};
