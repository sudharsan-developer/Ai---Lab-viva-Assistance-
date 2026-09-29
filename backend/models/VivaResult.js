const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex:  { type: Number },
  questionText:   { type: String, default: '' },   // stored for display — no re-fetch needed
  options:        [{ type: String }],               // all 4 options stored
  selectedIndex:  { type: Number, default: null },  // what student chose (null = skipped)
  correctIndex:   { type: Number },                 // correct answer index
  studentAnswer:  { type: String, default: 'Unanswered' }, // text of student's chosen option
  correctAnswer:  { type: String, default: '' },    // text of the correct option
  isCorrect:      { type: Boolean, default: false },
}, { _id: false });

const vivaResultSchema = new mongoose.Schema({
  vivaScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'VivaSchedule', required: true },
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName:    { type: String, default: '' },
  studentRegId:   { type: String, default: '' },
  staffId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  staffName:      { type: String, default: '' },    // stored flat — no populate needed
  subjectName:    { type: String, required: true }, // REQUIRED — crashes prevented
  labTopic:       { type: String, default: '' },
  vivaDate:       { type: String, default: '' },
  answers:        [answerSchema],
  totalQuestions: { type: Number, default: 20 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  score:          { type: Number, default: 0 },     // correctAnswers alias — used by frontend
  marks:          { type: Number, default: 0 },     // same value, kept for compatibility
  percentage:     { type: Number, default: 0 },
  performanceLevel: {
    type: String,
    enum: ['Excellent', 'Good', 'Average'],
    default: 'Average',
  },
  submittedAt:    { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('VivaResult', vivaResultSchema);
