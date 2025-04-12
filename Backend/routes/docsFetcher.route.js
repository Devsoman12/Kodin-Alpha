import express from 'express';
import { getDocsStructure, getDocContent } from '../controllers/docsFetcher.controller.js';

const router = express.Router();

router.get('/structure', getDocsStructure);
router.get('/:file', getDocContent);

export default router;
