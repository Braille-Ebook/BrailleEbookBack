import express from 'express';
import { getMyInfo, getMyReviews, getMyBooks } from '../controllers/mypage';
import { isLoggedInOrAppToken } from '../middlewares';

const router = express.Router();

router.get('/info', isLoggedInOrAppToken, getMyInfo);
router.get('/reviews', isLoggedInOrAppToken, getMyReviews);
router.get('/books', isLoggedInOrAppToken, getMyBooks);

export default router;
