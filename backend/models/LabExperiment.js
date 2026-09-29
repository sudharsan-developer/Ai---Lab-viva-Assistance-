const mongoose = require('mongoose');

const labExperimentSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },   // Experiment name
  domain:      { type: String, required: true, trim: true },   // Domain / area
  staffId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  staffName:   { type: String },
  subjectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('LabExperiment', labExperimentSchema);
