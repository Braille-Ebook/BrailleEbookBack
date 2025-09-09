import { RequestHandler } from 'express';
import { Review, UserReviewLike } from '../models';
import { isUserOwnerOfReview } from '../services/review';

const getReviews: RequestHandler = async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            where: {
                book_id: req.params.bookId,
            },
        });
        const reviewsWithIsLiked = await Promise.all(
            reviews.map(async (r: any) => {
                const isLiked = await UserReviewLike.findOne({
                    where: {
                        user_id: req.user!.user_id, //isLoggedIn 함수로 req.user의 존재여부는 확실하기 때문에 !. 사용
                        review_id: r.review_id,
                    },
                });

                return {
                    ...r.toJSON(), // convert Sequelize instance to plain object
                    isLiked: r.user_id == req.user!.user_id ? null : !!isLiked,
                };
            })
        );
        res.status(200).send({
            success: true,
            message: '리뷰 불러오기가 성공했습니다.',
            data: reviewsWithIsLiked,
        });
    } catch (e) {
        next(e);
    }
};

const postReviews: RequestHandler = async (req, res, next) => {
    try {
        await Review.create({
            user_id: req.user!.user_id,
            book_id: req.params.bookId,
            content: req.body.content,
        });
        return res
            .status(200)
            .send({ success: true, message: '리뷰 작성을 성공했습니다.' });
    } catch (e) {
        next(e);
    }
};

const deleteReviews: RequestHandler = async (req, res, next) => {
    try {
        if (
            !(await isUserOwnerOfReview(req.user!.user_id, req.params.reviewId))
        ) {
            const error = new Error('다른 유저의 리뷰는 삭제할 수 없습니다.');
            error.status = 400;
            next(error);
        }
        await Review.destroy({
            where: {
                review_id: req.params.reviewId,
            },
        });
        return res.status(200).send({
            success: true,
            message: '리뷰 삭제를 성공했습니다.',
        });
    } catch (e) {
        next(e);
    }
};

const updateReviews: RequestHandler = async (req, res, next) => {
    try {
        if (
            !(await isUserOwnerOfReview(req.user!.user_id, req.params.reviewId))
        ) {
            const error = new Error('다른 유저의 리뷰는 수정할 수 없습니다.');
            error.status = 400;
            next(error);
        }
        await Review.update(
            {
                content: req.body.content,
            },
            {
                where: {
                    review_id: req.params.reviewId,
                },
            }
        );
        res.status(200).send({
            success: true,
            message: '리뷰 업데이트를 성공했습니다.',
        });
    } catch (e) {
        next(e);
    }
};

const likeReviews: RequestHandler = async (req, res, next) => {
    try {
        if (await isUserOwnerOfReview(req.user!.user_id, req.params.reviewId)) {
            const error = new Error(
                '자신의 리뷰에는 좋아요를 누를 수 없습니다.'
            );
            error.status = 400;
            next(error);
        }

        const existing = await UserReviewLike.findOne({
            where: {
                user_id: req.user!.user_id,
                review_id: req.params.reviewId,
            },
        });

        if (existing) {
            // Unlike
            await existing.destroy();
            await Review.decrement('like_count', {
                by: 1,
                where: { review_id: req.params.reviewId },
            });
        } else {
            //Like
            await UserReviewLike.create({
                user_id: req.user!.user_id,
                review_id: req.params.reviewId,
            });
            await Review.increment('like_count', {
                by: 1,
                where: { review_id: req.params.reviewId },
            });
        }
        res.status(200).send({
            success: true,
            message: '좋아요 누르기를 성공했습니다.',
        });
    } catch (e) {
        next(e);
    }
};

export { getReviews, postReviews, deleteReviews, updateReviews, likeReviews };
