const Staff = require('../models/Staff');
const Student = require('../models/Student');
const VivaSchedule = require('../models/VivaSchedule');
const VivaResult = require('../models/VivaResult');
const Subject = require('../models/Subject');

const getDashboard = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).select('-password');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const schedules = await VivaSchedule.find({ staffId: req.user.id });
    const results = await VivaResult.find({ staffId: req.user.id });

    const uniqueStudents = new Set();
    schedules.forEach(schedule => uniqueStudents.add(schedule.studentId.toString()));

    const studentList = [];
    for (const studentId of uniqueStudents) {
      const studentResults = results.filter(r => r.studentId.toString() === studentId);
      if (studentResults.length > 0) {
        const total = studentResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
        const avg = total / studentResults.length;
        studentList.push({
          studentId,
          studentName: studentResults[0].studentName,
          averagePercentage: avg
        });
      } else {
        const sched = schedules.find(s => s.studentId.toString() === studentId);
        studentList.push({
          studentId,
          studentName: sched ? sched.studentName : 'Unknown',
          averagePercentage: 0
        });
      }
    }

    res.json({
      staff,
      schedules,
      results,
      studentList,
      totalStudents: uniqueStudents.size,
      completedVivas: results.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getSubject = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id);
    if (!staff || !staff.subjectId) {
      return res.status(404).json({ message: 'Subject not found for this staff' });
    }
    const subject = await Subject.findById(staff.subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDashboard,
  getAllStudents,
  getSubject
};
