import express from 'express';
import {
  getAllBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
} from '../controllers/blockController.js';
import { validate, blockSchemas } from '../middleware/validation.js';

const router = express.Router();

// Block routes
router.get('/', getAllBlocks);
router.get('/:id', getBlockById);
router.post('/', validate(blockSchemas.create), createBlock);
router.put('/:id', validate(blockSchemas.update), updateBlock);
router.delete('/:id', deleteBlock);

export default router;
