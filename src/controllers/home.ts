import { Request, Response, NextFunction } from 'express';
import Book from '../models/book';
import UserBookProgress from '../models/userBookProgress';

export const getRecent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userPk = req.user?.user_id;

        if (!userPk) {
            return res.status(200).json({
                success: true,
                message: '로그인하지 않은 사용자입니다.',
                data: [],
            });
        }

        const books = await UserBookProgress.findAll({
            where: { user_id: userPk },
            include: [{ model: Book }],
            order: [['updated_at', 'DESC']],
            limit: 20,
        });

        return res.status(200).json({
            success: true,
            message: '최근에 읽은 책 정보입니다.',
            data: books,
        });
    } catch (err) {
        next(err);
    }
};

// 임시 추천 로직 (인기 도서와 동일)
export const getRecommend = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const books = await Book.findAll({
            order: [['bookmark_num', 'DESC']],
            limit: 20,
        });

        return res.status(200).json({
            success: true,
            message: '추천 책 정보입니다.',
            data: books,
        });
    } catch (err) {
        next(err);
    }
};

export const getPopular = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const books = await Book.findAll({
            order: [['bookmark_num', 'DESC']],
            limit: 20,
        });

        return res.status(200).json({
            success: true,
            message: '인기 도서 정보입니다.',
            data: books,
        });
    } catch (err) {
        next(err);
    }
};

export const getNew = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const books = await Book.findAll({
            order: [['publish_date', 'DESC']],
            limit: 20,
        });

        return res.status(200).json({
            success: true,
            message: '신간 도서 정보입니다.',
            data: books,
        });
    } catch (err) {
        next(err);
    }
};

export const getByGenre = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const genre = (req.query.genre as string).trim();

        if (!genre) {
            return res.status(400).json({
                success: false,
                message: '장르가 필요합니다.',
            });
        }

        const books = await Book.findAll({
            where: { genre },
            order: [['bookmark_num', 'DESC']], //인기순으로 정렬
            limit: 20,
        });

        return res.status(200).json({
            success: true,
            message: `'${genre}' 장르의 인기 도서를 불러왔습니다.`,
            data: books,
        });
    } catch (err) {
        next(err);
    }
};
