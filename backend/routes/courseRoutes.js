import express from 'express';
import {
  getCourses,
  getAllCoursesAdmin,
  getCourseBySlug,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/slug/:slug', getCourseBySlug);

// Admin routes (Protected)
router.get('/admin/all', protect, adminOnly, getAllCoursesAdmin);
router.get('/id/:id', protect, adminOnly, getCourseById);
router.post('/', protect, adminOnly, createCourse);
router.put('/:id', protect, adminOnly, updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

export default router;
