import express from 'express';
import {
    getReviews,
    postReviews,
    deleteReviews,
    updateReviews,
    likeReviews,
} from '../controllers/review';
import {
    isLoggedInOrAppToken,
    isBookIdValid,
    isReviewIdValid,
} from '../middlewares';

const router = express.Router({ mergeParams: true });

router.get('/', isLoggedInOrAppToken, isBookIdValid, getReviews); //해당 책에 대한 리뷰 모두 get
router.post('/', isLoggedInOrAppToken, isBookIdValid, postReviews); //새 리뷰 post하기
router.delete(
    '/:reviewId',
    isLoggedInOrAppToken,
    isBookIdValid,
    isReviewIdValid,
    deleteReviews
);
router.patch(
    '/:reviewId',
    isLoggedInOrAppToken,
    isBookIdValid,
    isReviewIdValid,
    updateReviews
);
router.post(
    '/:reviewId/like',
    isLoggedInOrAppToken,
    isBookIdValid,
    isReviewIdValid,
    likeReviews
);

export default router;
