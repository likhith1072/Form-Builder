import express from 'express';
import { create } from '../controllers/form.controller.js';
import { getforms } from '../controllers/form.controller.js';
import { updateform } from '../controllers/form.controller.js';
import { getform } from '../controllers/form.controller.js';
import { saveanswers } from '../controllers/form.controller.js';

const router = express.Router();

router.post('/create', create);
router.get('/getforms', getforms);
router.get('/:id', getform);
router.put('/updateform/:id', updateform);
router.post('/saveanswers/:formId', saveanswers);

export default router;