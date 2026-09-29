const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  vivaScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'VivaSchedule', required: true, unique: true },
  subjectName: { type: String },
  labTopic: { type: String },
  questions: [{
    questionText: { type: String },
    options: [{ type: String }],
    correctIndex: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MCQQuestion', mcqQuestionSchema);
