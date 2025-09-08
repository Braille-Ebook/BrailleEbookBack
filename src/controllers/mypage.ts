import { RequestHandler } from 'express';
import {
    Book,
    Review,
    User,
    UserBookProgress,
    UserBookBookmark,
} from '../models';

const getMyInfo: RequestHandler = async (req, res, next) => {
    const [user, numOfReview, numOfReadBooks] = await Promise.all([
        User.findByPk(req.user!.user_id, {
            attributes: ['nickname', 'userId', 'sns_id'],
        }),
        Review.count({ where: { user_id: req.user!.user_id } }),
        UserBookProgress.count({ where: { user_id: req.user!.user_id } }),
    ]);
    const result = {
        id: user?.userId || `kakao_${user?.sns_id}`,
        nickname: user?.nickname,
        numOfReview,
        numOfReadBooks,
    };
    res.status(200).send({
        success: true,
        message: '마이페이지 정보 불러오기가 성공했습니다.',
        data: result,
    });
};

const getMyReviews: RequestHandler = async (req, res, next) => {
    const previewLength = 50;
    const reviews = await Review.findAll({
        where: {
            user_id: req.user!.user_id,
        },
        order: [['created_at', 'DESC']],
        attributes: ['review_id', 'book_id', 'like_count', 'content'],
        include: [
            {
                model: Book,
                attributes: ['title', 'author', 'translator'],
            },
        ],
    });
    const bookIds = reviews.map((p: any) => p.book_id);
    const bookmarks = await UserBookBookmark.findAll({
        where: {
            user_id: req.user!.user_id,
            book_id: bookIds,
        },
        attributes: ['book_id'],
    });
    const bookmarkedSet = new Set(bookmarks.map((b) => b.book_id));
    const result = reviews.map((r: any) => {
        return {
            reviewId: r.review_id,
            bookId: r.book_id,
            bookTitle: r.Book?.title || '(제목 없음)',
            author: r.Book?.author || '',
            translator: r.Book?.translator || '',
            likeCount: r.like_count,
            isBookmarked: bookmarkedSet.has(r.book_id),
            reviewPreview:
                r.content.slice(0, previewLength) +
                (r.content.length > previewLength ? '...' : ''),
        };
    });
    res.status(200).send({
        success: true,
        message: '리뷰 정보 불러오기가 성공했습니다.',
        data: result,
    });
};

const getMyBooks: RequestHandler = async (req, res, next) => {
    const progress = await UserBookProgress.findAll({
        where: {
            user_id: req.user!.user_id,
        },
        order: [['updated_at', 'DESC']],
        attributes: ['book_id', 'updated_at'],
        include: [
            {
                model: Book,
                attributes: ['title', 'author', 'translator'],
            },
        ],
    });
    const bookIds = progress.map((p) => p.book_id);
    const bookmarks = await UserBookBookmark.findAll({
        where: {
            user_id: req.user!.user_id,
            book_id: bookIds,
        },
        attributes: ['book_id'],
    });
    const bookmarkedSet = new Set(bookmarks.map((b) => b.book_id));
    const result = progress.map((p: any) => ({
        bookId: p.book_id,
        updatedAt: p.updated_at,
        title: p.Book?.title,
        author: p.Book?.author,
        translator: p.Book?.translator,
        isBookmarked: bookmarkedSet.has(p.book_id),
    }));
    res.status(200).send({
        success: true,
        message: '책 정보 불러오기가 성공했습니다.',
        data: result,
    });
};

export { getMyInfo, getMyReviews, getMyBooks };
