import express from 'express';
import {
  getEnrolledCourses,
  getOrderHistory,
  getCourseContent,
  updateProgress,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/courses', getEnrolledCourses);
router.get('/orders', getOrderHistory);
router.get('/learn/:courseId', getCourseContent);
router.post('/progress', updateProgress);

export default router;
