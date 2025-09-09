import express from 'express';
import { getBookmarkedBooks } from '../controllers/library';
import { isLoggedIn } from '../middlewares';

const router = express.Router();

router.get('/', isLoggedIn, getBookmarkedBooks);

export default router;
