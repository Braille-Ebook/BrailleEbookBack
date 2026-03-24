import express from 'express';
import {
    getBookInfo,
    addBookMark,
    deleteBookMark,
    startRead,
    getProgress,
} from '../controllers/book';
import { isLoggedInOrAppToken } from '../middlewares/index';
import { attachUserIfExists } from '../middlewares/index';

const router = express.Router();

router.get('/:bookId', attachUserIfExists, getBookInfo);
router.post('/:bookId/bookmark', isLoggedInOrAppToken, addBookMark);
router.delete('/:bookId/bookmark', isLoggedInOrAppToken, deleteBookMark);
router.post('/:bookId/start', isLoggedInOrAppToken, startRead);
router.post('/:bookId/continue', isLoggedInOrAppToken, getProgress);

export default router;
