const LabExperiment = require('../models/LabExperiment');
const Subject      = require('../models/Subject');

/* ─────────────────────────────────────────────────────────────
   GET /api/lab/experiments
   Returns all experiments created by the logged-in staff member
───────────────────────────────────────────────────────────── */
const getExperiments = async (req, res) => {
  try {
    const experiments = await LabExperiment
      .find({ staffId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(experiments);
  } catch (err) {
    console.error('[Lab] getExperiments error:', err.message);
    res.status(500).json({ message: 'Failed to fetch experiments.' });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/lab/experiments
   Body: { name, domain }
   Creates a new lab experiment for the logged-in staff member
───────────────────────────────────────────────────────────── */
const createExperiment = async (req, res) => {
  try {
    const { name, domain } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: 'Experiment name is required.' });
    if (!domain || !domain.trim()) return res.status(400).json({ message: 'Domain is required.' });

    // Look up the staff's associated subject
    const subject = await Subject.findOne({ staffId: req.user.id });

    const experiment = await LabExperiment.create({
      name:        name.trim(),
      domain:      domain.trim(),
      staffId:     req.user.id,
      staffName:   req.user.name,
      subjectId:   subject?._id   || null,
      subjectName: subject?.name  || '',
    });

    console.log(`[Lab] Created experiment: "${experiment.name}" by ${req.user.name}`);
    res.status(201).json(experiment);
  } catch (err) {
    console.error('[Lab] createExperiment error:', err.message);
    res.status(500).json({ message: 'Failed to create experiment.' });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/lab/experiments/:id
   Deletes a specific experiment (only if it belongs to staff)
───────────────────────────────────────────────────────────── */
const deleteExperiment = async (req, res) => {
  try {
    const experiment = await LabExperiment.findOne({
      _id:     req.params.id,
      staffId: req.user.id,
    });

    if (!experiment) return res.status(404).json({ message: 'Experiment not found.' });

    await experiment.deleteOne();
    console.log(`[Lab] Deleted experiment: "${experiment.name}" by ${req.user.name}`);
    res.json({ message: 'Experiment deleted successfully.' });
  } catch (err) {
    console.error('[Lab] deleteExperiment error:', err.message);
    res.status(500).json({ message: 'Failed to delete experiment.' });
  }
};

module.exports = { getExperiments, createExperiment, deleteExperiment };
