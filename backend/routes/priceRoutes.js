import express from 'express';
import {
  getPriceData,
  uploadPriceData
} from '../controllers/priceController.js';

const router = express.Router();

router.get('/', getPriceData);
router.post('/upload', uploadPriceData);

export default router;