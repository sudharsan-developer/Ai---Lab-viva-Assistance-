const mongoose = require('mongoose');

const vivaScheduleSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String },
  studentRegId: { type: String },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  staffName: { type: String },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  subjectName: { type: String },
  labTopic: { type: String, required: true },
  vivaDate:    { type: String, required: true },
  vivaTime:    { type: String, required: true },      // start time HH:MM
  vivaEndTime: { type: String, default: '' },          // end time HH:MM
  duration:    { type: Number, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VivaSchedule', vivaScheduleSchema);
