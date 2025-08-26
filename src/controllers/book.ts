import { Request, Response, NextFunction } from 'express';
import Book from '../models/book';
import UserBookProgress from '../models/userBookProgress';
import UserBookBookmark from '../models/userBookBookmark';
import sequelize from '../sequelize';

export const getBookInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const bookId = parseInt(req.params.bookId);

        if (isNaN(bookId)) {
            return res.status(400).json({
                success: false,
                message: '올바르지 않은 책 ID입니다.',
            });
        }

        const book = await Book.findByPk(bookId); //Book.findOne({where:{book_id:bookId}})

        if (!book) {
            return res.status(404).json({
                success: false,
                message: '해당 도서를 찾을 수 없습니다.',
            });
        }

        return res.status(200).json({
            success: true,
            message: '도서정보 조회 성공',
            data: book,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
};

export const addBookMark = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userPk = req.user?.user_id;
        const bookId = parseInt(req.params.bookId);

        if (!userPk) {
            return res.status(401).json({
                success: false,
                message: '로그인이 필요합니다.',
            });
        } //isLoggedIn에서 미리 걸러짐

        if (isNaN(bookId)) {
            return res.status(400).json({
                success: false,
                message: '올바르지 않은 책 ID입니다.',
            });
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: '해당 책을 찾을 수 없습니다.',
            });
        }

        await sequelize.transaction(async (tx) => {
            const [record, created] = await UserBookBookmark.findOrCreate({
                where: { user_id: userPk, book_id: bookId },
                defaults: { user_id: userPk, book_id: bookId },
                transaction: tx,
            });

            if (created) {
                await Book.increment('bookmark_num', {
                    by: 1,
                    where: { book_id: bookId },
                    transaction: tx,
                });
            }
        });

        return res.status(200).json({
            success: true,
            message: '북마크가 추가되었습니다.',
        });
    } catch (err) {
        next(err);
    }
};

export const deleteBookMark = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userPk = req.user?.user_id;
        const bookId = parseInt(req.params.bookId);

        if (!userPk) {
            return res.status(401).json({
                success: false,
                message: '로그인이 필요합니다.',
            });
        } //isLoggedIn에서 미리 걸러짐

        if (isNaN(bookId)) {
            return res.status(400).json({
                success: false,
                message: '올바르지 않은 책 ID입니다.',
            });
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: '해당 책을 찾을 수 없습니다.',
            });
        }

        let deleted = 0;
        await sequelize.transaction(async (tx) => {
            deleted = await UserBookBookmark.destroy({
                where: { user_id: userPk, book_id: bookId },
                transaction: tx,
            });
            if (deleted) {
                await Book.decrement('bookmark_num', {
                    by: 1,
                    where: { book_id: bookId },
                    transaction: tx,
                });
            }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: '북마크 되어있지 않습니다.', //북마크 안 되어있었던 경우
            });
        }

        return res.status(200).json({
            success: true,
            message: '북마크가 삭제되었습니다.',
        });
    } catch (err) {
        next(err);
    }
};

export const startRead = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userPk = req.user?.user_id;
        const bookId = parseInt(req.params.bookId);
        const force = req.query.force === 'true';

        if (!userPk) {
            return res.status(401).json({
                success: false,
                message: '로그인이 필요합니다.',
            });
        }

        if (isNaN(bookId)) {
            return res.status(400).json({
                success: false,
                message: '올바르지 않은 책 ID입니다.',
            });
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: '해당 책을 찾을 수 없습니다.',
            });
        }

        const record = await UserBookProgress.findOne({
            where: { user_id: userPk, book_id: bookId },
        });

        if (
            record &&
            (record.last_page !== 0 || record.last_char !== 0) &&
            !force
        ) {
            return res.status(409).json({
                success: false,
                message:
                    '이어 읽기 정보가 있습니다. 처음부터 읽으려면 force=true로 호출하세요.',
            });
        }

        await UserBookProgress.upsert({
            user_id: userPk,
            book_id: bookId,
            last_page: 0,
            last_char: 0,
            updated_at: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: force
                ? '읽기 정보를 초기화했습니다.'
                : '처음부터 읽기 정보입니다.',
            data: {
                page: 0,
                charIndex: 0,
            },
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const getProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userPk = req.user?.user_id;
        const bookId = parseInt(req.params.bookId);

        if (!userPk) {
            return res.status(401).json({
                success: false,
                message: '로그인이 필요합니다.',
            });
        }

        if (isNaN(bookId)) {
            return res.status(400).json({
                success: false,
                message: '올바르지 않은 책 ID입니다.',
            });
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: '해당 책을 찾을 수 없습니다.',
            });
        }

        const [record] = await UserBookProgress.findOrCreate({
            where: { user_id: userPk, book_id: bookId },
            defaults: {
                user_id: userPk,
                book_id: bookId,
                last_page: 0,
                last_char: 0,
                updated_at: new Date(),
            },
        });

        return res.status(200).json({
            success: true,
            message: '이어 읽기 정보입니다.',
            data: {
                page: record.last_page,
                charIndex: record.last_char,
            },
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};
