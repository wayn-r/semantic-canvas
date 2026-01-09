import express from 'express';
import {
  getAllConnections,
  getConnectionById,
  createConnection,
  deleteConnection,
} from '../controllers/connectionController.js';
import { validate, connectionSchemas } from '../middleware/validation.js';

const router = express.Router();

// Connection routes
router.get('/', getAllConnections);
router.get('/:id', getConnectionById);
router.post('/', validate(connectionSchemas.create), createConnection);
router.delete('/:id', deleteConnection);

export default router;
