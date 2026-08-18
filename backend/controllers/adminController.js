import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Mark from '../models/Mark.js';

// @desc    Get all registered students with enrollment metrics
// @route   GET /api/admin/students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    const enrollments = await Enrollment.find({ studentId: { $in: studentIds } })
      .populate('courseId', 'title slug subject')
      .lean();

    const marks = await Mark.find({ studentId: { $in: studentIds } })
      .populate('courseId', 'title')
      .lean();

    const studentsWithData = students.map((st) => {
      const myEnrollments = enrollments.filter((e) => e.studentId.toString() === st._id.toString());
      const myMarks = marks.filter((m) => m.studentId.toString() === st._id.toString());
      return {
        ...st,
        enrollmentsCount: myEnrollments.length,
        courses: myEnrollments.map((e) => e.courseId).filter(Boolean),
        marksCount: myMarks.length,
      };
    });

    res.status(200).json({
      success: true,
      count: studentsWithData.length,
      students: studentsWithData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching students' });
  }
};

// @desc    Manually enroll a student into a course
// @route   POST /api/admin/enrollments/manual
export const manualEnroll = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: 'Please provide studentId and courseId' });
    }

    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student is already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      progressPercentage: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error enrolling student' });
  }
};

// @desc    Assign exam / quiz marks to a student
// @route   POST /api/admin/marks
export const addMark = async (req, res) => {
  try {
    const { studentId, courseId, examTitle, marksObtained, totalMarks, remarks } = req.body;

    if (!studentId || !courseId || !examTitle || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, courseId, examTitle, and marksObtained',
      });
    }

    const mark = await Mark.create({
      studentId,
      courseId,
      examTitle,
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks) || 100,
      remarks: remarks || '',
    });

    res.status(201).json({
      success: true,
      message: 'Marks recorded successfully',
      mark,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error recording marks' });
  }
};

// @desc    Get all marks entries for admin view
// @route   GET /api/admin/marks
export const getAllMarks = async (req, res) => {
  try {
    const marks = await Mark.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching marks' });
  }
};
