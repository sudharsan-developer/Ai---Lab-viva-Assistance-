const VivaSchedule = require('../models/VivaSchedule');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

/**
 * parseScheduleTime — Parses vivaDate + vivaTime as IST (UTC+5:30)
 * to avoid the UTC-parse bug where "2026-08-31T14:30" is treated as UTC.
 *
 * vivaDate: "2026-08-31"
 * vivaTime: "14:30"
 * → returns a Date object representing 14:30 IST
 */
const parseScheduleTime = (vivaDate, vivaTime) => {
  // Append IST offset so JS doesn't parse as UTC
  return new Date(`${vivaDate}T${vivaTime}:00+05:30`);
};

/**
 * getScheduleStatus — Determines the live status of a schedule based on current time.
 * Returns: 'upcoming' | 'active' | 'completed'
 */
const getScheduleStatus = (schedule, now) => {
  if (schedule.status === 'completed') return 'completed';

  const start = parseScheduleTime(schedule.vivaDate, schedule.vivaTime);
  const end   = new Date(start.getTime() + schedule.duration * 60 * 1000);

  if (now >= start && now <= end) return 'active';
  if (now > end) return 'completed';   // past the window
  return 'upcoming';
};

/**
 * scheduleViva - Staff creates ONE viva schedule that is broadcast to ALL students.
 * Creates one VivaSchedule document per student.
 */
const scheduleViva = async (req, res) => {
  try {
    const { subjectId, labTopic, vivaDate, vivaTime, vivaEndTime, duration } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const allStudents = await Student.find({}).select('_id name studentId');
    if (!allStudents.length) {
      return res.status(404).json({ message: 'No students found in the database.' });
    }

    const scheduleDocs = allStudents.map((student) => ({
      studentId:    student._id,
      studentName:  student.name,
      studentRegId: student.studentId,
      staffId:      req.user.id,
      staffName:    req.user.name,
      subjectId:    subject._id,
      subjectName:  subject.name,
      labTopic,
      vivaDate,
      vivaTime,
      vivaEndTime:  vivaEndTime || '',
      duration,
      status: 'upcoming',
    }));

    const created = await VivaSchedule.insertMany(scheduleDocs);

    res.status(201).json({
      message:      `Viva scheduled successfully for all ${created.length} students.`,
      totalStudents: created.length,
      labTopic,
      vivaDate,
      vivaTime,
      duration,
      subjectName: subject.name,
    });
  } catch (error) {
    console.error('scheduleViva error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * getSchedules - Returns schedules based on user role.
 * Staff: all schedules they created.
 * Student: only their own schedules.
 *
 * KEY FIX: Uses IST-aware time parsing so upcoming→active promotion works
 * correctly regardless of server timezone.
 */
const getSchedules = async (req, res) => {
  try {
    let schedules = [];
    const now = new Date(); // UTC "now" — compared against IST-parsed schedule times

    if (req.user.role === 'staff') {
      schedules = await VivaSchedule.find({ staffId: req.user.id }).sort({ vivaDate: -1, vivaTime: -1 });
    } else if (req.user.role === 'student') {
      schedules = await VivaSchedule.find({ studentId: req.user.id }).sort({ vivaDate: -1, vivaTime: -1 });
    }

    // Auto-promote status using IST-correct time comparison
    const updatedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        const liveStatus = getScheduleStatus(schedule, now);

        if (liveStatus !== schedule.status) {
          // Only save if status actually changed
          schedule.status = liveStatus;
          await schedule.save();
          console.log(`[Schedule] ${schedule._id} → status updated to "${liveStatus}"`);
        }

        // Return a shape the frontend expects:
        // date/time aliases + correct status
        return {
          _id:         schedule._id,
          subjectName: schedule.subjectName,
          labTopic:    schedule.labTopic,
          staffName:   schedule.staffName,
          staffId:     schedule.staffId,
          studentName: schedule.studentName,
          studentId:   schedule.studentId,
          date:        schedule.vivaDate,
          time:        schedule.vivaTime,
          vivaDate:    schedule.vivaDate,
          vivaTime:    schedule.vivaTime,
          vivaEndTime: schedule.vivaEndTime || '',
          duration:    schedule.duration,
          status:      schedule.status,
          resultId:    schedule.resultId || null,
        };
      })
    );

    res.json(updatedSchedules);
  } catch (error) {
    console.error('getSchedules error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * updateScheduleStatus - Staff changes the status of a schedule batch.
 */
const updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const schedule = await VivaSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    await VivaSchedule.updateMany(
      {
        staffId:   schedule.staffId,
        labTopic:  schedule.labTopic,
        vivaDate:  schedule.vivaDate,
        vivaTime:  schedule.vivaTime,
      },
      { $set: { status } }
    );

    res.json({ message: `Status updated to '${status}' for all students in this batch.`, status });
  } catch (error) {
    console.error('updateScheduleStatus error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * deleteSchedule - Staff deletes an entire batch of schedules.
 */
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await VivaSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const result = await VivaSchedule.deleteMany({
      staffId:  schedule.staffId,
      labTopic: schedule.labTopic,
      vivaDate: schedule.vivaDate,
      vivaTime: schedule.vivaTime,
    });

    res.json({
      message: `Deleted ${result.deletedCount} schedule entries for all students in this batch.`,
    });
  } catch (error) {
    console.error('deleteSchedule error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  scheduleViva,
  getSchedules,
  updateScheduleStatus,
  deleteSchedule,
};
