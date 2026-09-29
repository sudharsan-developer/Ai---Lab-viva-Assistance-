const Student = require('../models/Student');
const VivaSchedule = require('../models/VivaSchedule');
const VivaResult = require('../models/VivaResult');

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

const getDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // All schedules for this student
    const schedules = await VivaSchedule.find({ studentId: req.user.id }).sort({ vivaDate: 1 });

    // Categorise schedules
    const now = new Date();
    const upcomingVivas = schedules
      .filter(s => s.status === 'upcoming' || s.status === 'active')
      .map(s => ({
        _id: s._id,
        subjectName: s.subjectName,
        labTopic: s.labTopic,
        date: s.vivaDate,
        time: s.vivaTime,
        duration: s.duration,
        status: s.status,
      }));

    // All results for this student (sorted newest first)
    const results = await VivaResult.find({ studentId: req.user.id }).sort({ submittedAt: -1 });

    // Aggregate stats
    const totalVivasCompleted = results.length;
    const totalPercentage = results.reduce((acc, r) => acc + (r.percentage || 0), 0);
    const averagePercentage = totalVivasCompleted > 0
      ? Math.round(totalPercentage / totalVivasCompleted)
      : 0;

    // Overall performance level
    let overallPerformanceLevel = 'N/A';
    if (totalVivasCompleted > 0) {
      if (averagePercentage >= 75) overallPerformanceLevel = 'Excellent';
      else if (averagePercentage >= 50) overallPerformanceLevel = 'Good';
      else overallPerformanceLevel = 'Average';
    }

    // Per-subject performance for chart
    const subjectMap = {};
    results.forEach(r => {
      const subj = r.subjectName || 'Unknown';
      if (!subjectMap[subj]) subjectMap[subj] = { total: 0, count: 0 };
      subjectMap[subj].total += r.percentage || 0;
      subjectMap[subj].count += 1;
    });
    const subjectPerformance = Object.keys(subjectMap).map(subj => ({
      subject: subj.length > 12 ? subj.substring(0, 12) + '…' : subj,
      fullSubject: subj,
      percentage: Math.round(subjectMap[subj].total / subjectMap[subj].count),
    }));

    // Recent results for table (last 5)
    const recentResults = results.slice(0, 5).map(r => ({
      _id: r._id,
      subjectName: r.subjectName || 'N/A',
      labTopic: r.labTopic || 'N/A',
      staffName: r.staffName || 'N/A',
      date: r.submittedAt,
      score: r.score ?? r.correctAnswers ?? 0,
      totalQuestions: r.totalQuestions || 20,
      correctAnswers: r.correctAnswers ?? 0,
      incorrectAnswers: r.incorrectAnswers ?? 0,
      percentage: r.percentage ?? 0,
      performanceLevel: r.performanceLevel || 'N/A',
    }));

    // All results for scores section
    const allResults = results.map(r => ({
      _id: r._id,
      subjectName: r.subjectName || 'N/A',
      labTopic: r.labTopic || 'N/A',
      staffName: r.staffName || 'N/A',
      date: r.submittedAt,
      score: r.score ?? r.correctAnswers ?? 0,
      totalQuestions: r.totalQuestions || 20,
      correctAnswers: r.correctAnswers ?? 0,
      incorrectAnswers: r.incorrectAnswers ?? 0,
      percentage: r.percentage ?? 0,
      performanceLevel: r.performanceLevel || 'N/A',
    }));

    res.json({
      student: {
        ...student.toObject(),
        year: 2,                              // Fixed: 2nd Year
        yearLabel: '2nd Year',
      },
      totalVivasCompleted,
      averagePercentage,
      overallPerformanceLevel,
      upcomingVivas,
      recentResults,
      allResults,
      subjectPerformance,
      // Legacy fields for backward compatibility
      schedules,
      results,
      averageMarks: averagePercentage,
      performanceSummary: overallPerformanceLevel,
    });
  } catch (error) {
    console.error('[getDashboard] Error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ ...student.toObject(), year: 2, yearLabel: '2nd Year' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getDashboard, getProfile };
