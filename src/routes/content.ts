import express from 'express';
import {
    getLastLocation,
    postLastLocation,
    addPageBookmark,
    getPageBookmark,
    deletePageBookmark,
    getPageText,
} from '../controllers/content';
import { isLoggedInOrAppToken, isBookIdValid } from '../middlewares';

const router = express.Router();

router.get(
    '/:bookId/last',
    isLoggedInOrAppToken,
    isBookIdValid,
    getLastLocation
);
router.post(
    '/:bookId/last',
    isLoggedInOrAppToken,
    isBookIdValid,
    postLastLocation
);
router.post(
    '/:bookId/bookmark',
    isLoggedInOrAppToken,
    isBookIdValid,
    addPageBookmark
);
router.get(
    '/:bookId/bookmark',
    isLoggedInOrAppToken,
    isBookIdValid,
    getPageBookmark
);
router.delete(
    '/:bookId/bookmark',
    isLoggedInOrAppToken,
    isBookIdValid,
    deletePageBookmark
);
router.get('/:bookId', isLoggedInOrAppToken, isBookIdValid, getPageText);

export default router;
