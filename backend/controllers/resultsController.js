const VivaResult = require('../models/VivaResult');
const VivaSchedule = require('../models/VivaSchedule');
const MCQQuestion = require('../models/MCQQuestion');
const Staff = require('../models/Staff');

/**
 * submitViva — Student submits answers, marks are calculated and saved.
 * Returns the full result document so frontend can navigate directly to /student/result/:id
 */
const submitViva = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    // Fetch schedule — contains subjectName, staffId, staffName, labTopic, studentName, studentRegId
    const schedule = await VivaSchedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found.' });

    // Fetch MCQ questions (with correctIndex)
    const mcqRecord = await MCQQuestion.findOne({ vivaScheduleId: scheduleId });
    if (!mcqRecord) return res.status(404).json({ message: 'Questions not found for this schedule.' });

    // Fetch staffName from Staff model to ensure it is always populated
    let staffName = schedule.staffName || '';
    if (!staffName && schedule.staffId) {
      const staffDoc = await Staff.findById(schedule.staffId).select('name');
      if (staffDoc) staffName = staffDoc.name;
    }

    // Evaluate each answer — enrich with question text and correct answer text
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    const processedAnswers = [];

    answers.forEach((ans) => {
      const question = mcqRecord.questions[ans.questionIndex];
      if (!question) return; // safety: skip if question missing

      const isCorrect = ans.selectedIndex !== null &&
                        ans.selectedIndex !== undefined &&
                        question.correctIndex === ans.selectedIndex;

      if (isCorrect) {
        correctAnswersCount++;
      } else {
        incorrectAnswersCount++;
      }

      // Store enriched answer with text so frontend can display without re-fetching questions
      processedAnswers.push({
        questionIndex: ans.questionIndex,
        questionText: question.questionText,
        options: question.options,
        selectedIndex: ans.selectedIndex !== undefined ? ans.selectedIndex : null,
        correctIndex: question.correctIndex,
        studentAnswer: ans.selectedIndex !== null && ans.selectedIndex !== undefined
          ? question.options[ans.selectedIndex] || 'Unanswered'
          : 'Unanswered',
        correctAnswer: question.options[question.correctIndex],
        isCorrect,
      });
    });

    const totalQuestions = mcqRecord.questions.length;
    const score = correctAnswersCount;
    const percentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    let performanceLevel = 'Average';
    if (percentage >= 75) performanceLevel = 'Excellent';
    else if (percentage >= 50) performanceLevel = 'Good';

    // Build result document — ALL fields stored flat (no references to populate)
    const result = new VivaResult({
      vivaScheduleId: scheduleId,
      studentId: req.user.id,
      studentName: schedule.studentName || req.user.name || '',
      studentRegId: schedule.studentRegId || '',
      staffId: schedule.staffId || null,
      staffName,
      subjectName: schedule.subjectName || '',
      labTopic: schedule.labTopic || '',
      vivaDate: schedule.vivaDate || '',
      answers: processedAnswers,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectAnswersCount,
      score,
      marks: score,
      percentage,
      performanceLevel,
      submittedAt: new Date(),
    });

    await result.save();

    // Mark schedule as completed
    schedule.status = 'completed';
    await schedule.save();

    console.log(`[submitViva] Result saved: student=${result.studentName}, subject=${result.subjectName}, score=${score}/${totalQuestions}, id=${result._id}`);

    res.status(201).json(result);
  } catch (error) {
    console.error('[submitViva] Error:', error.message);
    res.status(500).json({ message: 'Server error while submitting viva.', error: error.message });
  }
};

/**
 * getResultDetail — Fetch a single result by ID (used by VivaResult page)
 * All data is stored flat — no populate needed.
 */
const getResultDetail = async (req, res) => {
  try {
    const result = await VivaResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found.' });
    res.json(result);
  } catch (error) {
    console.error('[getResultDetail] Error:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

/**
 * getStudentResults — All results for the logged-in student
 */
const getStudentResults = async (req, res) => {
  try {
    const results = await VivaResult.find({ studentId: req.user.id }).sort({ submittedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * getStaffResults — All results for the logged-in staff member (by staffId)
 */
const getStaffResults = async (req, res) => {
  try {
    const { studentName, subjectName, fromDate, toDate } = req.query;
    const query = { staffId: req.user.id };

    if (studentName) query.studentName = { $regex: studentName, $options: 'i' };
    if (subjectName) query.subjectName = { $regex: subjectName, $options: 'i' };
    if (fromDate || toDate) {
      query.submittedAt = {};
      if (fromDate) query.submittedAt.$gte = new Date(fromDate);
      if (toDate) query.submittedAt.$lte = new Date(toDate);
    }

    const results = await VivaResult.find(query).sort({ submittedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  submitViva,
  getStudentResults,
  getStaffResults,
  getResultDetail,
};
