import express from 'express';
import { searchBooks } from '../controllers/search';

const router = express.Router();

router.get('/books', searchBooks);

export default router;
