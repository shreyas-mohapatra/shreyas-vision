import { Router } from 'express';
import {
  listFields,
  createField,
  getField,
  updateField,
  deleteField,
} from '../controllers/fields.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { fieldSchema, updateFieldSchema } from '../schemas/field.schema.js';
import { idParam } from '../schemas/compare.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', listFields);
router.post('/', validate({ body: fieldSchema }), createField);
router.get('/:id', validate({ params: idParam }), getField);
router.patch('/:id', validate({ params: idParam, body: updateFieldSchema }), updateField);
router.delete('/:id', validate({ params: idParam }), deleteField);

export default router;
