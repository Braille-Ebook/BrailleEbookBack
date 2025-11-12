import express from 'express';
import {
    getLastLocation,
    postLastLocation,
    addPageBookmark,
    getPageBookmark,
    deletePageBookmark,
    getPageText,
} from '../controllers/content';
import { isLoggedIn, isBookIdValid } from '../middlewares';

const router = express.Router();

router.get('/:bookId/last', isLoggedIn, isBookIdValid, getLastLocation);
router.post('/:bookId/last', isLoggedIn, isBookIdValid, postLastLocation);
router.post('/:bookId/bookmark', isLoggedIn, isBookIdValid, addPageBookmark);
router.get('/:bookId/bookmark', isLoggedIn, isBookIdValid, getPageBookmark);
router.delete(
    '/:bookId/bookmark',
    isLoggedIn,
    isBookIdValid,
    deletePageBookmark
);
router.get('/:bookId', isLoggedIn, isBookIdValid, getPageText);

export default router;
