const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

const studentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Normalize: trim and lowercase
    const normalizedUsername = username.trim().toLowerCase();
    console.log(`[StudentLogin] Attempt: "${normalizedUsername}"`);

    const user = await Student.findOne({ username: normalizedUsername });
    if (!user) {
      console.log(`[StudentLogin] Not found: "${normalizedUsername}"`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[StudentLogin] Wrong password for: "${normalizedUsername}"`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const payload = {
      id: user._id,
      role: 'student',
      name: user.name,
      studentId: user.studentId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(`[StudentLogin] Success: "${normalizedUsername}" (${user.name})`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        username: user.username,
        department: user.department,
        year: user.year,
      },
    });
  } catch (error) {
    console.error('[StudentLogin] Server error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const staffLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    console.log(`[StaffLogin] Attempt: "${normalizedUsername}"`);

    const user = await Staff.findOne({ username: normalizedUsername });
    if (!user) {
      console.log(`[StaffLogin] Not found: "${normalizedUsername}"`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[StaffLogin] Wrong password for: "${normalizedUsername}"`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const payload = {
      id: user._id,
      role: 'staff',
      name: user.name,
      staffId: user.staffId,
      subjectId: user.subjectId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(`[StaffLogin] Success: "${normalizedUsername}" (${user.name})`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        staffId: user.staffId,
        username: user.username,
        subjectName: user.subjectName,
        subjectId: user.subjectId,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('[StaffLogin] Server error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { studentLogin, staffLogin };
