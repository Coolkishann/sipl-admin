
import express from 'express';
import {
  createContact,
  exportContacts
} from '../controllers/contactController.js';

const router = express.Router();

router.post('/', createContact);
router.get('/export', exportContacts);

export default router;

