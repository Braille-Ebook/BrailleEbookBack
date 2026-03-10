import express from 'express';
import { getBookmarkedBooks } from '../controllers/library';
import { isLoggedInOrAppToken } from '../middlewares';

const router = express.Router();

router.get('/', isLoggedInOrAppToken, getBookmarkedBooks);

export default router;
