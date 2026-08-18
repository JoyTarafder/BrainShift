import express from 'express';
import {
  getAllStudents,
  manualEnroll,
  addMark,
  getAllMarks,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/students', getAllStudents);
router.post('/enrollments/manual', manualEnroll);
router.get('/marks', getAllMarks);
router.post('/marks', addMark);

export default router;
