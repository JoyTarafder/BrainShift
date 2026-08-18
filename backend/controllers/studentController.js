import Enrollment from '../models/Enrollment.js';
import Order from '../models/Order.js';
import Course from '../models/Course.js';

// @desc    Get enrolled courses for logged in student
// @route   GET /api/student/courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    const courses = enrollments
      .filter((e) => e.courseId)
      .map((e) => ({
        enrollmentId: e._id,
        enrolledAt: e.enrolledAt,
        progressPercentage: e.progressPercentage,
        course: e.courseId,
      }));

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching enrolled courses',
    });
  }
};

// @desc    Get order history for logged in student
// @route   GET /api/student/orders
export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.user.id })
      .populate('courseId', 'title slug price thumbnailUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching order history',
    });
  }
};

// @desc    Get course content for enrolled student
// @route   GET /api/student/learn/:courseId
export const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'admin') {
      return res.status(200).json({
        success: true,
        isEnrolled: true,
        course,
      });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        isEnrolled: false,
        message: 'Access denied: You must be enrolled in this course to view its content',
      });
    }

    res.status(200).json({
      success: true,
      isEnrolled: true,
      enrollment,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching course content',
    });
  }
};

// @desc    Update progress percentage for enrolled course
// @route   POST /api/student/progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId, progressPercentage } = req.body;

    if (!courseId || progressPercentage === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide courseId and progressPercentage' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: req.user.id, courseId },
      { progressPercentage: Math.min(100, Math.max(0, Number(progressPercentage))) },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    res.status(200).json({
      success: true,
      progressPercentage: enrollment.progressPercentage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating progress' });
  }
};
