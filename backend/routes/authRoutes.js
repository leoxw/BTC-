import express from 'express';
import {
  login,
  verifySession,
  logout,
  changePassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/verify', verifySession);
router.post('/logout', logout);
router.post('/change-password', changePassword);

export default router;