import express from 'express';
import {
  analyzeCanvas,
  findSimilar,
  searchByText,
  autoSuggest,
} from '../controllers/analysisController.js';

const router = express.Router();

// Analysis routes
router.post('/canvas', analyzeCanvas);
router.get('/similar/:id', findSimilar);
router.post('/search', searchByText);
router.get('/auto-suggest/:id', autoSuggest);

export default router;
