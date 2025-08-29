import { RequestHandler } from 'express';
import { Book, Review, User, UserBookProgress } from '../models';

const getMyInfo: RequestHandler = async (req, res, next) => {
    const [user, numOfReview, numOfReadBooks] = await Promise.all([
        User.findByPk(req.user!.user_id, { attributes: ['nickname'] }),
        Review.count({ where: { user_id: req.user!.user_id } }),
        UserBookProgress.count({ where: { user_id: req.user!.user_id } }),
    ]);
    const result = {
        //아이디란이 없음. 아마 13번 REFACTOR에 추가될 예정인 것 같음
        nickname: user?.dataValues.nickname,
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
                include: [
                    {
                        model: UserBookProgress,
                        attributes: ['is_bookmarked'],
                        required: false,
                        where: { user_id: req.user!.user_id },
                    },
                ],
            },
        ],
    });
    const result = reviews.map((r) => ({
        reviewId: r.dataValues.review_id,
        bookId: r.dataValues.book_id,
        bookTitle: r.dataValues.Book?.dataValues.title || '(제목 없음)',
        author: r.dataValues.Book?.dataValues.author || '',
        translator: r.dataValues.Book?.dataValues.translator || '',
        likeCount: r.dataValues.like_count,
        isBookmarked: Boolean(
            r.dataValues.Book?.dataValues.UserBookProgresses?.[0]?.dataValues
                .is_bookmarked
        ),
        reviewPreview:
            r.dataValues.content.slice(0, previewLength) +
            (r.dataValues.content.length > previewLength ? '...' : ''),
    }));
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
        attributes: ['book_id', 'updated_at', 'is_bookmarked'],
        include: [
            {
                model: Book,
                attributes: ['title', 'author', 'translator'],
            },
        ],
    });
    const result = progress.map((p) => {
        const book = (p as any).Book;
        return {
            bookId: p.dataValues.book_id,
            title: book?.dataValues.title || '(제목 없음)',
            author: book?.dataValues.author || '',
            translator: book?.dataValues.translator || '',
            updatedAt: p.dataValues.updated_at,
            isBookmarked: p.dataValues.is_bookmarked,
        };
    });
    res.status(200).send({
        success: true,
        message: '책 정보 불러오기가 성공했습니다.',
        data: result,
    });
};

export { getMyInfo, getMyReviews, getMyBooks };
