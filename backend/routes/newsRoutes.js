import express from 'express';
import {
  getNewsEvents,
  updateNewsEvents
} from '../controllers/newsController.js';

const router = express.Router();

router.get('/', getNewsEvents);
router.post('/update', updateNewsEvents);

export default router;